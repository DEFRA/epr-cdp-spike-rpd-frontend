/**
 * A GDS styled example about page controller.
 * Provided as an example, remove or modify as required.
 */
import { config } from '~/src/config/index.js'

const connectivityController = {
  handler: (request, h) => {
    return h.view('connectivity/index', {
      pageTitle: 'Connectivity',
      heading: 'Connectivity',
      breadcrumbs: [
        {
          text: 'Home',
          href: '/'
        },
        {
          text: 'Connectivity'
        }
      ],
      urlList: config.get('urlList')
    })
  }
}

export { connectivityController }
