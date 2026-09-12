CREATE TABLE `realtime_commit_guard` (
	`id` integer PRIMARY KEY NOT NULL,
	`ok` integer NOT NULL,
	CONSTRAINT "realtime_guard_singleton" CHECK("realtime_commit_guard"."id" = 1),
	CONSTRAINT "realtime_guard_valid" CHECK("realtime_commit_guard"."ok" = 1)
);
--> statement-breakpoint
CREATE TABLE `realtime_world` (
	`id` text PRIMARY KEY NOT NULL,
	`monsters` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL
);
