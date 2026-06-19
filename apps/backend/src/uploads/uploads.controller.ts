import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as crypto from 'crypto';
import { UploadsService } from './uploads.service';

const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.png': ['image/png'],
  '.gif': ['image/gif'],
  '.webp': ['image/webp'],
  '.svg': ['image/svg+xml'],
  '.pdf': ['application/pdf'],
  '.doc': ['application/msword'],
  '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  '.xls': ['application/vnd.ms-excel'],
  '.xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  '.zip': ['application/zip'],
  '.rar': ['application/vnd.rar'],
  '.txt': ['text/plain'],
};

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = path.join(process.cwd(), 'uploads');
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname).toLowerCase();
          const name = crypto.randomBytes(16).toString('hex') + ext;
          cb(null, name);
        },
      }),
      limits: {
        fileSize: 50 * 1024 * 1024,
      },
      fileFilter: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (!ALLOWED_MIME_TYPES[ext]) {
          cb(new BadRequestException(`File type "${ext}" is not allowed`), false);
          return;
        }
        if (!ALLOWED_MIME_TYPES[ext].includes(file.mimetype)) {
          cb(new BadRequestException(`MIME type "${file.mimetype}" does not match extension "${ext}"`), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('accept') accept?: string,
    @Query('maxSize') maxSize?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (accept) {
      const acceptedExts = accept.split(',').map((a) => a.trim().toLowerCase());
      const ext = path.extname(file.originalname).toLowerCase();
      const isAccepted = acceptedExts.some(
        (a) => a === ext || a === file.mimetype,
      );
      if (!isAccepted) {
        throw new BadRequestException(
          `File type "${ext}" is not in the accepted types: ${accept}`,
        );
      }
    }

    if (maxSize) {
      const maxBytes = parseInt(maxSize, 10) * 1024 * 1024;
      if (file.size > maxBytes) {
        throw new BadRequestException(
          `File size exceeds the maximum allowed size of ${maxSize}MB`,
        );
      }
    }

    return {
      url: `/uploads/${file.filename}`,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    };
  }
}
