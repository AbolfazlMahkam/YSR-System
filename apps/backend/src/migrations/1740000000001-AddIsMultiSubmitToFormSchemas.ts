import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsMultiSubmitToFormSchemas1740000000001 implements MigrationInterface {
  name = 'AddIsMultiSubmitToFormSchemas1740000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "form_schemas"
        ADD "is_multi_submit" boolean NOT NULL DEFAULT true
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "form_schemas" DROP COLUMN "is_multi_submit"
    `);
  }
}
