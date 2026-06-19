import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFormsTables1740000000000 implements MigrationInterface {
  name = 'CreateFormsTables1740000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "self_declarations" (
        "id" SERIAL NOT NULL,
        "user_id" integer NOT NULL,
        "data" jsonb NOT NULL DEFAULT '{}',
        "status" character varying NOT NULL DEFAULT 'pending',
        "admin_notes" character varying,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_self_declarations_user_id" UNIQUE ("user_id"),
        CONSTRAINT "PK_self_declarations_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "form_schemas" (
        "id" SERIAL NOT NULL,
        "slug" character varying NOT NULL,
        "title" character varying NOT NULL,
        "description" character varying,
        "fields" jsonb NOT NULL DEFAULT '[]',
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_form_schemas_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_form_schemas_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "form_submissions" (
        "id" SERIAL NOT NULL,
        "user_id" integer NOT NULL,
        "form_id" integer NOT NULL,
        "answers" jsonb NOT NULL DEFAULT '{}',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_form_submissions_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_form_submissions_user_id" ON "form_submissions" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_form_submissions_form_id" ON "form_submissions" ("form_id")
    `);

    await queryRunner.query(`
      ALTER TABLE "form_submissions"
        ADD CONSTRAINT "FK_form_submissions_user_id"
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "form_submissions"
        ADD CONSTRAINT "FK_form_submissions_form_id"
        FOREIGN KEY ("form_id") REFERENCES "form_schemas"("id") ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "form_submissions" DROP CONSTRAINT "FK_form_submissions_form_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "form_submissions" DROP CONSTRAINT "FK_form_submissions_user_id"`,
    );
    await queryRunner.query(`DROP INDEX "idx_form_submissions_form_id"`);
    await queryRunner.query(`DROP INDEX "idx_form_submissions_user_id"`);
    await queryRunner.query(`DROP TABLE "form_submissions"`);
    await queryRunner.query(`DROP TABLE "form_schemas"`);
    await queryRunner.query(`DROP TABLE "self_declarations"`);
  }
}
