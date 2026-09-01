CREATE TABLE `frequenciasTerceirizados` (
	`id` int AUTO_INCREMENT NOT NULL,
	`terceirizadoId` int,
	`nomeOriginal` text NOT NULL,
	`empresa` varchar(255) NOT NULL,
	`contrato` varchar(120) NOT NULL,
	`pagina` int,
	`mesReferencia` varchar(64),
	`dataEmissao` varchar(64),
	`funcao` varchar(180),
	`turno` varchar(64),
	`ocorrencias` text,
	`dias` int,
	`substituto` varchar(180),
	`sourceModule` varchar(120) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `frequenciasTerceirizados_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `terceirizados` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nomeOriginal` text NOT NULL,
	`nomeNormalizado` varchar(255) NOT NULL,
	`cpf` varchar(32),
	`cargoFuncao` varchar(180),
	`setor` varchar(180),
	`localLotacao` varchar(180),
	`telefone` varchar(64),
	`email` varchar(320),
	`empresa` varchar(255) NOT NULL,
	`contrato` varchar(120) NOT NULL,
	`numeroContrato` varchar(120),
	`inicioContrato` date,
	`fimContrato` date,
	`situacaoContrato` varchar(64),
	`dataNascimento` date,
	`observacoes` text,
	`sourceModule` varchar(120) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `terceirizados_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `frequenciasTerceirizados` ADD CONSTRAINT `frequenciasTerceirizados_terceirizadoId_terceirizados_id_fk` FOREIGN KEY (`terceirizadoId`) REFERENCES `terceirizados`(`id`) ON DELETE no action ON UPDATE no action;