import { createLogger } from '~/src/server/common/helpers/logging/logger.js'
import { config } from '~/src/config/index.js'
import { ProxyAgent, fetch as undiciFetch } from 'undici'

const logger = createLogger()

const nonProxyFetch = (url, opts) => {
  return undiciFetch(url, {
    ...opts
  })
}

const proxyFetch = (url, opts, skipProxy = false) => {
  const proxy = config.get('httpsProxy') ?? config.get('httpProxy')
  if (!proxy || skipProxy) {
    return nonProxyFetch(url, opts)
  } else {
    return undiciFetch(url, {
      ...opts,
      dispatcher: new ProxyAgent({
        uri: proxy,
        keepAliveTimeout: 10,
        keepAliveMaxTimeout: 10
      })
    })
  }
}

const handleResponse = async (response) => {
  const headers = {}
  response.headers.forEach((value, name) => {
    headers[name] = value
  })

  if (response.status >= 200 && response.status < 300) {
    return {
      body: await response.json(),
      headers,
      status: response.status
    }
  } else {
    const errorMessage = `Request failed with status: ${response.status}`
    logger.info(response)
    throw new Error(errorMessage)
  }
}

const fetchProxyWrapper = async (
  url,
  options,
  skipProxy = false,
  retries = 3
) => {
  let attempt = 0
  while (attempt < retries) {
    try {
      const response = await proxyFetch(
        url,
        {
          ...options,
          method: options?.method || 'get',
          headers: {
            ...(options?.headers ?? options?.headers),
            'Content-Type': 'application/json'
          }
        },
        skipProxy
      )
      return await handleResponse(response)
    } catch (error) {
      logger.info(`Attempt ${attempt + 1} failed: ${error.message}`)
      if (attempt < retries - 1) {
        attempt++
        logger.info(`Retrying... (${attempt + 1}/${retries})`)
      } else {
        logger.info(`fetchProxyWrapper error: ${error}`)
        throw error
      }
    }
  }
}

export { fetchProxyWrapper, handleResponse }
