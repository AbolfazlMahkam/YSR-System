import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProfileFieldsToUsers1940000000002 implements MigrationInterface {
  name = 'AddProfileFieldsToUsers1940000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasNationalCode = await queryRunner.hasColumn(
      'users',
      'national_code',
    );
    if (!hasNationalCode) {
      await queryRunner.query(`
        ALTER TABLE "users"
        ADD COLUMN "national_code" character varying(10) DEFAULT NULL
      `);
    }

    const hasBirthDate = await queryRunner.hasColumn('users', 'birth_date');
    if (!hasBirthDate) {
      await queryRunner.query(`
        ALTER TABLE "users"
        ADD COLUMN "birth_date" character varying(10) DEFAULT NULL
      `);
    }

    const hasGender = await queryRunner.hasColumn('users', 'gender');
    if (!hasGender) {
      await queryRunner.query(`
        ALTER TABLE "users"
        ADD COLUMN "gender" character varying(10) DEFAULT NULL
      `);
    }

    const hasEducation = await queryRunner.hasColumn('users', 'education');
    if (!hasEducation) {
      await queryRunner.query(`
        ALTER TABLE "users"
        ADD COLUMN "education" character varying(25) DEFAULT NULL
      `);
    }

    const hasAddress = await queryRunner.hasColumn('users', 'address');
    if (!hasAddress) {
      await queryRunner.query(`
        ALTER TABLE "users"
        ADD COLUMN "address" character varying DEFAULT NULL
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "address"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "education"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "gender"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "birth_date"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "national_code"`);
  }
}
