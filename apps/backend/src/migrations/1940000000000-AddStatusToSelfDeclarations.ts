import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusToSelfDeclarations1740000000004 implements MigrationInterface {
  name = 'AddStatusToSelfDeclarations1740000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable('self_declarations');
    if (!tableExists) {
      return;
    }

    const hasColumn = await queryRunner.hasColumn(
      'self_declarations',
      'status',
    );
    if (!hasColumn) {
      await queryRunner.query(`
        ALTER TABLE "self_declarations"
        ADD COLUMN "status" character varying NOT NULL DEFAULT 'pending'
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "self_declarations" DROP COLUMN "status"
    `);
  }
}
