import storage from './core/storage'
import event from './core/event'

const PLACEHOLDER_IMG_SRC = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQYV2M4c+bMfwAIMANkq3cY2wAAAABJRU5ErkJggg=='
const EXTEND_WALLPAPER_SIZE = 5

const setting = {
    isOpen: false,
}

setting.render = () => {


    // render wallpaper
    const walW = window.settings_wallpapers.clientWidth / 6 - 10
    const walH = walW * holder.w_h / holder.w_w

    if (storage.wallpapers.length === window.defaultWallpapers.length) {
        
        // add placeholder for edit
        storage.wallpapers = [
            ...storage.wallpapers,
            ...new Array(EXTEND_WALLPAPER_SIZE).fill({ url: PLACEHOLDER_IMG_SRC }),
        ]

    } else if (storage.wallpapers.length - EXTEND_WALLPAPER_SIZE !== window.defaultWallpapers.length) {
        
        // reload default wallpaper
        let buffers = storage.wallpapers
        buffers = buffers.filter(b => b.url.startsWith('data'))
        buffers = [
            ...window.defaultWallpapers.map(e => {
                return {
                    url: `wallpapers/${e}`,
                    active: false,
                }
            }),
            ...buffers,
        ]

        storage.wallpapers = buffers
    }

    window.settings_wallpapers.innerHTML = storage.wallpapers.map((wall, index) => {
        let className = 'settings-wall-pre'
        if (wall.active) {
            className += ' active'
        }

        let inner = ''

        if (index >= window.defaultWallpapers.length) {
            inner += `<span click-emit="setting_wallpaper_edit:${index}">EDIT</span>`
        }

        return `
        <div
            class="${className}"
            style="width: ${walW}px; height: ${walH}px; background-image: url(${wall.url})"
            click-emit="setting_wallpaper_toggle:${index}"
        >${inner}</div>
        `
    }).join('')

    // render config
    window.setting_config_input.value = JSON.stringify(config)
        .replace(/,/g, ',\n')
        .replace('{', '{\n')
        .replace('}', '\n}')

    // render code table
    window.setting_code_table_input.value = holder.code_tables.map(codeTable => {
        return `${codeTable.code.slice(0, -2)} -> ${codeTable.value}`
    }).join('\n')
}

setting.toggle = state => {
    if (state === undefined) {
        state = !setting.isOpen
    }

    setting.isOpen = state

    if (state) {
        window.setting_box.removeClass('hidden')
        setting.render()
    } else {
        window.setting_box.addClass('hidden')
    }
}

event.listen('setting_close', () => {
    setting.toggle(false)
})

event.listen('setting_open', () => {
    setting.toggle(true)
})

event.listen('setting_backup', () => {
    const now = new Date()

    const data = {}
    data.notes = notes
    data.storage = JSON.parse(JSON.stringify(localStorage))

    const jsonStringData = JSON.stringify(data)

    const blob = new Blob([jsonStringData], { type: 'text/plain' })

    // try collect buffer memory
    if (holder.blob_buffer_url !== null) {
        window.URL.revokeObjectURL(holder.blob_buffer_url)
    }

    holder.blob_buffer_url = window.URL.createObjectURL(blob)

    const anc = document.createElement('a')
    anc.href = holder.blob_buffer_url
    anc.download = 'puerta-backup-' + now.toLocaleDateString().replace(/\//g, '-') + '.json'
    anc.click()
})

event.listen('setting_restore', () => {
    const input = document.createElement('input')
    input.type = 'file'

    input.addEventListener('change', () => {
        const file = input.files[0]
        const reader = new FileReader()

        reader.addEventListener('load', () => {
            const backupJsonStringData = reader.result
            const backupData = JSON.parse(backupJsonStringData)
            const { notes, storage } = backupData

            port.postMessage({ request: 'post_notes', data: notes })

            Object.keys(storage).forEach(k => {
                localStorage[k] = storage[k]
            })

            alert('Restore complated')
            location.reload()
        })

        reader.readAsText(file)
    }, { once: true })

    input.click()
})

event.listen('setting_config_save', () => {
    try {
        const config = JSON.parse(setting_config_input.value)
        storage.config = config
        window.config = config
    } catch (error) {
        return alert('Parse config error')
    }
    alert('Save config success')
})

event.listen('setting_wallpaper_toggle', (index, { target }) => {
    index = +index

    const wallpapers = storage.wallpapers
    const isActive = target.className.indexOf('active') !== -1

    if (isActive) {
        target.removeClass('active')
    } else {
        target.addClass('active')
    }

    wallpapers[index].active = !isActive
    
    storage.wallpapers = wallpapers
})

event.listen('setting_wallpaper_edit', (index, { target }) => {
    index = +index

    const input = document.createElement('input')
    input.type = 'file'
    
    input.addEventListener('change', () => {
        const file = input.files[0]
        const reader = new FileReader()

        // check file size
        if (file.size > 1048576) {
            return alert('Image must be less than 1 megabytes')
        }

        reader.addEventListener("load", () => {
            const buffys = storage.wallpapers

            buffys[index].url = reader.result
            storage.wallpapers = buffys
            
            const item = target.parentElement
            item.style.backgroundImage = `url(${reader.result})`
        })

        reader.readAsDataURL(file)
    }, { once: true })

    input.click()
})

event.listen('setting_wallpaper_reset', () => {
    storage.wallpapers = null
    location.reload()
})


export default setting