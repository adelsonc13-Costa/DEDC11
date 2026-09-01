CREATE TABLE `serverChangeHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`serverId` int,
	`matricula` varchar(32),
	`fieldName` varchar(120) NOT NULL,
	`previousValue` text,
	`newValue` text,
	`changedBy` varchar(255) NOT NULL,
	`reason` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `serverChangeHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `serverChangeHistory` ADD CONSTRAINT `serverChangeHistory_serverId_servers_id_fk` FOREIGN KEY (`serverId`) REFERENCES `servers`(`id`) ON DELETE no action ON UPDATE no action;