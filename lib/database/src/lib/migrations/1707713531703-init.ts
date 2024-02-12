import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1707713531703 implements MigrationInterface {
    name = 'Init1707713531703'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "Member" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "work" bigint NOT NULL DEFAULT 0,
                "referralWork" bigint NOT NULL DEFAULT 0,
                "guildId" uuid NOT NULL,
                "externalId" character varying NOT NULL,
                "totalWork" bigint NOT NULL DEFAULT 0,
                "meta" jsonb NOT NULL,
                "referralCount" integer NOT NULL DEFAULT '0',
                "mpath" character varying DEFAULT '',
                "parentId" uuid,
                CONSTRAINT "guild-external-id" UNIQUE ("guildId", "externalId"),
                CONSTRAINT "PK_235428a1d87c5f639ef7b7cf170" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_6b21e55994732ec236ea6867c2" ON "Member" ("work")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_bf4783c954dda2f8acbc3da1bb" ON "Member" ("referralWork")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_5de737883a3c98df609c6aed48" ON "Member" ("guildId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_e3e376d83a5186f278b4d98cfe" ON "Member" ("externalId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_b9205f4900e06e5c2431f87c08" ON "Member" ("totalWork")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_db2daf09e79d7579526952ae4a" ON "Member" ("guildId", "externalId")
        `);
        await queryRunner.query(`
            CREATE TABLE "Guild" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "slug" character varying(10) NOT NULL,
                "work" bigint NOT NULL DEFAULT 0,
                "meta" jsonb NOT NULL,
                "lastLogin" integer,
                "salt" character varying,
                CONSTRAINT "UQ_ef8446308af81b1baa214afc19c" UNIQUE ("slug"),
                CONSTRAINT "PK_9eea0f088e9eec9b01bd9a824ca" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_ef8446308af81b1baa214afc19" ON "Guild" ("slug")
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_8830f4a9e0c892395b1ef20d29" ON "Guild" ("slug", "salt")
        `);
        await queryRunner.query(`
            ALTER TABLE "Member"
            ADD CONSTRAINT "FK_003506f3e72883391877720848a" FOREIGN KEY ("parentId") REFERENCES "Member"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "Member"
            ADD CONSTRAINT "FK_5de737883a3c98df609c6aed486" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Member" DROP CONSTRAINT "FK_5de737883a3c98df609c6aed486"
        `);
        await queryRunner.query(`
            ALTER TABLE "Member" DROP CONSTRAINT "FK_003506f3e72883391877720848a"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_8830f4a9e0c892395b1ef20d29"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_ef8446308af81b1baa214afc19"
        `);
        await queryRunner.query(`
            DROP TABLE "Guild"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_db2daf09e79d7579526952ae4a"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_b9205f4900e06e5c2431f87c08"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_e3e376d83a5186f278b4d98cfe"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_5de737883a3c98df609c6aed48"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_bf4783c954dda2f8acbc3da1bb"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_6b21e55994732ec236ea6867c2"
        `);
        await queryRunner.query(`
            DROP TABLE "Member"
        `);
    }

}
