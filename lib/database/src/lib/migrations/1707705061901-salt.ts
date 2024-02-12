import { MigrationInterface, QueryRunner } from "typeorm";

export class Salt1707705061901 implements MigrationInterface {
    name = 'Salt1707705061901'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "guild"
            ADD "lastLogin" integer
        `);
        await queryRunner.query(`
            ALTER TABLE "guild"
            ADD "salt" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "member"
            ALTER COLUMN "work"
            SET DEFAULT 0
        `);
        await queryRunner.query(`
            ALTER TABLE "member"
            ALTER COLUMN "referralWork"
            SET DEFAULT 0
        `);
        await queryRunner.query(`
            ALTER TABLE "member"
            ALTER COLUMN "totalWork"
            SET DEFAULT 0
        `);
        await queryRunner.query(`
            ALTER TABLE "guild"
            ALTER COLUMN "work"
            SET DEFAULT 0
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_f73c7a1ea1ab5cca12dba6ebdc" ON "guild" ("slug")
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_e5671c5e15f7bdaa4e16879dc1" ON "guild" ("slug", "salt")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_e5671c5e15f7bdaa4e16879dc1"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_f73c7a1ea1ab5cca12dba6ebdc"
        `);
        await queryRunner.query(`
            ALTER TABLE "guild"
            ALTER COLUMN "work"
            SET DEFAULT '0'
        `);
        await queryRunner.query(`
            ALTER TABLE "member"
            ALTER COLUMN "totalWork"
            SET DEFAULT '0'
        `);
        await queryRunner.query(`
            ALTER TABLE "member"
            ALTER COLUMN "referralWork"
            SET DEFAULT '0'
        `);
        await queryRunner.query(`
            ALTER TABLE "member"
            ALTER COLUMN "work"
            SET DEFAULT '0'
        `);
        await queryRunner.query(`
            ALTER TABLE "guild" DROP COLUMN "salt"
        `);
        await queryRunner.query(`
            ALTER TABLE "guild" DROP COLUMN "lastLogin"
        `);
    }

}
