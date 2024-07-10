import { uploadController, uploadDataController, uploadErrorController, uploadCompleteController} from '~/src/server/upload/controller.js'

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
    redirect: jest.fn()
  }

  test('Should provide expected response', () => {
    uploadDataController.handler(null, mockViewHandler)
    expect(mockViewHandler.redirect).toHaveBeenCalledWith("home")
  })
})

describe('#uploadErrorController', () => {
  const mockViewHandler = {
    redirect: jest.fn()
  }

  test('Should provide expected response', () => {
    uploadErrorController.handler(null, mockViewHandler)
    expect(mockViewHandler.view).toHaveBeenCalled()
  })
})

describe('#uploadCompleteController', () => {
  const mockViewHandler = {
    redirect: jest.fn()
  }

  test('Should provide expected response', () => {
    uploadCompleteController.handler(null, mockViewHandler)
    expect(mockViewHandler.view).toHaveBeenCalled()
  })
})
