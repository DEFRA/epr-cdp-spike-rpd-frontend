import { createLogger } from '~/src/server/common/helpers/logging/logger.js'

const makePostConnectionController = {
  handler: async (request, h) => {
    const logger = createLogger()
    const requested = {
      params: request.params,
      query: request.query,
      form: request.form
    }
    logger.info(`Post received request: ${JSON.stringify(requested)}`)

    // const backendApi = config.get('tdmBackendApi')
    // const authedUser = await request.getUserSession()
    // const url = `${backendApi}/sync/${request.query.resource}/${request.query.period}`

    // logger.info(`Making API call to ${url}`)

    // await axios.get(url, {
    //   headers: {
    //     Authorization: `Bearer ${authedUser.jwt}`
    //   }
    // })

    return h.view('connectivity/postconnections', {
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
      notification: {
        status: 'Hello',
        partOne: 'Hello',
        lastUpdatedBy: 'Hello',
        importer: 'Hello',
        consignor: 'Hello'
      },
      lastUpdated: 'Today'
    })
  }
}

export { makePostConnectionController }
