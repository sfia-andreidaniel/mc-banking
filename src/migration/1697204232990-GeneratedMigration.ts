import { MigrationInterface, QueryRunner } from "typeorm";

export class GeneratedMigration1697204232990 implements MigrationInterface {
    name = 'GeneratedMigration1697204232990'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(64) NOT NULL, \`password\` varchar(64) NOT NULL, UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`user\``);
    }

}
