CREATE TABLE `processingLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`resumeId` int NOT NULL,
	`step` varchar(50) NOT NULL,
	`status` enum('started','completed','failed') NOT NULL,
	`details` text,
	`duration` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `processingLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `resumes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`candidateName` varchar(255),
	`email` varchar(320),
	`phone` varchar(20),
	`rawText` text,
	`habilidadesBrutas` text,
	`experienciasBrutas` text,
	`resumoHabilidades` text,
	`experienciasResumidas` text,
	`status` enum('pending','extracting','normalizing','processing','completed','error') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `resumes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `processingLogs` ADD CONSTRAINT `processingLogs_resumeId_resumes_id_fk` FOREIGN KEY (`resumeId`) REFERENCES `resumes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `resumes` ADD CONSTRAINT `resumes_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;