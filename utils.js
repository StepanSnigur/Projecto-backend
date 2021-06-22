const parseWebSocketUrl = (url) => {
  const res = {}
  const variables = url.split('?')[1].split('&')
  variables.forEach(variable => {
    const [key, value] = variable.split('=')
    res[key] = value
  })
  return res
}

const mockResolve = {
  status: () => ({
    json: () => {}
  }),
  json: () => {}
}

module.exports = {
  parseWebSocketUrl,
  mockResolve
}
