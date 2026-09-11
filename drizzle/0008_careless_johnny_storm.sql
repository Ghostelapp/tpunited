CREATE TABLE `support_files` (
	`id` text PRIMARY KEY NOT NULL,
	`ticket_id` integer NOT NULL,
	`name` text NOT NULL,
	`mime` text NOT NULL,
	`size` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `support_files_ticket` ON `support_files` (`ticket_id`);--> statement-breakpoint
CREATE TABLE `support_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ticket_id` integer NOT NULL,
	`author_id` text NOT NULL,
	`staff` integer NOT NULL,
	`internal` integer DEFAULT 0 NOT NULL,
	`body` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`author_id`) REFERENCES `registrations`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `support_thread` ON `support_messages` (`ticket_id`,`id`);--> statement-breakpoint
CREATE TABLE `support_tickets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`category` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`steps` text DEFAULT '' NOT NULL,
	`expected` text DEFAULT '' NOT NULL,
	`actual` text DEFAULT '' NOT NULL,
	`context` text DEFAULT '{}' NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`priority` text DEFAULT 'normal' NOT NULL,
	`assigned_to` text,
	`revision` integer DEFAULT 0 NOT NULL,
	`last_write` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `registrations`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assigned_to`) REFERENCES `registrations`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `support_owner_updated` ON `support_tickets` (`user_id`,`updated_at`);--> statement-breakpoint
CREATE INDEX `support_status_updated` ON `support_tickets` (`status`,`updated_at`);