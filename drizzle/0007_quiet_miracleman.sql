ALTER TABLE `servers` ADD `categoria` varchar(80);--> statement-breakpoint
ALTER TABLE `servers` ADD `status` varchar(64) DEFAULT 'Ativo';--> statement-breakpoint
ALTER TABLE `servers` ADD `cpf` varchar(32);--> statement-breakpoint
ALTER TABLE `servers` ADD `rg` varchar(64);--> statement-breakpoint
ALTER TABLE `servers` ADD `telefone` varchar(64);--> statement-breakpoint
ALTER TABLE `servers` ADD `emailInstitucional` varchar(320);--> statement-breakpoint
ALTER TABLE `servers` ADD `emailPessoal` varchar(320);