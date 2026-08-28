// EXAMPLE PM2 CONFIGURATION TEMPLATE
// Copy this file to "ecosystem.config.js" and enter your real credentials.
// Do NOT commit your finalized "ecosystem.config.js" to git.

module.exports = {
  apps: [
    {
      name: 'label-generator',
      script: './server/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
        MONGODB_URI: 'mongodb://127.0.0.1:27017/label-generator',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 80,
        MONGODB_URI: 'mongodb+srv://<DB_USER>:<DB_PASSWORD>@<CLUSTER_URL>/label-generator',
        ACCESS_TOKEN_SECRET: 'YOUR_PRODUCTION_ACCESS_TOKEN_JWT_SECRET',
        REFRESH_TOKEN_SECRET: 'YOUR_PRODUCTION_REFRESH_TOKEN_JWT_SECRET',
      }
    }
  ]
};
