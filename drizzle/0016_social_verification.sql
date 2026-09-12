ALTER TABLE campaigns ADD COLUMN verification TEXT NOT NULL DEFAULT 'manual';
--> statement-breakpoint
ALTER TABLE campaigns ADD COLUMN target TEXT NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE campaigns ADD COLUMN role_id TEXT NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE campaigns ADD COLUMN threshold INTEGER NOT NULL DEFAULT 1;
--> statement-breakpoint
CREATE TABLE social_accounts (user_id TEXT NOT NULL REFERENCES registrations(user_id), provider TEXT NOT NULL, external_id TEXT NOT NULL, display_name TEXT NOT NULL, verified_at INTEGER NOT NULL, PRIMARY KEY(user_id,provider));
--> statement-breakpoint
CREATE TABLE social_oauth_states (hash TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL REFERENCES registrations(user_id), session_hash TEXT NOT NULL, campaign_id TEXT NOT NULL REFERENCES campaigns(id), origin TEXT NOT NULL, expires_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE INDEX social_oauth_expiry ON social_oauth_states(expires_at);

--> statement-breakpoint
CREATE UNIQUE INDEX social_external_once ON social_accounts(provider,external_id);
