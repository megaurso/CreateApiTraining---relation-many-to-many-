CREATE DATABASE "projectDevelopers"


CREATE TYPE "OS" AS ENUM ('Windows', 'Linux', 'MacOS');

CREATE TABLE IF NOT EXISTS developer_infos (
	"id" BIGSERIAL PRIMARY KEY,
	"developerSince" DATE NOT NULL,
	"preferredOS" "OS" NOT NULL
);

CREATE TABLE IF NOT EXISTS developers (
	id BIGSERIAL PRIMARY KEY,
	name VARCHAR(50) NOT NULL,
	email VARCHAR(50) NOT NULL UNIQUE,
	developerInfoId INTEGER UNIQUE chave estrangeira
);

CREATE TABLE IF NOT EXISTS projects (
	id BIGSERIAL PRIMARY KEY,
	name VARCHAR(50) NOT NULL,
	description TEXT NOT NULL,
	"estimatedTime" VARCHAR(20) NOT NULL,
	repository VARCHAR(120) NOT NULL,
	"startDate" DATE NOT NULL,
	"endDate" DATE,
	"developerId" INTEGER NOT NULL chave estrangeira.
);

CREATE TABLE IF NOT EXISTS technologics (
	id BIGSERIAL PRIMARY KEY,
	name VARCHAR(30) NOT NULL
);

CREATE TABLE IF NOT EXISTS projects_technologies (
	id BIGSERIAL PRIMARY KEY,
	addedIn DATE NOT NULL SET DEFAULT now(),
	email INTEGER NOT NULL chave estrangeira,
	developerInfoId INTEGER NOT NULL chave estrangeria
);
