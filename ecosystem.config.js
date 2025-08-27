module.exports = {
  apps: [
    {
      name: 'consultation-system',
      script: 'server/index.ts',
      cwd: './src/consultation-system',
      interpreter: 'tsx',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        CONSULTATION_PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        CONSULTATION_PORT: 3001
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
};
