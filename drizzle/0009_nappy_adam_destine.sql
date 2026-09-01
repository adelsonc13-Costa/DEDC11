ALTER TABLE `servers` ADD CONSTRAINT `servers_cpf_unique` UNIQUE(`cpf`);--> statement-breakpoint
ALTER TABLE `terceirizados` ADD CONSTRAINT `terceirizados_cpf_unique` UNIQUE(`cpf`);