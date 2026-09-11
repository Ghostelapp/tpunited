CREATE TABLE `sync_state` (
	`key` text PRIMARY KEY NOT NULL,
	`block` integer NOT NULL,
	`block_hash` text NOT NULL,
	`lease` integer DEFAULT 0 NOT NULL
);
