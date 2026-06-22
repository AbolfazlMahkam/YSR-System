import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddShowNotificationToFormSchemas1740000000004 implements MigrationInterface {
  name = 'AddShowNotificationToFormSchemas1740000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "form_schemas" ADD "show_notification" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "form_schemas" ADD "notification_text" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "form_schemas" DROP COLUMN "notification_text"`,
    );
    await queryRunner.query(
      `ALTER TABLE "form_schemas" DROP COLUMN "show_notification"`,
    );
  }
}
