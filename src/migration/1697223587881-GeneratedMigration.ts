import { MigrationInterface, QueryRunner } from "typeorm";

export class GeneratedMigration1697223587881 implements MigrationInterface {
    name = 'GeneratedMigration1697223587881'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`balance\` int NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`balance\``);
    }

}
