import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddShowOnDashboardToProcessions1940000000007
  implements MigrationInterface
{
  name = 'AddShowOnDashboardToProcessions1940000000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "arbaeen_processions"
      ADD COLUMN "show_on_dashboard" boolean NOT NULL DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "arbaeen_processions"
      DROP COLUMN "show_on_dashboard"
    `);
  }
}
