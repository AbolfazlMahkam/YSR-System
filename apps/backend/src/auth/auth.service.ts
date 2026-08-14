import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import Codes from '../entities/code.entity';
import Users from '../entities/user.entity';
import RefreshToken from '../entities/refresh-token.entity';
import { Repository, LessThan } from 'typeorm';
import { LoginByOtpDto } from './dto/login-otp.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import ms, { StringValue } from 'ms';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(Codes)
    private codeRepository: Repository<Codes>,
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async register(registerDto: RegisterDto) {
    const password = await bcrypt.hash(registerDto.password, 10);
    registerDto.password = password;
    registerDto.role = registerDto.role || 'user';
    return await this.usersService.createUser(registerDto);
  }

  async login(loginDto: LoginDto) {
    // User is preloaded and password validated by pipes
    const user = loginDto._user!;

    return this.issueTokens(user);
  }

  async loginByOtp(loginByOtpDto: LoginByOtpDto) {
    // User is preloaded by UserExistsByPhonePipe
    const user = loginByOtpDto._user!;

    if (loginByOtpDto.code) {
      // Code is already validated by OtpCodeValidationPipe
      const checkCode = loginByOtpDto._validatedCode!;

      await this.codeRepository.update(checkCode, { is_used: true });
      return this.issueTokens(user);
    } else {
      const otp = await this.generateOtpCode();
      await this.codeRepository.save({
        code: otp,
        phone: loginByOtpDto.phone,
      });
      return { code: otp };
    }
  }

  async generateOtpCode() {
    let code: number | null = null;
    while (!code) {
      const fourDigitCode = this.getRandomCode();
      const checkCode = await this.codeRepository.findOne({
        where: {
          code: fourDigitCode,
        },
      });

      if (!checkCode) {
        code = fourDigitCode;
        break;
      }
    }
    return code;
  }

  getRandomCode() {
    const min = 1000;
    const max = 9999;
    const otp = Math.floor(Math.random() * (max - min + 1)) + min;
    return otp;
  }

  async loginAsUser(userId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('User not found', 404);
    }

    return this.issueTokens(user);
  }

  async getProfile(userId: number) {
    // User ID comes from valid JWT token, so user should exist
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
    return user;
  }

  async loginWithGoogle(googleLoginDto: GoogleLoginDto) {
    try {
      // Initialize Google OAuth2 Client
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

      // Verify the Google credential
      const ticket = await client.verifyIdToken({
        idToken: googleLoginDto.credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        throw new HttpException('Invalid Google token', 401);
      }

      const { given_name, family_name, sub: googleId } = payload;

      // Check if user exists by Google ID (stored in phone field)
      let user = await this.usersService.findUserByPhone(googleId);

      // If user doesn't exist, create a new one
      if (!user) {
        user = await this.usersService.createUser({
          first_name: given_name || '',
          last_name: family_name || '',
          phone: googleId, // Store Google ID as phone
          password: await bcrypt.hash(googleId, 10), // Use Google ID as password (user won't use it)
          role: 'user',
        });
      }

      return this.issueTokens(user);
    } catch (error: unknown) {
      console.error('Google login error:', error);
      throw new HttpException(
        (error as Error).message || 'Google authentication failed',
        401,
      );
    }
  }

  /**
   * Exchanges a valid refresh token for a fresh access/refresh token pair.
   * The used refresh token is revoked (rotation) so a stolen token cannot be reused.
   */
  async refresh(rawRefreshToken: string) {
    const tokenHash = this.hashRefreshToken(rawRefreshToken);
    const stored = await this.refreshTokenRepository.findOne({
      where: { token_hash: tokenHash },
    });

    if (
      !stored ||
      stored.revoked ||
      new Date(stored.expires_at).getTime() <= Date.now()
    ) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersRepository.findOne({
      where: { id: stored.user_id },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Rotate the refresh token: revoke the used one and issue a fresh pair.
    stored.revoked = true;
    await this.refreshTokenRepository.save(stored);

    // Opportunistic cleanup of this user's expired refresh tokens.
    await this.refreshTokenRepository.delete({
      user_id: user.id,
      expires_at: LessThan(new Date()),
    });

    return this.issueTokens(user);
  }

  async logout(rawRefreshToken?: string) {
    if (rawRefreshToken) {
      const tokenHash = this.hashRefreshToken(rawRefreshToken);
      await this.refreshTokenRepository.update(
        { token_hash: tokenHash },
        { revoked: true },
      );
    }

    return { success: true };
  }

  private async issueTokens(user: Users) {
    const accessToken = this.jwtService.sign({
      sub: user.id,
      role: user.role,
    });
    const refreshToken = await this.createRefreshToken(user.id);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private async createRefreshToken(userId: number): Promise<string> {
    const rawToken = crypto.randomBytes(48).toString('hex');
    const tokenHash = this.hashRefreshToken(rawToken);
    const expiresIn = (this.configService.get<string>(
      'REFRESH_TOKEN_EXPIRES_IN',
    ) || '30d') as StringValue;
    const expiresAt = new Date(Date.now() + ms(expiresIn));

    await this.refreshTokenRepository.save({
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt,
      revoked: false,
    });

    return rawToken;
  }

  private hashRefreshToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
