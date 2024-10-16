import { createLogger } from '~/src/server/common/helpers/logging/logger.js'
import axios from 'axios'
import util from 'node:util'
import childprocess from 'node:child_process'
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

    // const backendApi = config.get('tdmBackendApi')
    // const authedUser = await request.getUserSession()
    // const url = `${backendApi}/sync/${request.query.resource}/${request.query.period}`

    logger.info(`Making call to ${url}`)

    const results = []

    let pingresult
    let digresult
    let traceresult

    try {
      pingresult = await execRun(`ping -c 1 ${baseurl}`)
      logger.info(`ping: ${JSON.stringify(pingresult)}`)
      digresult = await execRun(`dig ${baseurl}`)
      logger.info(`dig: ${JSON.stringify(digresult)}`)
      traceresult = await execRun(`traceroute ${baseurl}`)
      logger.info(`traceroute: ${JSON.stringify(traceresult)}`)
       const checkResponse = await axios.get(url, {
      // headers: {
      //   Authorization: `Bearer ${authedUser.jwt}`
      // }
       })
       logger.info(`${checkResponse.status} : ${checkResponse.statusText}`)
      results.push({
        url,
        status: checkResponse.status,
        statusText: checkResponse.statusText,
        dataTrim: `${checkResponse.data.substring(0, 100)}...`,
        pingout: pingresult,
        digout: digresult,
        traceout: traceresult
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
        digout: digresult,
        traceout: traceresult
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

const execRun = (cmd) => {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
        resolve(stdout);
    })
  })
}
