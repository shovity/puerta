import logger from './logger'

const PREFIX = 'puerta'
const KEY_BLACK_LIST = [ 'origin' ]

const storage = {}

const handler = {}

handler.get = (target, key) => {
    if (key === 'origin') {
        return target
    }

    let value = undefined

    const rawData = localStorage[`${PREFIX}:${key}`]
    
    try {
        value = rawData && JSON.parse(rawData)
    } catch (error) {
        return logger.error('storage: parse json fail, key: ', key)
    }

    return value
}

handler.set = (target, key, value) => {    
    if (KEY_BLACK_LIST.indexOf(key) !== -1) {
        return logger.error('storage: key can not use', key)
    }

    const rawData = JSON.stringify(value)
    localStorage[`${PREFIX}:${key}`] = rawData
    target[key] = value
    return true
}

const storageProxy = new Proxy(storage, handler)

export default storageProxy
