CREATE TABLE `nft_holdings` (
	`item_id` integer PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`checked_at` integer NOT NULL,
	FOREIGN KEY (`item_id`) REFERENCES `nft_items`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `registrations`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `nft_holder` ON `nft_holdings` (`user_id`);--> statement-breakpoint
CREATE TABLE `nft_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`image` text NOT NULL,
	`slot` text NOT NULL,
	`rarity` text NOT NULL,
	`damage` integer NOT NULL,
	`armor` integer NOT NULL,
	`min_level` integer NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`chain_id` integer NOT NULL,
	`contract` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `chat_user_time` ON `chat` (`user_id`,`created_at`);