CREATE TABLE `checkpoints` (
	`key` text PRIMARY KEY NOT NULL,
	`block` integer NOT NULL,
	`hash` text NOT NULL,
	`locked_until` integer DEFAULT 0 NOT NULL
);
