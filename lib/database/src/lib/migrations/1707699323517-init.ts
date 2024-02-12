import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1707699323517 implements MigrationInterface {
    name = 'Init1707699323517'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "member" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "work" bigint NOT NULL DEFAULT 0,
                "referralWork" bigint NOT NULL DEFAULT 0,
                "guildId" uuid NOT NULL,
                "externalId" character varying NOT NULL,
                "totalWork" bigint NOT NULL DEFAULT 0,
                "meta" jsonb NOT NULL,
                "referralCount" integer NOT NULL,
                "mpath" character varying DEFAULT '',
                "parentId" uuid,
                CONSTRAINT "guild-external-id" UNIQUE ("guildId", "externalId"),
                CONSTRAINT "PK_97cbbe986ce9d14ca5894fdc072" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_d7e8037cd00970c1333e7c56e7" ON "member" ("work")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_aad57c4a80c295300c33346fae" ON "member" ("referralWork")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_0d9ad247e755ccc7b7fe84f621" ON "member" ("guildId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_ca99785249d835f958eb29772b" ON "member" ("externalId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_8929cc2fb6be34b1356274dc5f" ON "member" ("totalWork")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_bfcafe80848e2f49f4f5ce44a4" ON "member" ("guildId", "externalId")
        `);
        await queryRunner.query(`
            CREATE TABLE "guild" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "slug" character varying(10) NOT NULL,
                "work" bigint NOT NULL DEFAULT 0,
                "meta" jsonb NOT NULL,
                CONSTRAINT "UQ_f73c7a1ea1ab5cca12dba6ebdce" UNIQUE ("slug"),
                CONSTRAINT "PK_cfbbd0a2805cab7053b516068a3" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "member"
            ADD CONSTRAINT "FK_693246d1c6fe3b4cd1d591c48fd" FOREIGN KEY ("parentId") REFERENCES "member"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "member"
            ADD CONSTRAINT "FK_0d9ad247e755ccc7b7fe84f621c" FOREIGN KEY ("guildId") REFERENCES "guild"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "member" DROP CONSTRAINT "FK_0d9ad247e755ccc7b7fe84f621c"
        `);
        await queryRunner.query(`
            ALTER TABLE "member" DROP CONSTRAINT "FK_693246d1c6fe3b4cd1d591c48fd"
        `);
        await queryRunner.query(`
            DROP TABLE "guild"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_bfcafe80848e2f49f4f5ce44a4"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_8929cc2fb6be34b1356274dc5f"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_ca99785249d835f958eb29772b"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_0d9ad247e755ccc7b7fe84f621"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_aad57c4a80c295300c33346fae"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_d7e8037cd00970c1333e7c56e7"
        `);
        await queryRunner.query(`
            DROP TABLE "member"
        `);
    }

}
