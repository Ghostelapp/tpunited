CREATE TABLE `parcel_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`parcel` integer NOT NULL,
	`version` text NOT NULL,
	`message` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `registrations`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `parcel_messages_recent` ON `parcel_messages` (`parcel`,`created_at`);--> statement-breakpoint
CREATE INDEX `parcel_messages_sender` ON `parcel_messages` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `parcel_presence` (
	`user_id` text PRIMARY KEY NOT NULL,
	`parcel` integer NOT NULL,
	`version` text NOT NULL,
	`x` integer NOT NULL,
	`y` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `registrations`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `parcel_presence_recent` ON `parcel_presence` (`parcel`,`updated_at`);