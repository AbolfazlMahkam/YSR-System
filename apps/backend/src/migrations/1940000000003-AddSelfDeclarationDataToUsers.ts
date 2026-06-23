import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSelfDeclarationDataToUsers1940000000003
  implements MigrationInterface
{
  name = 'AddSelfDeclarationDataToUsers1940000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn(
      'users',
      'self_declaration_data',
    );
    if (!hasColumn) {
      await queryRunner.query(`
        ALTER TABLE "users"
        ADD COLUMN "self_declaration_data" jsonb DEFAULT '{}'
      `);
    }

    const schema = (await queryRunner.query(
      `SELECT id, fields FROM "form_schemas" WHERE slug = 'self-declaration'`,
    )) as { id: number; fields: any[] }[];

    if (schema.length > 0) {
      await queryRunner.query(
        `
        UPDATE "form_schemas"
        SET fields = (
          SELECT jsonb_agg(elem)
          FROM jsonb_array_elements(fields) AS elem
          WHERE elem->>'name' NOT IN ('first_name', 'last_name', 'phone')
        )
        WHERE slug = 'self-declaration'
      `,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "self_declaration_data"`,
    );
  }
}
