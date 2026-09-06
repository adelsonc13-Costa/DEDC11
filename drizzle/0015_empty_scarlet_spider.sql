ALTER TABLE `detectedPublications` ADD `runId` int;--> statement-breakpoint
ALTER TABLE `detectedPublications` ADD `actNumber` varchar(180);--> statement-breakpoint
ALTER TABLE `detectedPublications` ADD `processoSei` varchar(180);--> statement-breakpoint
ALTER TABLE `detectedPublications` ADD `intelligenceStatus` enum('confirmado','pendente','divergencia','nao_pesquisado') DEFAULT 'nao_pesquisado' NOT NULL;--> statement-breakpoint
ALTER TABLE `detectedPublications` ADD `masterValue` text;--> statement-breakpoint
ALTER TABLE `detectedPublications` ADD `foundValue` text;--> statement-breakpoint
ALTER TABLE `servers` ADD `cargoComissionado` varchar(80);--> statement-breakpoint
ALTER TABLE `servers` ADD `chefeImediato` varchar(180);--> statement-breakpoint
ALTER TABLE `servers` ADD `empresaTerceirizada` varchar(80);--> statement-breakpoint
ALTER TABLE `servers` ADD `contratoTerceirizado` varchar(120);--> statement-breakpoint
ALTER TABLE `servers` ADD `funcaoTerceirizado` varchar(80);--> statement-breakpoint
ALTER TABLE `servers` ADD `nivelRecepcionista` int;--> statement-breakpoint
ALTER TABLE `servers` ADD `cnhNumero` varchar(32);--> statement-breakpoint
ALTER TABLE `servers` ADD `cnhCategoria` varchar(16);--> statement-breakpoint
ALTER TABLE `servers` ADD `cnhVencimento` date;--> statement-breakpoint
ALTER TABLE `servers` ADD `cnhCursoVan` enum('Sim','Não');--> statement-breakpoint
ALTER TABLE `detectedPublications` ADD CONSTRAINT `detectedPublications_runId_importRuns_id_fk` FOREIGN KEY (`runId`) REFERENCES `importRuns`(`id`) ON DELETE no action ON UPDATE no action;