CREATE TABLE `account_wallets` (
	`address` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`chain_id` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `registrations`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `account_wallet_user_once` ON `account_wallets` (`user_id`);--> statement-breakpoint
CREATE TABLE `auth_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `auth_limit_expiry` ON `auth_limits` (`expires_at`);--> statement-breakpoint
CREATE TABLE `auth_nonces` (
	`id` text PRIMARY KEY NOT NULL,
	`browser_hash` text NOT NULL,
	`address` text NOT NULL,
	`message` text NOT NULL,
	`chain_id` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `nonce_browser` ON `auth_nonces` (`browser_hash`);--> statement-breakpoint
CREATE INDEX `nonce_expiry` ON `auth_nonces` (`expires_at`);--> statement-breakpoint
CREATE TABLE `auth_sessions` (
	`hash` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`wallet` text NOT NULL,
	`chain_id` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `registrations`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_user_once` ON `auth_sessions` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `session_wallet_once` ON `auth_sessions` (`wallet`);--> statement-breakpoint
CREATE INDEX `session_expiry` ON `auth_sessions` (`expires_at`);--> statement-breakpoint
ALTER TABLE `registrations` ADD `role` text DEFAULT 'USER' NOT NULL;--> statement-breakpoint
ALTER TABLE `registrations` ADD `consented_at` integer;