import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotificationTitleToFormSchemas1740000000005 implements MigrationInterface {
    name = 'AddNotificationTitleToFormSchemas1740000000005'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "form_schemas" ADD "notification_title" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "form_schemas" DROP COLUMN "notification_title"`);
    }
}
