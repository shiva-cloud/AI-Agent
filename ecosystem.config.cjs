// ecosystem.config.cjs
// Production process management configuration for PM2 & container orchestration
module.exports = {
  apps: [
    {
      name: 'northstar-server',
      script: 'src/server.js',
      instances: 1,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      kill_timeout: 6000,
      wait_ready: true,
      listen_timeout: 8000,
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 8080
      }
    },
    {
      name: 'northstar-cron-crawler',
      script: 'scripts/realtime-cron-runner.js',
      args: '--daemon --interval 60000',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '384M',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
