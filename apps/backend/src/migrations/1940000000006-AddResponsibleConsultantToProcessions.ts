import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddResponsibleConsultantToProcessions1940000000006
  implements MigrationInterface
{
  name = 'AddResponsibleConsultantToProcessions1940000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "arbaeen_processions"
      ADD COLUMN "responsible_consultant_id" integer NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "arbaeen_processions"
      ADD CONSTRAINT "FK_arbaeen_processions_responsible_consultant"
      FOREIGN KEY ("responsible_consultant_id") REFERENCES "users"("id")
      ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "arbaeen_processions"
      DROP CONSTRAINT "FK_arbaeen_processions_responsible_consultant"
    `);

    await queryRunner.query(`
      ALTER TABLE "arbaeen_processions"
      DROP COLUMN "responsible_consultant_id"
    `);
  }
}
