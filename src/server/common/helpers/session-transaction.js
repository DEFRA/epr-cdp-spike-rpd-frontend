const sessionTransaction = async (
  request,
  h,
  valueObj,
  sessionKey,
  label = '',
  isCommit = true
) => {
  const sessionData = request.yar.get(sessionKey)

  request.yar.set(sessionKey, { ...sessionData, ...valueObj })
  isCommit && (await request.yar.commit(h))

  const sessionDataObj = request.yar.get(sessionKey)

  request.logger.debug({ sensitive: sessionDataObj }, `${label} Session info`)

  return sessionDataObj
}

export { sessionTransaction }
