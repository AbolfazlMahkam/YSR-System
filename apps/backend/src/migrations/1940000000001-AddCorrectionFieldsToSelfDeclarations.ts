import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCorrectionFieldsToSelfDeclarations1940000000001 implements MigrationInterface {
  name = 'AddCorrectionFieldsToSelfDeclarations1940000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn(
      'self_declarations',
      'correction_fields',
    );
    if (!hasColumn) {
      await queryRunner.query(`
        ALTER TABLE "self_declarations"
        ADD COLUMN "correction_fields" jsonb DEFAULT NULL
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "self_declarations" DROP COLUMN "correction_fields"
    `);
  }
}
