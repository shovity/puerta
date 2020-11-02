/**
 * Event Emiter:
 * Features base
 */
import logger from './logger'

const event = {
    _eventPools: [],
}

event.emit = (name, ...payload) => {
    logger.debug(`event.emit: ${name}`, payload)

    const hitEvent = event._eventPools.find(e => e.name === name)

    if (!hitEvent) {
        return logger.debug(`event.emit: dont hit event ${name}`)
    }

    const handles = hitEvent.handles

    // put list handle to next tick event loop
    setTimeout(() => {
        handles.forEach(handle => {
            handle(...payload)
        })
    })
}

event.listen = (name, handle) => {
    const existsEvent = event._eventPools.find(e => e.name === name)

    if (existsEvent) {
        existsEvent.handles.push(handle)
    } else {
        const newEvent = { name, handles: [ handle ] }
        event._eventPools.push(newEvent)
    }
}

event.removeListen = (name, handleName, option) => {
    const hitEvent = event._eventPools.find(e => e.name === name)
    if (!hitEvent) {
        return 'not_found'
    }

    if (option.removeAll) {
        hitEvent.handles = []
        return
    }

    hitEvent.handles = hitEvent.handles.filter(handle => handle.name !== name)
}

export default event
