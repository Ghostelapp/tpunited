ALTER TABLE campaigns ADD COLUMN chain_id INTEGER NOT NULL DEFAULT 84532;
ALTER TABLE campaigns ADD COLUMN requirement_amount TEXT NOT NULL DEFAULT '1';
ALTER TABLE campaigns ADD COLUMN token_id TEXT NOT NULL DEFAULT '0';
CREATE TABLE quest_checks (
 user_id TEXT NOT NULL REFERENCES registrations(user_id),
 campaign_id TEXT NOT NULL REFERENCES campaigns(id),
 checked_at INTEGER NOT NULL,
 status TEXT NOT NULL,
 message TEXT NOT NULL,
 progress TEXT,
 PRIMARY KEY(user_id,campaign_id)
);
CREATE INDEX quest_checks_recent ON quest_checks(checked_at);
