import { createLogger } from '~/src/server/common/helpers/logging/logger.js'
import axios from 'axios'
import util from 'node:util'
import childprocess from 'node:child_process'
import dig from 'node-dig-dns'
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

    const url = `https://${requested.query.resource}`
    const baseurl = `${requested.query.resource}`
    const enabled = requested.query.enabled ?? []
    const pingEnabled = enabled.includes('ping')
    const digEnabled = enabled.includes('dig')
    const tracepathEnabled = enabled.includes('tracepath')
    const curlEnabled = enabled.includes('curl')

    // const backendApi = config.get('tdmBackendApi')
    // const authedUser = await request.getUserSession()
    // const url = `${backendApi}/sync/${request.query.resource}/${request.query.period}`

    logger.info(`Making call to ${url}`)

    const results = []

    let pingresult
    let digresult
    let traceresult
    let curlResult

    const hostsToAdd =
      ' --resolve fcpaipocuksss.search.windows.net:443:10.205.37.246' +
      ' --resolve fcpaipocuksoai.privatelink.openai.azure.com:443:10.205.37.245' +
      ' --resolve devdmpinfdl1001.blob.core.windows.net:443:10.205.131.199' +
      ' --resolve devdmpinfdl1001.privatelink.blob.core.windows.net:443:10.205.131.199'

    try {
      curlResult = curlEnabled
        ? await execRun(`curl -m 5 -L -v ${hostsToAdd} ${url}`, true)
        : ''
      logger.info(`curlResult: ${JSON.stringify(curlResult)}`)
      pingresult = pingEnabled ? await execRun(`ping -c 1 ${baseurl}`) : ''
      logger.info(`ping: ${JSON.stringify(pingresult)}`)
      digresult = digEnabled ? await digRun(`${baseurl}`) : { answer: [''] }
      logger.info(`dig: ${JSON.stringify(digresult)}`)
      traceresult = tracepathEnabled
        ? await execRun(`tracepath ${baseurl}`)
        : ''
      logger.info(`traceroute: ${JSON.stringify(traceresult)}`)
      const checkResponse = await axios.get(url, {
        // headers: {
        //   Authorization: `Bearer ${authedUser.jwt}`
        // }
        timeout: 2000
      })
      logger.info(`${checkResponse.status} : ${checkResponse.statusText}`)
      results.push({
        url,
        status: checkResponse.status,
        statusText: checkResponse.statusText,
        dataTrim: `${checkResponse.data.substring(0, 100)}...`,
        pingout: formatResult(pingresult),
        digout: formatDig(digresult),
        traceout: formatResult(traceresult),
        curlResult: formatResult(curlResult)
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
          text: 'About',
          href: `/about`
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

const execRun = (cmd, logError) => {
  return new Promise((resolve, reject) => {
    const logger = createLogger()
    exec(cmd, (error, stdout, stderr) => {
      logger.info(`std error: ${error}`)
      logger.info(`std stdout: ${stdout}`)
      logger.info(`std stderr: ${stderr}`)
      logError ? resolve(stderr) : resolve(stdout)
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
  return intext.replace(/\n/g, '<br>')
}

const formatDig = (digResult) => {
  return digResult.answer
    .map((e) => `${e.domain} ${e.type} ${e.ttl} ${e.class} ${e.value}`)
    .join('<br>')
}
