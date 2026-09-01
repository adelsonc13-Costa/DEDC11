ALTER TABLE `importRuns` ADD COLUMN `scheduleCronTaskUid` varchar(65) NULL;
ALTER TABLE `importRuns` ADD CONSTRAINT `importRuns_scheduleCronTaskUid_unique` UNIQUE(`scheduleCronTaskUid`);
