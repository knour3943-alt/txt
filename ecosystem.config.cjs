// PM2 config — runs `wrangler pages dev` against the production-like build,
// so /api/* (Pages Functions) work the same as in production.
module.exports = {
  apps: [
    {
      name: 'tamrediano',
      script: 'npx',
      args: 'wrangler pages dev dist --ip 0.0.0.0 --port 3000 --compatibility-date=2024-09-01 --compatibility-flag=nodejs_compat',
      env: { NODE_ENV: 'development' },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
    },
  ],
}
