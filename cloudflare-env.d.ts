declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    REALTIME?: Fetcher;
    WORLD: DurableObjectNamespace;
  }
}
