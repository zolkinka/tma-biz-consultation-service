module.exports = {
  apps: [
    {
      name: 'consultation-system',
      script: './dist/server/index.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        CONSULTATION_PORT: 3010
      },
      env_development: {
        NODE_ENV: 'development',
        CONSULTATION_PORT: 3010
      },
      log_file: './logs/app.log',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      restart_delay: 1000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};

