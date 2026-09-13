CREATE TABLE `analytics_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `analytics_limit_expiry` ON `analytics_limits` (`expires_at`);--> statement-breakpoint
CREATE TABLE `analytics_views` (
	`id` text PRIMARY KEY NOT NULL,
	`visitor` text NOT NULL,
	`session` text NOT NULL,
	`user_id` text,
	`host` text NOT NULL,
	`path` text NOT NULL,
	`referrer` text NOT NULL,
	`source` text NOT NULL,
	`medium` text NOT NULL,
	`campaign` text NOT NULL,
	`country` text NOT NULL,
	`device` text NOT NULL,
	`browser` text NOT NULL,
	`os` text NOT NULL,
	`started_at` integer NOT NULL,
	`last_seen` integer NOT NULL,
	`active_seconds` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `analytics_started` ON `analytics_views` (`started_at`);--> statement-breakpoint
CREATE INDEX `analytics_seen` ON `analytics_views` (`last_seen`);--> statement-breakpoint
CREATE INDEX `analytics_visitor_time` ON `analytics_views` (`visitor`,`started_at`);--> statement-breakpoint
CREATE INDEX `analytics_session` ON `analytics_views` (`session`);