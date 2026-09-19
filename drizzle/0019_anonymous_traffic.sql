CREATE TABLE IF NOT EXISTS analytics_counts (
 day TEXT NOT NULL,
 host TEXT NOT NULL,
 path TEXT NOT NULL,
 views INTEGER NOT NULL DEFAULT 0,
 PRIMARY KEY (day,host,path)
);
