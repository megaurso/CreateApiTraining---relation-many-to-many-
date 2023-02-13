CREATE DATABASE "projectDevelopers" CREATE TYPE "OS" AS ENUM ('Windows', 'Linux', 'MacOS');

CREATE TABLE IF NOT EXISTS developer_infos (
	"id" BIGSERIAL PRIMARY KEY,
	"developerSince" DATE NOT NULL,
	"preferredOS" "OS" NOT NULL
);

CREATE TABLE IF NOT EXISTS developers (
	"id" BIGSERIAL PRIMARY KEY,
	"name" VARCHAR(50) NOT NULL,
	"email" VARCHAR(50) NOT NULL UNIQUE,
	"developerInfoId" INTEGER UNIQUE
);

CREATE TABLE IF NOT EXISTS projects (
	"id" BIGSERIAL PRIMARY KEY,
	"name" VARCHAR(50) NOT NULL,
	"description" TEXT NOT NULL,
	"estimatedTime" VARCHAR(20) NOT NULL,
	"repository" VARCHAR(120) NOT NULL,
	"startDate" DATE NOT NULL,
	"endDate" DATE,
	"developerId" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS technologics (
	"id" BIGSERIAL PRIMARY KEY,
	"name" VARCHAR(30) NOT NULL
);

CREATE TABLE IF NOT EXISTS projects_technologies (
	"id" BIGSERIAL PRIMARY KEY,
	"addedIn" DATE NOT NULL DEFAULT now(),
	"projectId" INTEGER NOT NULL,
	"technologyId" INTEGER NOT NULL
);

INSERT INTO
	technologics (id, name)
VALUES
	(1, 'JavaScript'),
	(2, 'Python'),
	(3, 'React'),
	(4, 'Express.js'),
	(5, 'HTML'),
	(6, 'CSS'),
	(7, 'Django'),
	(8, 'PostgreSQL'),
	(9, 'PostgreSQL');

	
ALTER TABLE
	developers
ADD
	FOREIGN KEY ("developerInfoId") REFERENCES developer_infos("id") ON DELETE CASCADE;

ALTER TABLE
	projects
ADD
	FOREIGN KEY ("developerId") REFERENCES developers("id") ON DELETE CASCADE;

ALTER TABLE
	projects_technologies
ADD
	FOREIGN KEY ("projectId") REFERENCES projects("id");

ALTER TABLE
	projects_technologies
ADD
	FOREIGN KEY ("technologyId") REFERENCES technologies("id");

ALTER TABLE
	projects_technologies
ADD
	FOREIGN KEY ("technologyId") REFERENCES technologics("id");