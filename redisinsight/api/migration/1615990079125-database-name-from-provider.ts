import { MigrationInterface, QueryRunner } from 'typeorm';

export class databaseNameFromProvider1615990079125
  implements MigrationInterface
{
  name = 'databaseNameFromProvider1615990079125';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_database_instance" ("id" varchar PRIMARY KEY NOT NULL, "host" varchar NOT NULL, "port" integer NOT NULL, "name" varchar NOT NULL, "username" varchar, "password" varchar, "tls" boolean NOT NULL, "verifyServerCert" boolean NOT NULL, "type" varchar NOT NULL DEFAULT ('Redis Database'), "lastConnection" datetime, "caCertId" varchar, "clientCertId" varchar, "connectionType" varchar NOT NULL DEFAULT ('STANDALONE'), "nodes" varchar, "nameFromProvider" varchar, CONSTRAINT "FK_d1bc747b5938e22b4b708d8e9a5" FOREIGN KEY ("caCertId") REFERENCES "ca_certificate" ("id") ON DELETE SET NULL ON UPDATE NO ACTION, CONSTRAINT "FK_3b9b625266c00feb2d66a9f36e4" FOREIGN KEY ("clientCertId") REFERENCES "client_certificate" ("id") ON DELETE SET NULL ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_database_instance"("id", "host", "port", "name", "username", "password", "tls", "verifyServerCert", "type", "lastConnection", "caCertId", "clientCertId", "connectionType", "nodes") SELECT "id", "host", "port", "name", "username", "password", "tls", "verifyServerCert", "type", "lastConnection", "caCertId", "clientCertId", "connectionType", "nodes" FROM "database_instance"`,
    );
    await queryRunner.query(`DROP TABLE "database_instance"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_database_instance" RENAME TO "database_instance"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "database_instance" RENAME TO "temporary_database_instance"`,
    );
    await queryRunner.query(
      `CREATE TABLE "database_instance" ("id" varchar PRIMARY KEY NOT NULL, "host" varchar NOT NULL, "port" integer NOT NULL, "name" varchar NOT NULL, "username" varchar, "password" varchar, "tls" boolean NOT NULL, "verifyServerCert" boolean NOT NULL, "type" varchar NOT NULL DEFAULT ('Redis Database'), "lastConnection" datetime, "caCertId" varchar, "clientCertId" varchar, "connectionType" varchar NOT NULL DEFAULT ('STANDALONE'), "nodes" varchar, CONSTRAINT "FK_d1bc747b5938e22b4b708d8e9a5" FOREIGN KEY ("caCertId") REFERENCES "ca_certificate" ("id") ON DELETE SET NULL ON UPDATE NO ACTION, CONSTRAINT "FK_3b9b625266c00feb2d66a9f36e4" FOREIGN KEY ("clientCertId") REFERENCES "client_certificate" ("id") ON DELETE SET NULL ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "database_instance"("id", "host", "port", "name", "username", "password", "tls", "verifyServerCert", "type", "lastConnection", "caCertId", "clientCertId", "connectionType", "nodes") SELECT "id", "host", "port", "name", "username", "password", "tls", "verifyServerCert", "type", "lastConnection", "caCertId", "clientCertId", "connectionType", "nodes" FROM "temporary_database_instance"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_database_instance"`);
  }
}
