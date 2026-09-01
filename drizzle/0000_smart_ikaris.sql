CREATE TABLE `contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`serverId` int,
	`nomeOriginal` text NOT NULL,
	`setorOriginal` varchar(180),
	`telefoneOriginal` varchar(64),
	`emailOriginal` varchar(320),
	`sourceModule` varchar(120) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `functionalActs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`serverId` int,
	`tipo` varchar(100) NOT NULL,
	`portaria` varchar(180),
	`processoSei` varchar(180),
	`setor` varchar(180),
	`cargaHoraria` varchar(32),
	`sourceModule` varchar(120) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `functionalActs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `importConflicts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`runId` int,
	`module` varchar(120) NOT NULL,
	`recordKey` varchar(120),
	`conflictType` varchar(100) NOT NULL,
	`details` text NOT NULL,
	`status` enum('pending','resolved','ignored') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `importConflicts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `importRuns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`source` varchar(255) NOT NULL,
	`version` varchar(64) NOT NULL,
	`status` enum('dry_run','committed','failed') NOT NULL,
	`insertedCount` int NOT NULL DEFAULT 0,
	`updatedCount` int NOT NULL DEFAULT 0,
	`pendingCount` int NOT NULL DEFAULT 0,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `importRuns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `interns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`serverId` int,
	`matricula` varchar(32),
	`nomeOriginal` text NOT NULL,
	`cursando` varchar(180),
	`setorAtuacao` varchar(180),
	`turno` varchar(64),
	`responsavel` varchar(180),
	`numeroProcesso` varchar(120),
	`bolsa` varchar(100),
	`dataContratacao` date,
	`renovacao` varchar(32),
	`sourceModule` varchar(120) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `interns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `productionIncentives` (
	`id` int AUTO_INCREMENT NOT NULL,
	`serverId` int,
	`matricula` varchar(32),
	`nomeOriginal` text NOT NULL,
	`numeroPortaria` varchar(180),
	`colegiado` varchar(180),
	`dataInicio` date,
	`dataTermino` date,
	`diasFaltantes` varchar(64),
	`sourceModule` varchar(120) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `productionIncentives_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `servers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`matricula` varchar(32) NOT NULL,
	`nomeOriginal` text NOT NULL,
	`nomeNormalizado` varchar(255) NOT NULL,
	`setor` varchar(180),
	`cargo` varchar(180),
	`cargaHoraria` varchar(32),
	`dataNascimento` date,
	`dataContratacao` date,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `servers_id` PRIMARY KEY(`id`),
	CONSTRAINT `servers_matricula_unique` UNIQUE(`matricula`)
);
--> statement-breakpoint
CREATE TABLE `serviceRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`serverId` int,
	`nomeOriginal` text NOT NULL,
	`setor` varchar(180),
	`cargo` varchar(180),
	`dataNascimento` date,
	`dataContratacao` date,
	`averbacaoDias` int,
	`sourceModule` varchar(120) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `serviceRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
ALTER TABLE `contacts` ADD CONSTRAINT `contacts_serverId_servers_id_fk` FOREIGN KEY (`serverId`) REFERENCES `servers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `functionalActs` ADD CONSTRAINT `functionalActs_serverId_servers_id_fk` FOREIGN KEY (`serverId`) REFERENCES `servers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `importConflicts` ADD CONSTRAINT `importConflicts_runId_importRuns_id_fk` FOREIGN KEY (`runId`) REFERENCES `importRuns`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `interns` ADD CONSTRAINT `interns_serverId_servers_id_fk` FOREIGN KEY (`serverId`) REFERENCES `servers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `productionIncentives` ADD CONSTRAINT `productionIncentives_serverId_servers_id_fk` FOREIGN KEY (`serverId`) REFERENCES `servers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `serviceRecords` ADD CONSTRAINT `serviceRecords_serverId_servers_id_fk` FOREIGN KEY (`serverId`) REFERENCES `servers`(`id`) ON DELETE no action ON UPDATE no action;