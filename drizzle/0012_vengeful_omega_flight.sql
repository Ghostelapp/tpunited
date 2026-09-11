CREATE TABLE `decoration_cells` (
	`parcel` integer NOT NULL,
	`x` integer NOT NULL,
	`y` integer NOT NULL,
	`item_id` integer NOT NULL,
	FOREIGN KEY (`item_id`) REFERENCES `parcel_decorations`(`item_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `decor_cell_once` ON `decoration_cells` (`parcel`,`x`,`y`);--> statement-breakpoint
CREATE INDEX `decor_cell_item` ON `decoration_cells` (`item_id`);--> statement-breakpoint
CREATE TABLE `decoration_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`image` text NOT NULL,
	`rarity` text NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`chain_id` integer NOT NULL,
	`contract` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `parcel_decorations` (
	`item_id` integer PRIMARY KEY NOT NULL,
	`parcel` integer NOT NULL,
	`x` integer NOT NULL,
	`y` integer NOT NULL,
	`rotation` integer NOT NULL,
	`owner` text NOT NULL,
	`land_version` text NOT NULL,
	`token_version` text NOT NULL,
	FOREIGN KEY (`item_id`) REFERENCES `decoration_items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `decor_parcel_idx` ON `parcel_decorations` (`parcel`);