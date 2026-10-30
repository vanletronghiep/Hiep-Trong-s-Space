CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`task_id` text,
	`dedupe_key` text NOT NULL,
	`payload` text,
	`created_at` text NOT NULL,
	`read_at` text,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `notifications_dedupe_key_uidx` ON `notifications` (`dedupe_key`);--> statement-breakpoint
CREATE INDEX `notifications_task_id_idx` ON `notifications` (`task_id`);--> statement-breakpoint
CREATE INDEX `notifications_created_at_idx` ON `notifications` (`created_at`);--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`priority` text NOT NULL,
	`pinned` integer NOT NULL,
	`deadline_at` text NOT NULL,
	`scheduled_date` text,
	`status` text NOT NULL,
	`completed_at` text,
	`reminder_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `tasks_status_scheduled_date_idx` ON `tasks` (`status`,`scheduled_date`);--> statement-breakpoint
CREATE INDEX `tasks_status_deadline_at_idx` ON `tasks` (`status`,`deadline_at`);--> statement-breakpoint
CREATE INDEX `tasks_reminder_at_idx` ON `tasks` (`reminder_at`);