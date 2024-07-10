function buildNavigation(request) {
  return [
    {
      text: 'Home',
      url: '/',
      isActive: request.path === '/'
    },
    {
      text: 'About',
      url: '/about',
      isActive: request.path === '/about'
    },
    {
      text: 'Upload your packaging data',
      url: '/upload',
      isActive: request.path === '/upload'
    }
  ]
}

export { buildNavigation }
