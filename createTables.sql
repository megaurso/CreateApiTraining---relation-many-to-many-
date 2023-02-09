CREATE DATABASE "projectDevelopers"
SELECT
	*
FROM
	developer_infos;

CREATE TYPE "OS" AS ENUM ('Windows', 'Linux', 'MacOS');

DROP TABLE developer_infos;

CREATE TABLE IF NOT EXISTS developer_infos (
	"id" BIGSERIAL PRIMARY KEY,
	"developerSince" DATE NOT NULL,
	"preferredOS" "OS" NOT NULL
);

CREATE TABLE IF NOT EXISTS developers (
	id BIGSERIAL PRIMARY KEY,
	name VARCHAR(50) NOT NULL,
	email VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
	id BIGSERIAL PRIMARY KEY,
	name VARCHAR(50) NOT NULL,
	description TEXT NOT NULL,
	"estimatedTime" VARCHAR(20) NOT NULL,
	repository VARCHAR(120) NOT NULL,
	"startDate" DATE NOT NULL,
	"endDate" DATE
);

CREATE TABLE IF NOT EXISTS technologies (
	id BIGSERIAL PRIMARY KEY,
	name VARCHAR(30) NOT NULL
);

INSERT INTO
	technologies (id, name)
VALUES
	(num, 'tecno...')
ALTER TABLE
	developers
ADD
	COLUMN "developerInfoId" INTEGER UNIQUE;

ALTER TABLE
	developers
ADD
	FOREIGN KEY ("developerInfoId") REFERENCES developer_infos("id")
ALTER TABLE
	projects
ADD
	COLUMN "developerId" INTEGER UNIQUE;

ALTER TABLE
	projects
ADD
	FOREIGN KEY ("developerId") REFERENCES developers("id")
ALTER TABLE
	projects_technologies
ADD
	COLUMN "projectId" INTEGER NOT NULL;

ALTER TABLE
	projects_technologies
ADD
	FOREIGN KEY ("projectId") REFERENCES projects("id");

ALTER TABLE
	projects_technologies
ADD
	COLUMN "technologyId" INTEGER NOT NULL;

ALTER TABLE
	projects_technologies
ADD
	FOREIGN KEY ("technologyId") REFERENCES technologies("id");