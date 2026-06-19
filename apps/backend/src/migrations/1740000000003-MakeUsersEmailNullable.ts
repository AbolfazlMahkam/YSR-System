import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropUsersEmailColumn1740000000003 implements MigrationInterface {
  name = 'DropUsersEmailColumn1740000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN "email"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "email" character varying NOT NULL DEFAULT ''
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ADD CONSTRAINT "UQ_users_email" UNIQUE ("email")
    `);
  }
}
