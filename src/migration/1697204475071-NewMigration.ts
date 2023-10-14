import { MigrationInterface, QueryRunner } from "typeorm"
import bcrypt, {hash} from "bcrypt";

export class NewMigration1697204475071 implements MigrationInterface {

    name = 'NewMigration1697204475071';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO user (email, password) VALUES ('user@example.com',?)`, [
            bcrypt.hashSync('asdASD123%', 10)
        ]);

        await queryRunner.query(`INSERT INTO user (email, password) VALUES ('demo@example.com',?)`, [
            bcrypt.hashSync('asdASD123%', 10)
        ]);

        await queryRunner.query(`INSERT INTO user (email, password) VALUES ('test@example.com',?)`, [
            bcrypt.hashSync('asdASD123%', 10)
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
