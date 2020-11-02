import event from './event'
import logger from './logger'

const listener = {}

listener.clickListening = false

/**
 * <button click-emit="say hello:shovity" ></button>
 * click when emit event say hello with payload shovity
 */
listener.click = () => {
    if (listener.clickListening) {
        return
    }

    logger.info('listener: click-emit listenning')

    listener.clickListening = true

    function handleClickR(target, domEvent, up=0) {
        if (!up > 3 || !target) {
            return
        }
        
        const clickEvent = target.getAttribute('click-emit')

        if (!clickEvent) {
            return handleClickR(target.parentElement, domEvent, up + 1)
        }

        const clickEvents = clickEvent.split(':')
        const eventName = clickEvents[0]
        const stringPayload = clickEvents.slice(1).join(':')

        if (eventName) {
            event.emit(eventName, stringPayload, { target, domEvent })
        } else {
            logger.error('listener: can not get event name in listener click')
        }
    }

    window.document.body.addEventListener('click', domEvent => {
        handleClickR(domEvent.target, domEvent)
    })
}

export default listener
