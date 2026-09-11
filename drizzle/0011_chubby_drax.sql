CREATE TABLE `referral_codes` (
	`user_id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `registrations`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `referral_code_once` ON `referral_codes` (`code`);--> statement-breakpoint
CREATE TABLE `referrals` (
	`user_id` text PRIMARY KEY NOT NULL,
	`referrer_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`season_id` text,
	`note` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`reviewed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `registrations`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`referrer_id`) REFERENCES `registrations`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`season_id`) REFERENCES `seasons`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `referral_referrer` ON `referrals` (`referrer_id`,`status`,`season_id`);