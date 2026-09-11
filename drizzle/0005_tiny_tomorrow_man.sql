PRAGMA defer_foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_players` (
	`user_id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`state` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `registrations`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_players`("user_id", "username", "state", "revision", "updated_at", "created_at") SELECT "user_id", "username", "state", "revision", "updated_at", "created_at" FROM `players`;--> statement-breakpoint
DROP TABLE `players`;--> statement-breakpoint
ALTER TABLE `__new_players` RENAME TO `players`;--> statement-breakpoint
PRAGMA defer_foreign_keys=OFF;--> statement-breakpoint
CREATE UNIQUE INDEX `players_username_unique` ON `players` (`username`);