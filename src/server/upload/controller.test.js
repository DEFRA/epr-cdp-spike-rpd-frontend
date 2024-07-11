import {
  uploadController,
  uploadDataController
} from '~/src/server/upload/controller.js'

describe('#uploadController', () => {
  const mockViewHandler = {
    view: jest.fn(),
    response: jest.fn().mockReturnThis(),
    code: jest.fn().mockReturnThis()
  }

  test('Should provide expected response', () => {
    uploadController.handler(null, mockViewHandler)
    expect(mockViewHandler.view).toHaveBeenCalled()
  })
})

describe('#uploadDataController', () => {
  const mockViewHandler = {
    redirect: jest.fn(),
    payload: jest.fn()
  }

  const mockRequest = {
    payload: {
      fileUpload: {
        hapi: {
          filename: 'testfile.txt',
          headers: {}
        },
        pipe: jest.fn(),
        on: jest.fn((event, callback) => {
          if (event === 'end') {
            callback()
          }
        })
      }
    }
  }

  test('Should provide expected response', () => {
    uploadDataController.handler(mockRequest, mockViewHandler)
    expect(mockViewHandler.redirect).toHaveBeenCalledWith('/upload/complete')
  })
})
