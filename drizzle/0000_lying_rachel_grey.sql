CREATE TABLE `buildings` (
	`id` text PRIMARY KEY NOT NULL,
	`parcel` integer NOT NULL,
	`x` integer NOT NULL,
	`y` integer NOT NULL,
	`rotation` integer NOT NULL,
	`type` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `building_cell_idx` ON `buildings` (`parcel`,`x`,`y`);--> statement-breakpoint
CREATE TABLE `chain_events` (
	`id` text PRIMARY KEY NOT NULL,
	`chain_id` integer NOT NULL,
	`contract` text NOT NULL,
	`tx` text NOT NULL,
	`log_index` integer NOT NULL,
	`block` integer NOT NULL,
	`block_hash` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `event_unique_idx` ON `chain_events` (`chain_id`,`contract`,`tx`,`log_index`);--> statement-breakpoint
CREATE TABLE `chat` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`username` text NOT NULL,
	`message` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `chat_time_idx` ON `chat` (`created_at`);--> statement-breakpoint
CREATE TABLE `economy` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`amount` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `economy_time_idx` ON `economy` (`created_at`);--> statement-breakpoint
CREATE INDEX `economy_user_idx` ON `economy` (`user_id`);--> statement-breakpoint
CREATE TABLE `land_projection` (
	`id` integer PRIMARY KEY NOT NULL,
	`chain_id` integer NOT NULL,
	`contract` text NOT NULL,
	`owner` text NOT NULL,
	`block` integer NOT NULL,
	`tx` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `nonces` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`address` text NOT NULL,
	`message` text NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `players` (
	`user_id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`state` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `players_username_unique` ON `players` (`username`);--> statement-breakpoint
CREATE TABLE `wallets` (
	`address` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`chain_id` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `wallet_user_idx` ON `wallets` (`user_id`);