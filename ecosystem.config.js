// PM2 configuration for running Nitro server
module.exports = {
  apps: [
    {
      name: "nitro-server",
      script: ".output/server/index.mjs",
      // db/client.ts imports bun:sqlite, a Bun builtin — the server must run
      // under Bun, not PM2's default Node interpreter. "fork" (not
      // "cluster") because PM2's cluster mode relies on Node's cluster IPC,
      // which isn't a supported interpreter combination for Bun.
      interpreter: "bun",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        NITRO_PORT: 3000,
        NITRO_HOST: "127.0.0.1",
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
    {
      // Nightly order batch chain (design B4): PM2 starts it at 01:00; it waits for each slot and exits.
      name: "order-batch-nightly",
      script: "scripts/nightly-chain.ts",
      interpreter: "bun",
      exec_mode: "fork",
      instances: 1,
      cron_restart: "0 1 * * *",
      autorestart: false,
      env: { NODE_ENV: "production" },
      error_file: "./logs/batch-err.log",
      out_file: "./logs/batch-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
    // Catalog integrity check daily at 06:00 (exit 4 = finding, 8 = populate failed).
    {
      name: "catalog-check",
      script: "scripts/catalog-check.ts",
      interpreter: "bun",
      exec_mode: "fork",
      instances: 1,
      cron_restart: "0 6 * * *",
      autorestart: false,
      env: { NODE_ENV: "production" },
      error_file: "./logs/catalog-check-err.log",
      out_file: "./logs/catalog-check-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
    // Web module availability check every 10 minutes (exit 8 = a module is down).
    {
      name: "health-check",
      script: "scripts/health-check.ts",
      interpreter: "bun",
      exec_mode: "fork",
      instances: 1,
      cron_restart: "*/10 * * * *",
      autorestart: false,
      env: { NODE_ENV: "production" },
      error_file: "./logs/health-check-err.log",
      out_file: "./logs/health-check-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};
