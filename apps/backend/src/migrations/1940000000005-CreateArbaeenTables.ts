import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateArbaeenTables1940000000005 implements MigrationInterface {
  name = 'CreateArbaeenTables1940000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "arbaeen_years" (
        "id" SERIAL NOT NULL,
        "year" character varying NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_arbaeen_years_year" UNIQUE ("year"),
        CONSTRAINT "PK_arbaeen_years" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "arbaeen_processions" (
        "id" SERIAL NOT NULL,
        "year_id" integer NOT NULL,
        "name" character varying NOT NULL,
        "location" character varying NOT NULL,
        "address" text NOT NULL,
        "responsible_name" character varying NOT NULL,
        "responsible_phone" character varying NOT NULL,
        "gender_requirement" character varying NOT NULL DEFAULT 'both',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_arbaeen_processions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_arbaeen_processions_year" FOREIGN KEY ("year_id") REFERENCES "arbaeen_years"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "arbaeen_procession_consultants" (
        "id" SERIAL NOT NULL,
        "procession_id" integer NOT NULL,
        "user_id" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_arbaeen_procession_consultants" UNIQUE ("procession_id", "user_id"),
        CONSTRAINT "PK_arbaeen_procession_consultants" PRIMARY KEY ("id"),
        CONSTRAINT "FK_arbaeen_pc_procession" FOREIGN KEY ("procession_id") REFERENCES "arbaeen_processions"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_arbaeen_pc_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "arbaeen_procession_consultants"`);
    await queryRunner.query(`DROP TABLE "arbaeen_processions"`);
    await queryRunner.query(`DROP TABLE "arbaeen_years"`);
  }
}
