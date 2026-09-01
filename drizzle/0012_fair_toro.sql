ALTER TABLE `servers` ADD `incentivoTipo` varchar(120);--> statement-breakpoint
ALTER TABLE `servers` ADD `incentivoPortaria` varchar(180);--> statement-breakpoint
ALTER TABLE `servers` ADD `incentivoDataInicio` date;--> statement-breakpoint
ALTER TABLE `servers` ADD `incentivoDataValidade` date;--> statement-breakpoint
ALTER TABLE `servers` ADD `afastamentoMotivo` varchar(80);--> statement-breakpoint
ALTER TABLE `servers` ADD `afastamentoDataInicio` date;--> statement-breakpoint
ALTER TABLE `servers` ADD `afastamentoDataFim` date;--> statement-breakpoint
ALTER TABLE `servers` ADD `afastamentoDocumentoSei` varchar(180);--> statement-breakpoint
ALTER TABLE `servers` ADD `ultimaVarredura` timestamp;