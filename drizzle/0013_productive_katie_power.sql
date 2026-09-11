CREATE TABLE `homestead_vaults` (
	`user_id` text PRIMARY KEY NOT NULL,
	`scrap` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `registrations`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `parcel_homes` (
	`parcel` integer PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`version` text NOT NULL,
	`visibility` text DEFAULT 'private' NOT NULL,
	`guests` text DEFAULT '[]' NOT NULL,
	`workshop` integer DEFAULT 0 NOT NULL,
	`warehouse` integer DEFAULT 0 NOT NULL,
	`garden` integer DEFAULT 0 NOT NULL,
	`harvest_at` integer DEFAULT 0 NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tutorial_rewards` (
	`user_id` text PRIMARY KEY NOT NULL,
	`visited_at` integer DEFAULT 0 NOT NULL,
	`claimed_at` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `registrations`(`user_id`) ON UPDATE no action ON DELETE no action
);
