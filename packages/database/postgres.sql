-- Optional standalone blockchain indexer only. Application accounts live in D1.
CREATE TABLE IF NOT EXISTS chain_events(chain_id INTEGER NOT NULL,contract TEXT NOT NULL,tx TEXT NOT NULL,log_index INTEGER NOT NULL,block_number BIGINT NOT NULL,block_hash TEXT NOT NULL,event_name TEXT NOT NULL,args JSONB NOT NULL,PRIMARY KEY(chain_id,contract,tx,log_index));
CREATE INDEX IF NOT EXISTS chain_events_block_idx ON chain_events(chain_id,block_number);
CREATE TABLE IF NOT EXISTS chain_checkpoints(chain_id INTEGER PRIMARY KEY,block_number BIGINT NOT NULL,block_hash TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS land_projection(chain_id INTEGER NOT NULL,contract TEXT NOT NULL,token_id INTEGER NOT NULL,owner TEXT NOT NULL,block_number BIGINT NOT NULL,PRIMARY KEY(chain_id,contract,token_id));
