CREATE TABLE `founder_interest` (
	`user_id` text PRIMARY KEY NOT NULL,
	`preference` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `registrations`(`user_id`) ON UPDATE no action ON DELETE no action
);
