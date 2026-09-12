-- A pair is recorded only after the server verifies current parcel access.
CREATE TABLE IF NOT EXISTS legacy_visits (
 visitor TEXT NOT NULL,
 owner TEXT NOT NULL,
 created_at INTEGER NOT NULL,
 PRIMARY KEY (visitor, owner),
 CONSTRAINT legacy_no_self CHECK (visitor <> owner)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS legacy_visits_owner ON legacy_visits(owner);
