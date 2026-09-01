ALTER TABLE `serverChangeHistory` ADD `eventType` varchar(80);--> statement-breakpoint
ALTER TABLE `serverChangeHistory` ADD `processSei` varchar(180);--> statement-breakpoint
ALTER TABLE `serverChangeHistory` ADD `publicationNumber` varchar(180);--> statement-breakpoint
ALTER TABLE `serverChangeHistory` ADD `doeLink` varchar(500);--> statement-breakpoint
ALTER TABLE `serverChangeHistory` ADD `startDate` date;--> statement-breakpoint
ALTER TABLE `serverChangeHistory` ADD `endDate` date;--> statement-breakpoint
ALTER TABLE `serverChangeHistory` ADD `publicationDate` date;--> statement-breakpoint
ALTER TABLE `servers` ADD `idMestre` varchar(36);--> statement-breakpoint
ALTER TABLE `servers` ADD `participarComemoracao` enum('Sim','Não') DEFAULT 'Sim';--> statement-breakpoint
ALTER TABLE `servers` ADD `motivoNaoParticipar` varchar(255);--> statement-breakpoint
ALTER TABLE `servers` ADD `docenteClasse` varchar(80);--> statement-breakpoint
ALTER TABLE `servers` ADD `docenteNivel` varchar(32);--> statement-breakpoint
ALTER TABLE `servers` ADD `tecnicoNivel` int;--> statement-breakpoint
ALTER TABLE `servers` ADD `grau` int;--> statement-breakpoint
ALTER TABLE `servers` ADD `referencia` int;--> statement-breakpoint
ALTER TABLE `servers` ADD `estagiarioCalculaVigencia` enum('Sim','Não') DEFAULT 'Não';--> statement-breakpoint
ALTER TABLE `servers` ADD `contagemRenovacao` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `servers` ADD `terceirizadoSubstituto` enum('Sim','Não') DEFAULT 'Não';--> statement-breakpoint
ALTER TABLE `servers` ADD `idServidorSubstituido` int;--> statement-breakpoint
UPDATE `servers` SET `idMestre` = UUID() WHERE `idMestre` IS NULL;--> statement-breakpoint
ALTER TABLE `servers` MODIFY `idMestre` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `servers` ADD CONSTRAINT `servers_idMestre_unique` UNIQUE(`idMestre`);--> statement-breakpoint
ALTER TABLE `servers` ADD CONSTRAINT `servers_idServidorSubstituido_fk` FOREIGN KEY (`idServidorSubstituido`) REFERENCES `servers`(`id`);
