import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInterviewFieldsToUsers1940000000004 implements MigrationInterface {
  name = 'AddInterviewFieldsToUsers1940000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasStatusColumn = await queryRunner.hasColumn(
      'users',
      'interview_status',
    );
    if (!hasStatusColumn) {
      await queryRunner.query(`
        ALTER TABLE "users"
        ADD COLUMN "interview_status" varchar DEFAULT NULL
      `);
    }

    const hasNotesColumn = await queryRunner.hasColumn(
      'users',
      'interview_notes',
    );
    if (!hasNotesColumn) {
      await queryRunner.query(`
        ALTER TABLE "users"
        ADD COLUMN "interview_notes" text DEFAULT NULL
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "interview_notes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "interview_status"`,
    );
  }
}
