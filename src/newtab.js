import './wallpaper'
import './prototype'

import event from './core/event'
import listener from './core/listener'
import storage from './core/storage'
import logger from './core/logger'

import noter from './noter'
import bookmark from './bookmark'
import waver from './waver'
import setting from './setting'
// import contextMenu from './contextMenu'


window.DEFAULT_CONFIG = {
    log_level: 'error',
}

// init config
window.config = storage.config || DEFAULT_CONFIG

// init holder
window.holder = {
    uuid: `${Date.now()}_${Math.random()}`,
    requset_interval: null,
    background_not_ready: true,
    request_boot_system_delay: 1000,
    w_w: window.document.documentElement.clientWidth,
    w_h: window.document.documentElement.clientHeight,

    // code snipets
    code_tables: [
        { code: 'date==', value: new Date().toLocaleDateString() },
        { code: 'time==', value: new Date().toLocaleTimeString() },
        { code: 'now==', value: new Date().toLocaleString() },
        // { code: 'name_(.+?)', value: 'Hi sir, $ <3' },
    ],

    blob_buffer_url: null,
}

// create port to connect to background scripts (when boot chrome)
window.port = chrome.runtime.connect({ name: "pip" })

// global notes
window.notes = []

// settings logger
logger.log_level = config.log_level


listener.click()


/**
* Handle onetime message
* ======================
*/
chrome.runtime.onMessage.addListener(message => {
    const { request, sender } = message

    logger.debug('receive onetime message', message)

    switch (request) {
        case 'note_updated':
            if (sender === holder.uuid) {
                // ignore
            } else {
                // request get notes
                port.postMessage({ request: 'get_notes' })
            }
            break

        default:
            logger.error('one time message out of services')
    }
})


/**
* Handle revice long connect "pip"
* Main way to pass data
* ================================
*/
port.onMessage.addListener(({ request, data, sender, err }) => {
    
    if (err) return logger.error(err)
    
    switch (request) {
        case 'are_you_ready':
            if (data) {
                port.postMessage({ request: 'get_mostsite' })
                port.postMessage({ request: 'get_notes' })
                holder.background_not_ready = false
                logger.debug('background is ready, request interval cleared')
                clearInterval(holder.requset_interval)
                holder.requset_interval = null
            } else {
                // out of case
            }
            break
        
        case 'get_bookmark':
            bookmark.render(data[0].children[0])
            break
        
        case 'get_mostsite':
            bookmark.render({ children: data, title: 'Most visited' }, true)
            // request get bookmark when received most site visited
            port.postMessage({ request: 'get_bookmark' })
            break
        
        case 'get_notes':
            notes = data.notes || []
            logger.debug('received notes form backgroud: ', notes)
            noter.render()
            break
        
        default:
            // out of services
            logger.error('revice response not match')
    }
})

window.addEventListener('resize', () => {
    holder.w_w = window.document.documentElement.clientWidth
    holder.w_h = window.document.documentElement.clientHeight
})

// render value btn node
if (storage.nodeNumder === undefined) {
    storage.nodeNumder = 0
}
window.btn_switch_node.innerHTML = storage.nodeNumder

// greeting to background scripts 🚀🚀🚀
port.postMessage({ request: 'are_you_ready' })
if (holder.requset_interval === null && holder.background_not_ready) holder.requset_interval = setInterval(() => {
    location.reload()
}, holder.request_boot_system_delay)

// setting.toggle(1)