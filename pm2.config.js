module.exports = {
  apps : [{
    name      : 'zhc-new',
    node_args : '-r esm',
    script    : './server/main.js',
    instances: 1,
    autorestart: true,
    max_memory_restart: '2G',
    exec_mode: 'fork',
    watch     : false,
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
