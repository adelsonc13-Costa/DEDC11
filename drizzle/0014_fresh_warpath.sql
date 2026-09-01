CREATE TABLE `detectedPublications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`serverId` int,
	`matricula` varchar(32),
	`nomeOriginal` text,
	`sourceKey` varchar(80) NOT NULL,
	`sourceLabel` varchar(180) NOT NULL,
	`sourceUrl` varchar(500) NOT NULL,
	`documentUrl` varchar(500),
	`eventType` varchar(80) NOT NULL,
	`publicationDate` date,
	`description` text,
	`documentText` text,
	`scanMode` enum('historical','daily') NOT NULL,
	`fingerprint` varchar(64) NOT NULL,
	`reviewStatus` enum('pending','approved','discarded') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `detectedPublications_id` PRIMARY KEY(`id`),
	CONSTRAINT `detectedPublications_fingerprint_unique` UNIQUE(`fingerprint`)
);
--> statement-breakpoint
ALTER TABLE `detectedPublications` ADD CONSTRAINT `detectedPublications_serverId_servers_id_fk` FOREIGN KEY (`serverId`) REFERENCES `servers`(`id`) ON DELETE no action ON UPDATE no action;