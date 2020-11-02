import logger from './logger'

const bus = {}

bus.setting = {
    endpoint: '',
}

bus.command = (eventMix=':', payload={}) => {
    let [ endpoint, action ] = eventMix.split(':')

    if (!action) {
        action = endpoint
        endpoint = null
    }

    if (!endpoint) {
        endpoint = bus.setting.endpoint
    }

    if (endpoint.indexOf('http') !== 0) {
        endpoint = `/${endpoint}/`.replace(/\/\//g, '/')
    }

    if (payload.action) {
        return Promise.reject('payload can not contain key "action"')
    }

    const body = {
        action,
        ...payload,
    }

    logger.debug(`bus.command: action=${action}, endpoint=${endpoint}, body=`, body)

    return fetch(`${endpoint}?action=${action}`, {
        method: 'POST',
        body: JSON.stringify(body),
    }).then(res => res.json()).then(res => {
        if (res.error) {
            return Promise.reject(res.error)
        }

        return Promise.resolve(res.data)
    })
}

bus.query  = (eventMix=':', query='') => {
    let [ endpoint, action ] = eventMix.split(':')

    if (typeof query !== 'string') {
        return Promise.reject('query must be a string')
    }

    if (!action) {
        action = endpoint
        endpoint = null
    }

    if (!endpoint) {
        endpoint = bus.setting.endpoint
    }

    if (endpoint.indexOf('http') !== 0) {
        endpoint = `/${endpoint}/`.replace(/\/\//g, '/')
    }

    if (query.indexOf('action=') !== -1) {
        return Promise.reject('query can not contain key "action"')
    }

    query = query.replace(/\?/g, '')

    logger.debug(`bus.query: action=${action}, endpoint=${endpoint}, query=`, query)

    return fetch(`${endpoint}?action=${action}&${query}`).then(res => res.json()).then(res => {
        if (res.error && res.error.message) {
            return Promise.reject(res.error)
        }

        return Promise.resolve(res.data)
    })
}

export default bus