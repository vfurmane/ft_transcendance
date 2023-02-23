import { MigrationInterface, QueryRunner } from "typeorm";

export class InitializeDatabase1677126858699 implements MigrationInterface {
    name = 'InitializeDatabase1677126858699'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "state" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "token" character varying(255) NOT NULL, "userId" uuid, CONSTRAINT "UQ_492a96a6093ed1680a6754f47ce" UNIQUE ("token"), CONSTRAINT "PK_549ffd046ebab1336c3a8030a12" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."conversation_restriction_status_enum" AS ENUM('ban', 'mute')`);
        await queryRunner.query(`CREATE TABLE "conversation_restriction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."conversation_restriction_status_enum" NOT NULL, "until" TIMESTAMP WITH TIME ZONE, "issuerId" uuid, "targetId" uuid, CONSTRAINT "PK_d9372a6f79b0a166b8067a2dd5f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."conversation_role_role_enum" AS ENUM('admin', 'owner', 'user', 'left')`);
        await queryRunner.query(`CREATE TABLE "conversation_role" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "role" "public"."conversation_role_role_enum" NOT NULL DEFAULT 'user', "lastRead" TIMESTAMP NOT NULL, "userId" uuid, "conversationId" uuid, CONSTRAINT "PK_d54661e42d93bc9af0a961fee74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "conversation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "groupConversation" boolean NOT NULL DEFAULT false, "password" character varying(255), "has_password" boolean NOT NULL DEFAULT false, "visible" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_864528ec4274360a40f66c29845" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."message_invitation_type_enum" AS ENUM('conversation', 'pong')`);
        await queryRunner.query(`CREATE TABLE "message" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" text NOT NULL, "system_generated" boolean NOT NULL DEFAULT false, "is_invitation" boolean NOT NULL DEFAULT false, "invitation_type" "public"."message_invitation_type_enum" NOT NULL DEFAULT 'conversation', "target" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "senderId" uuid, "conversationId" uuid, CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "match" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "score_winner" smallint NOT NULL DEFAULT '0', "score_looser" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "winnerIdId" uuid, "looserIdId" uuid, CONSTRAINT "PK_92b6c3a6631dd5b24a67c69f69d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."jwt_token_type_enum" AS ENUM('access_token', 'refresh_token')`);
        await queryRunner.query(`CREATE TABLE "jwt" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "token_type" "public"."jwt_token_type_enum" NOT NULL DEFAULT 'access_token', "consumed" boolean NOT NULL DEFAULT false, "userId" uuid, "originTokenId" uuid, CONSTRAINT "PK_5d23295f3f8f90b85e63e8040fd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "game" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_352a30652cd352f552fef73dec5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "opponent" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "score" smallint NOT NULL DEFAULT '0', "userId" uuid, "gameId" uuid, CONSTRAINT "PK_4d76bcb70e2e1359a458ba75f73" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "profile" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "picture" character varying, CONSTRAINT "PK_3dd8bfc97e4a77c70971591bdcb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "block" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "sourceId" uuid, "targetId" uuid, CONSTRAINT "PK_d0925763efb591c2e2ffb267572" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "email" character varying(255) NOT NULL, "name" character varying(30) NOT NULL, "password" character varying(255), "tfa_secret" character varying(255), "tfa_setup" boolean NOT NULL DEFAULT false, "level" smallint NOT NULL DEFAULT '0', "profileId" integer, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_065d4d8f3b5adb4a08841eae3c8" UNIQUE ("name"), CONSTRAINT "REL_9466682df91534dd95e4dbaa61" UNIQUE ("profileId"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "achievements" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(30) NOT NULL, "description" character varying(300) NOT NULL, "logo" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_1bc19c37c6249f70186f318d71d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "friendships" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "accepted" boolean NOT NULL DEFAULT false, "initiatorId" uuid, "targetId" uuid, CONSTRAINT "PK_08af97d0be72942681757f07bc8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "upload" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "filename" character varying NOT NULL, "path" character varying NOT NULL, CONSTRAINT "PK_1fe8db121b3de4ddfa677fc51f3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "state" ADD CONSTRAINT "FK_d56be3ac9ae9636e9ca0f9c0248" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "conversation_restriction" ADD CONSTRAINT "FK_013212d6ca45763c0ffe0a16769" FOREIGN KEY ("issuerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "conversation_restriction" ADD CONSTRAINT "FK_8c4d821d6335fe686eb27ed441e" FOREIGN KEY ("targetId") REFERENCES "conversation_role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "conversation_role" ADD CONSTRAINT "FK_7275a978d0fa0bb1c2a651478ac" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "conversation_role" ADD CONSTRAINT "FK_3703b3cf16b9885f6087fd44d82" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_bc096b4e18b1f9508197cd98066" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_7cf4a4df1f2627f72bf6231635f" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "match" ADD CONSTRAINT "FK_6351ff726e856a32ada5feb2aa9" FOREIGN KEY ("winnerIdId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "match" ADD CONSTRAINT "FK_b75f4fc56084b625f1f81420f0e" FOREIGN KEY ("looserIdId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "jwt" ADD CONSTRAINT "FK_690dc6b83bb053b2ccd4342a17f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "jwt" ADD CONSTRAINT "FK_f1d5c4d0b9053c83f2df747e79a" FOREIGN KEY ("originTokenId") REFERENCES "jwt"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "opponent" ADD CONSTRAINT "FK_9d1835eafd6b116ae41ce20508e" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "opponent" ADD CONSTRAINT "FK_7da26cf869e1c4e43861e42f2b4" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "block" ADD CONSTRAINT "FK_e19adaba9bfc60069541176f089" FOREIGN KEY ("sourceId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "block" ADD CONSTRAINT "FK_ab4996c90618e8f0800a06becf4" FOREIGN KEY ("targetId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_9466682df91534dd95e4dbaa616" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "achievements" ADD CONSTRAINT "FK_a4c9761e826d07a1f4c51ca1d2b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "friendships" ADD CONSTRAINT "FK_2ea819f6a73eaf4a2feaa63205b" FOREIGN KEY ("initiatorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "friendships" ADD CONSTRAINT "FK_9e9a2d44347393ba77fc3340114" FOREIGN KEY ("targetId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "friendships" DROP CONSTRAINT "FK_9e9a2d44347393ba77fc3340114"`);
        await queryRunner.query(`ALTER TABLE "friendships" DROP CONSTRAINT "FK_2ea819f6a73eaf4a2feaa63205b"`);
        await queryRunner.query(`ALTER TABLE "achievements" DROP CONSTRAINT "FK_a4c9761e826d07a1f4c51ca1d2b"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_9466682df91534dd95e4dbaa616"`);
        await queryRunner.query(`ALTER TABLE "block" DROP CONSTRAINT "FK_ab4996c90618e8f0800a06becf4"`);
        await queryRunner.query(`ALTER TABLE "block" DROP CONSTRAINT "FK_e19adaba9bfc60069541176f089"`);
        await queryRunner.query(`ALTER TABLE "opponent" DROP CONSTRAINT "FK_7da26cf869e1c4e43861e42f2b4"`);
        await queryRunner.query(`ALTER TABLE "opponent" DROP CONSTRAINT "FK_9d1835eafd6b116ae41ce20508e"`);
        await queryRunner.query(`ALTER TABLE "jwt" DROP CONSTRAINT "FK_f1d5c4d0b9053c83f2df747e79a"`);
        await queryRunner.query(`ALTER TABLE "jwt" DROP CONSTRAINT "FK_690dc6b83bb053b2ccd4342a17f"`);
        await queryRunner.query(`ALTER TABLE "match" DROP CONSTRAINT "FK_b75f4fc56084b625f1f81420f0e"`);
        await queryRunner.query(`ALTER TABLE "match" DROP CONSTRAINT "FK_6351ff726e856a32ada5feb2aa9"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_7cf4a4df1f2627f72bf6231635f"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_bc096b4e18b1f9508197cd98066"`);
        await queryRunner.query(`ALTER TABLE "conversation_role" DROP CONSTRAINT "FK_3703b3cf16b9885f6087fd44d82"`);
        await queryRunner.query(`ALTER TABLE "conversation_role" DROP CONSTRAINT "FK_7275a978d0fa0bb1c2a651478ac"`);
        await queryRunner.query(`ALTER TABLE "conversation_restriction" DROP CONSTRAINT "FK_8c4d821d6335fe686eb27ed441e"`);
        await queryRunner.query(`ALTER TABLE "conversation_restriction" DROP CONSTRAINT "FK_013212d6ca45763c0ffe0a16769"`);
        await queryRunner.query(`ALTER TABLE "state" DROP CONSTRAINT "FK_d56be3ac9ae9636e9ca0f9c0248"`);
        await queryRunner.query(`DROP TABLE "upload"`);
        await queryRunner.query(`DROP TABLE "friendships"`);
        await queryRunner.query(`DROP TABLE "achievements"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "block"`);
        await queryRunner.query(`DROP TABLE "profile"`);
        await queryRunner.query(`DROP TABLE "opponent"`);
        await queryRunner.query(`DROP TABLE "game"`);
        await queryRunner.query(`DROP TABLE "jwt"`);
        await queryRunner.query(`DROP TYPE "public"."jwt_token_type_enum"`);
        await queryRunner.query(`DROP TABLE "match"`);
        await queryRunner.query(`DROP TABLE "message"`);
        await queryRunner.query(`DROP TYPE "public"."message_invitation_type_enum"`);
        await queryRunner.query(`DROP TABLE "conversation"`);
        await queryRunner.query(`DROP TABLE "conversation_role"`);
        await queryRunner.query(`DROP TYPE "public"."conversation_role_role_enum"`);
        await queryRunner.query(`DROP TABLE "conversation_restriction"`);
        await queryRunner.query(`DROP TYPE "public"."conversation_restriction_status_enum"`);
        await queryRunner.query(`DROP TABLE "state"`);
    }

}
