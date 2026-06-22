import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedSelfDeclarationSchema1740000000002 implements MigrationInterface {
  name = 'SeedSelfDeclarationSchema1740000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const existing = (await queryRunner.query(
      `SELECT id FROM "form_schemas" WHERE slug = 'self-declaration'`,
    )) as { id: number }[];
    if (existing.length > 0) {
      return;
    }

    await queryRunner.query(`
      INSERT INTO "form_schemas" (slug, title, description, fields, is_active, is_multi_submit)
      VALUES (
        'self-declaration',
        'اظهارنامه',
        'فرم اظهارنامه اولیه کاربران',
        '[
          {"name":"first_name","label":"نام","type":"text","required":true,"placeholder":"نام خود را وارد کنید"},
          {"name":"last_name","label":"نام خانوادگی","type":"text","required":true,"placeholder":"نام خانوادگی خود را وارد کنید"},
          {"name":"phone","label":"شماره همراه","type":"text","required":true,"placeholder":"09123456789"},
          {"name":"national_code","label":"کد ملی","type":"text","required":true,"placeholder":"کد ملی ۱۰ رقمی"},
          {"name":"birth_date","label":"تاریخ تولد","type":"date","required":true},
          {"name":"gender","label":"جنسیت","type":"radio","required":true,"options":[{"label":"مرد","value":"male"},{"label":"زن","value":"female"}]},
          {"name":"education","label":"تحصیلات","type":"select","required":true,"options":[{"label":"زیر دیپلم","value":"below_diploma"},{"label":"دیپلم","value":"diploma"},{"label":"کارشناسی","value":"bachelor"},{"label":"کارشناسی ارشد","value":"master"},{"label":"دکتری","value":"phd"}]},
          {"name":"address","label":"آدرس","type":"textarea","required":false,"placeholder":"آدرس کامل"},
          {"name":"terms_accepted","label":"قوانین و مقررات را مطالعه و قبول دارم","type":"checkbox","required":true,"options":[{"label":"بله","value":"accepted"}]}
        ]'::jsonb,
        true,
        false
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "form_schemas" WHERE slug = 'self-declaration'`,
    );
  }
}
