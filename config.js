
module.exports = {
  ssl: {
    key: '/path/to/your/domain.key',
    cert: '/path/to/your/domain.crt',
    enabled: false
  },
  server: {
    port: 8080,
    root: 'selfie',
    id: 'selfielog'
  },
  aws: {
    bucket: 'yourBucket',
    access: 'yourAccessKey',
    secret: 'yourSecretKey'
  },
  imagemin: {
    interlaced: true,
    progressive: true,
    optimizationLevel: 3
  },
  hashid: {
    salt: 'yourHashSalt',
    length: 4
  },
  redis: {
    port: 6379,
    host: 'localhost'
  },
  logger: {
    info: true,
    warn: true,
    debug: true,
    trace: true,
    error: true,
    fatal: true
  }
};
