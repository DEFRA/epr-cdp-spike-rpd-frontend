/* eslint-disable camelcase */
import { createLogger } from '~/src/server/common/helpers/logging/logger.js'
// import axios from 'axios'
import util from 'node:util'
import childprocess from 'node:child_process'
import dig from 'node-dig-dns'
import { proxyFetch } from '../common/helpers/proxy-fetch.js'
import { config } from '~/src/config/index.js'
import crypto from 'crypto'

const exec = util.promisify(childprocess.exec)

const makeConnectionController = {
  handler: async (request, h) => {
    const logger = createLogger()
    const requested = {
      params: request.params,
      query: request.query,
      form: request.form
    }
    logger.info(`Get received request: ${JSON.stringify(requested)}`)

    const resource = requested.query.resource
    logger.info(`Resource: ${resource}`)
    const urlList = config.get('urlList')
    logger.info(`urlList: ${JSON.stringify(urlList)}`)
    const urlItem = urlList.filter((e) => `${e.value}` === resource)
    logger.info(`urlItem: ${JSON.stringify(urlItem)}`)
    const baseurl = urlItem[0].url
    logger.info(`url: ${JSON.stringify(baseurl)}`)
    const url = `https://${baseurl}`
    logger.info(`url: ${JSON.stringify(url)}`)
    const enabled = requested.query.enabled ?? []
    const pingEnabled = enabled.includes('ping')
    const digEnabled = enabled.includes('dig')
    const tracepathEnabled = enabled.includes('tracepath')
    const curlEnabled = enabled.includes('curl')
    const ignoreCert = enabled.includes('ignoreCert') ? ' -k ' : ''
    const proxyCommand = process.env.CDP_HTTPS_PROXY
      ? ' -x $CDP_HTTPS_PROXY '
      : ''

    // auth junk
    const useHeaders = !!urlItem[0].DMP_BLOB_STORAGE_NAME
    const request_method = 'GET'
    const nowDate = new Date().toUTCString()
    const x_ms_date_h = `x-ms-date:${nowDate}`
    const storage_service_version = '2019-12-12'
    const x_ms_version_h = `x-ms-version:${storage_service_version}`
    const canonicalized_headers = `${x_ms_date_h}\n${x_ms_version_h}`

    const storage_account = urlItem[0].DMP_BLOB_STORAGE_NAME
    const container_name = urlItem[0].DmpBlobContainer

    const canonicalized_resource = container_name
      ? `/${storage_account}/${container_name}`
      : ''

    const requestParams = container_name ? `?comp=list&restype=container` : ''

    const string_to_sign = `${request_method}\n\n\n\n\n\n\n\n\n\n\n\n${canonicalized_headers}\n${canonicalized_resource}\ncomp:list\nrestype:container`

    logger.info(`Signing this [${string_to_sign}]`)

    const secret = process.env.AZURE_CLIENT_SECRET ?? 'SECRETSQUIRREL'

    logger.info(
      `Secret is Using ${secret === 'SECRETSQUIRREL' ? 'SECRETSQUIRREL' : 'REALKEY'}`
    )

    const signature = crypto
      .createHmac('SHA256', Buffer.from(secret, 'base64'))
      .update(string_to_sign)
      .digest('base64')

    logger.info(`Signature: ${signature}`)
    const authorization = `SharedKey`
    const authorization_header = `Authorization: ${authorization} ${storage_account}:${signature}`

    logger.info(`Auth Header: ${authorization_header}`)
    // auth junk end

    const pathToContainer = container_name ? `/${container_name}` : ''

    const fullUrl = url + pathToContainer + requestParams

    const extraHeaders = useHeaders
      ? `-H "${x_ms_date_h}" -H "${x_ms_version_h}" -H "${authorization_header}"`
      : ''

    const hostsToAdd =
      ' --resolve fcpaipocuksss.search.windows.net:443:10.205.37.246' +
      ' --resolve fcpaipocuksoai.privatelink.openai.azure.com:443:10.205.37.245' +
      ' --resolve devdmpinfdl1001.blob.core.windows.net:443:10.205.131.199' +
      ' --resolve devdmpinfdl1001.privatelink.blob.core.windows.net:443:10.205.131.199'

    const curlCommand = `curl ${proxyCommand} -m 5 -L ${extraHeaders} -v ${hostsToAdd} "${fullUrl}" ${ignoreCert}`

    logger.info(`Making call to ${fullUrl}`)

    const results = []

    let pingresult
    let digresult
    let traceresult
    let curlResult

    try {
      logger.info(`Curl command [${curlCommand}]`)
      curlResult = curlEnabled ? await execRun(curlCommand) : ''
      logger.info(`curlResult Error: ${formatResult(curlResult.stderr)}`)
      logger.info(`curlResult StdOut: ${formatResult(curlResult.stdout)}`)

      pingresult = pingEnabled ? await execRun(`ping -c 1 ${baseurl}`) : ''
      logger.info(`ping: ${JSON.stringify(pingresult.stderr)}`)
      logger.info(`ping: ${JSON.stringify(pingresult.stdout)}`)

      digresult = digEnabled ? await digRun(`${baseurl}`) : {}
      logger.info(`dig: ${JSON.stringify(digresult)}`)
      traceresult = tracepathEnabled
        ? await execRun(`tracepath ${baseurl}`)
        : ''
      logger.info(`tracepath stdError: ${JSON.stringify(traceresult.stderr)}`)
      logger.info(`tracepath stdOut: ${JSON.stringify(traceresult.stdout)}`)

      logger.info('Running proxyFetch')
      const proxyFetchHeaders = {
        'x-ms-date': nowDate,
        'x-ms-version': storage_service_version,
        Authorization: authorization_header
      }
      const checkResponse = await proxyFetch(
        fullUrl,
        useHeaders
          ? {
              timeout: 2000,
              headers: proxyFetchHeaders
            }
          : { timeout: 2000 }
      )

      logger.info(
        `Status Response : ${checkResponse.status} : ${checkResponse.statusText}`
      )
      const responseText = await checkResponse.text()
      results.push({
        fullUrl,
        status: checkResponse.status,
        statusText: checkResponse.statusText,
        dataTrim: `${responseText.substring(0, 100)}...`,
        pingout: formatResult(pingresult.stdout),
        pingoutError: formatResult(pingresult.stderr),
        digout: formatDig(digresult),
        traceout: formatResult(traceresult.stdout),
        traceoutError: formatResult(traceresult.stderr),
        curlResult: formatResult(curlResult.stdout),
        curlResultError: formatResult(curlResult.stderr)
      })
      logger.info(`PingOut: ${results[0].pingout}`)
    } catch (error) {
      logger.info(error)
      results.push({
        url,
        errorMessage: error.message,
        stack: error.stack,
        status: error.code,
        statusText: error.status,
        pingout: pingresult,
        digout: JSON.stringify(digresult),
        traceout: traceresult,
        curlResult: formatResult(curlResult)
      })
    }

    return h.view('connectivity/connections', {
      pageTitle: `Connection result`,
      heading: `Connection result`,
      breadcrumbs: [
        {
          text: 'Home',
          href: '/'
        },
        {
          text: 'Connectivity',
          href: `/connectivity`
        }
      ],
      checkResult: results[0],
      lastUpdated: 'Today'
    })
  }
}

export { makeConnectionController }

const execRun = (cmd) => {
  return new Promise((resolve, reject) => {
    const logger = createLogger()
    exec(cmd, (error, stdout, stderr) => {
      logger.info(`std error: ${error}`)
      logger.info(`std stdout: ${stdout}`)
      logger.info(`std stderr: ${stderr}`)
      resolve({ stderr, stdout })
    })
  })
}

const digRun = (baseUrl) => {
  return new Promise((resolve, reject) => {
    const logger = createLogger()
    dig([baseUrl, 'ANY'])
      .then((result) => {
        logger.info(`digRun result: ${result}`)
        return resolve(result)
      })
      .catch((err) => {
        logger.info(`digRun Error: ${err}`)
        return resolve(err)
      })
  })
}

const formatResult = (intext) => {
  return intext instanceof String
    ? intext
        .replace(/\n/g, '<br>')
        .replace(/HTTPS_PROXY.*@/g, 'HTTPS_PROXY == ************@')
    : ''
}

const formatDig = (digResult) => {
  return digResult?.answer
    ? digResult.answer
        .map((e) => `${e.domain} ${e.type} ${e.ttl} ${e.class} ${e.value}`)
        .join('<br>')
    : ''
}
