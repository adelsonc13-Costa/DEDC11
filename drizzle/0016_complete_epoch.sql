CREATE TABLE `redaCadastros` (
	`id` int AUTO_INCREMENT NOT NULL,
	`serverId` int NOT NULL,
	`tipoReda` enum('Docente','Técnico') NOT NULL,
	`baseLegal` varchar(120),
	`numeroEditalConcurso` varchar(120),
	`dataHomologacaoConcurso` date,
	`vigenciaConcursoFim` date,
	`posicaoCadastroReserva` varchar(64),
	`areaComponenteCurricular` varchar(180),
	`portariaConvocacaoInicial` varchar(180),
	`portariaConvocacaoData` date,
	`cargaHoraria` varchar(32),
	`vagaClasseNivel` varchar(120),
	`dataInicioContrato` date,
	`dataFimContratoPrevisto` date,
	`tetoPermanenciaData` date,
	`status` enum('Ativo','Encerrado') NOT NULL DEFAULT 'Ativo',
	`justificativaCargaPrevista` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `redaCadastros_id` PRIMARY KEY(`id`),
	CONSTRAINT `redaCadastros_serverId_unique` UNIQUE(`serverId`)
);
--> statement-breakpoint
CREATE TABLE `redaEfetivosCobertos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`redaCadastroId` int NOT NULL,
	`efetivoServerId` int NOT NULL,
	`motivoAfastamento` enum('Exoneração ou demissão','Falecimento','Aposentadoria','Afastamento ou licença de concessão obrigatória','Licença para capacitação'),
	`portariaAfastamentoEfetivo` varchar(180),
	`numeroProcesso` varchar(120),
	`dataInicio` date,
	`dataFim` date,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `redaEfetivosCobertos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `redaProrrogacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`redaCadastroId` int NOT NULL,
	`numeroPortaria` varchar(180),
	`dataInicio` date,
	`dataFim` date,
	`statusDocumentos` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `redaProrrogacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `detectedPublications` MODIFY COLUMN `sourceUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `detectedPublications` MODIFY COLUMN `scanMode` enum('historical','daily','individual') NOT NULL;--> statement-breakpoint
ALTER TABLE `detectedPublications` ADD `applyField` varchar(40);--> statement-breakpoint
ALTER TABLE `detectedPublications` ADD `applyValue` varchar(200);--> statement-breakpoint
ALTER TABLE `redaCadastros` ADD CONSTRAINT `redaCadastros_serverId_servers_id_fk` FOREIGN KEY (`serverId`) REFERENCES `servers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `redaEfetivosCobertos` ADD CONSTRAINT `redaEfetivosCobertos_redaCadastroId_redaCadastros_id_fk` FOREIGN KEY (`redaCadastroId`) REFERENCES `redaCadastros`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `redaEfetivosCobertos` ADD CONSTRAINT `redaEfetivosCobertos_efetivoServerId_servers_id_fk` FOREIGN KEY (`efetivoServerId`) REFERENCES `servers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `redaProrrogacoes` ADD CONSTRAINT `redaProrrogacoes_redaCadastroId_redaCadastros_id_fk` FOREIGN KEY (`redaCadastroId`) REFERENCES `redaCadastros`(`id`) ON DELETE no action ON UPDATE no action;