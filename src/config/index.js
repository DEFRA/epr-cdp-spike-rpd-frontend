import convict from 'convict'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const oneHour = 1000 * 60 * 60
const fourHours = oneHour * 4
const oneWeekMillis = oneHour * 24 * 7

const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 3000,
    env: 'PORT'
  },
  urlList: [
    {
      text: 'tstdmpinfdl1001.blob.core.windows.net',
      value: 'tstdmpinfdl1001.blob.core.windows.net'
    },
    {
      text: 'tstdmpinfdl1001.privatelink.blob.core.windows.net',
      value: 'tstdmpinfdl1001.privatelink.blob.core.windows.net'
    },
    {
      text: 'tstdmpinfdl1001 10.205.135.135',
      value: '10.205.135.135'
    },
    {
      text: 'devdmpinfdl1001.blob.core.windows.net',
      value: 'devdmpinfdl1001.blob.core.windows.net'
    },
    {
      text: 'devdmpinfdl1001.privatelink.blob.core.windows.net',
      value: 'devdmpinfdl1001.privatelink.blob.core.windows.net'
    },
    {
      text: 'devdmpinfdl1001 10.205.131.199',
      value: '10.205.131.199'
    },
    {
      text: 'snddmpinfdl1001.blob.core.windows.net',
      value: 'snddmpinfdl1001.blob.core.windows.net'
    },
    {
      text: 'snddmpinfdl1001.privatelink.blob.core.windows.net',
      value: 'snddmpinfdl1001.privatelink.blob.core.windows.net'
    },
    {
      text: 'snddmpinfdl1001 10.205.59.135',
      value: '10.205.59.135'
    },
    {
      text: 'www.google.co.uk',
      value: 'www.google.co.uk',
      selected: true
    },
    {
      text: 'fcpaipocuksoai.privatelink.openai.azure.com',
      value: 'fcpaipocuksoai.privatelink.openai.azure.com'
    },
    {
      text: '10.205.37.245 fcpaipocuksoai.privatelink.openai.azure.com',
      value: '10.205.37.245'
    },
    {
      text: 'fcpaipocuksss.search.windows.net',
      value: 'fcpaipocuksss.search.windows.net'
    },
    {
      text: '10.205.37.246 fcpaipocuksss.search.windows.net',
      value: '10.205.37.246'
    }
  ],
  staticCacheTimeout: {
    doc: 'Static cache timeout in milliseconds',
    format: Number,
    default: oneWeekMillis,
    env: 'STATIC_CACHE_TIMEOUT'
  },
  serviceName: {
    doc: 'Applications Service Name',
    format: String,
    default: 'epr-cdp-spike-rpd-frontend'
  },
  root: {
    doc: 'Project root',
    format: String,
    default: path.resolve(dirname, '../..')
  },
  assetPath: {
    doc: 'Asset path',
    format: String,
    default: '/public',
    env: 'ASSET_PATH'
  },
  isProduction: {
    doc: 'If this application running in the production environment',
    format: Boolean,
    default: process.env.NODE_ENV === 'production'
  },
  isDevelopment: {
    doc: 'If this application running in the development environment',
    format: Boolean,
    default: process.env.NODE_ENV !== 'production'
  },
  isTest: {
    doc: 'If this application running in the test environment',
    format: Boolean,
    default: process.env.NODE_ENV === 'test'
  },
  logLevel: {
    doc: 'Logging level',
    format: ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'],
    default: 'info',
    env: 'LOG_LEVEL'
  },
  httpProxy: {
    doc: 'HTTP Proxy',
    format: String,
    nullable: true,
    default: null,
    env: 'CDP_HTTP_PROXY'
  },
  httpsProxy: {
    doc: 'HTTPS Proxy',
    format: String,
    nullable: true,
    default: null,
    env: 'CDP_HTTPS_PROXY'
  },
  session: {
    cache: {
      name: {
        doc: 'server side session cache name',
        format: String,
        default: 'session',
        env: 'SESSION_CACHE_NAME'
      },
      ttl: {
        doc: 'server side session cache ttl',
        format: Number,
        default: fourHours,
        env: 'SESSION_CACHE_TTL'
      }
    },
    cookie: {
      ttl: {
        doc: 'Session cookie ttl',
        format: Number,
        default: fourHours,
        env: 'SESSION_COOKIE_TTL'
      },
      password: {
        doc: 'session cookie password',
        format: String,
        default: 'the-password-must-be-at-least-32-characters-long',
        env: 'SESSION_COOKIE_PASSWORD',
        sensitive: true
      }
    }
  },
  redis: {
    enabled: {
      doc: 'Enable Redis on your Frontend. Before you enable Redis, contact the CDP platform team as we need to set up config so you can run Redis in CDP environments',
      format: Boolean,
      default: false,
      env: 'REDIS_ENABLED'
    },
    host: {
      doc: 'Redis cache host',
      format: String,
      default: '127.0.0.1',
      env: 'REDIS_HOST'
    },
    username: {
      doc: 'Redis cache username',
      format: String,
      default: '',
      env: 'REDIS_USERNAME'
    },
    password: {
      doc: 'Redis cache password',
      format: '*',
      default: '',
      sensitive: true,
      env: 'REDIS_PASSWORD'
    },
    keyPrefix: {
      doc: 'Redis cache key prefix name used to isolate the cached results across multiple clients',
      format: String,
      default: 'cdp-example-node-frontend:',
      env: 'REDIS_KEY_PREFIX'
    },
    useSingleInstanceCache: {
      doc: 'Enable the use of a single instance Redis Cache',
      format: Boolean,
      default: process.env.NODE_ENV !== 'production',
      env: 'USE_SINGLE_INSTANCE_CACHE'
    }
  }
})

config.validate({ allowed: 'strict' })

export { config }
