CREATE TABLE `season_events` (
	`id` text PRIMARY KEY NOT NULL,
	`season_id` text NOT NULL,
	`user_id` text NOT NULL,
	`source` text NOT NULL,
	`category` text NOT NULL,
	`day` text NOT NULL,
	`points` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`season_id`) REFERENCES `seasons`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `registrations`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `season_event_once` ON `season_events` (`season_id`,`user_id`,`source`);--> statement-breakpoint
CREATE INDEX `season_score_lookup` ON `season_events` (`season_id`,`user_id`,`day`,`category`);--> statement-breakpoint
CREATE TABLE `season_exclusions` (
	`id` text PRIMARY KEY NOT NULL,
	`season_id` text NOT NULL,
	`user_id` text NOT NULL,
	`reason` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`season_id`) REFERENCES `seasons`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `registrations`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `season_exclude_once` ON `season_exclusions` (`season_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `season_final` (
	`id` text PRIMARY KEY NOT NULL,
	`season_id` text NOT NULL,
	`user_id` text NOT NULL,
	`username` text NOT NULL,
	`wallet` text NOT NULL,
	`rank` integer NOT NULL,
	`points` integer NOT NULL,
	`active_days` integer NOT NULL,
	`eligible` integer NOT NULL,
	`share` text NOT NULL,
	FOREIGN KEY (`season_id`) REFERENCES `seasons`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `registrations`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `season_final_once` ON `season_final` (`season_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `seasons` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`active_slot` integer,
	`rules` text NOT NULL,
	`starts_at` integer NOT NULL,
	`ends_at` integer NOT NULL,
	`frozen_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `season_active_once` ON `seasons` (`active_slot`);