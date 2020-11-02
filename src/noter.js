import storage from './core/storage'
import logger from './core/logger'

const noter = {}

noter.pushState = () => {
    logger.debug('noter push state: ', notes)
    port.postMessage({ request: 'post_notes', data: notes, sender: holder.uuid })
}

noter.genUniqueNoteId = () => {
    return Date.now().toString()
}

noter.createNoteObject = (note) => {
    const defaultData = {
        msg: '',
        x: Math.floor(Math.random() * (holder.w_w - 500)),
        y: Math.floor(Math.random() * (holder.w_h - 250)),
        w: 300,
        h: 100,
        node: storage.nodeNumder,
        type: 'nomal',
        status: 'default',
    }
    
    return Object.assign(defaultData, note)
}

noter.createNoteHtmlElement = (note) => {
    const { id, msg, x, y, w, h, type, status } = note

    const dom = document.createElement('div')

    dom.setAttribute('id', `noteid-${id}`)
    dom.setAttribute('class', 'note')
    dom.setAttribute('style', `transform: translate(${x}px, ${y}px)`)
    dom.setAttribute('note-status', status || 'default')

    dom.innerHTML = `
    <div class="box">
        <div class="note-controls" move-noteid="${id}">
            <div class="note-remove" remove-noteid="${id}">&times;</div>
        </div>
        <div class="rain-bow">
            <div mark="${id}:primary"></div>
            <div mark="${id}:success"></div>
            <div mark="${id}:danger"></div>
        </div>
        <textarea
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            editor-noteid="${id}"
            style="width:${w}px;height:${h-20}px;"
        >${msg}</textarea>
    </div>`

    return dom
}

noter.addNote = (note) => {
    
    // new note don't have a id, push it to global notes
    if (note.id === undefined) {
        note.id = noter.genUniqueNoteId()
        notes.push(note)
    }
    
    logger.debug(`add note ${note.id} = ${note.msg}`)
    
    // render html
    window.note_box.appendChild(noter.createNoteHtmlElement(note))
}

noter.render = (clear=true, node=+storage.nodeNumder) => {

    // clear before render
    if (clear) note_box.innerHTML = ''
    
    // loop adding
    notes.filter(note => {

        return node === +note.node 
    }).forEach(note => {
        noter.addNote(note)
    })
}

noter.checkAndReplaceCode = (target) => {
    const string = target.value
    
    holder.code_tables.forEach(code => {
        const cregex = new RegExp(code.code)

        const result = string.match(cregex)
        if (result) {
            const datas = result.slice(1)

            const oldSelectionStart = target.selectionStart
            const oldValue = target.value

            let codeValue = code.value

            datas.forEach((data) => {
                codeValue = codeValue.replace('$', data)
            })

            target.value = string.replace(cregex, codeValue)

            const newSelectionStart = oldSelectionStart + target.value.length - oldValue.length
            target.setSelectionRange(newSelectionStart, newSelectionStart)
        }
    })
}

noter.removeNote = noteId => {
    
    if (!noteId) {
        return console.error('remove note: missing noteId')
    }

    const noteIndex = notes.findIndex((note) => note.id == noteId)
    
    if (noteIndex !== -1) {
        notes.splice(noteIndex, 1)
    }

    // remove dom
    const dom = window[`noteid-${noteId}`]
    dom.parentElement.removeChild(dom)

    noter.pushState()
}

noter.mark = (noteId, status) => {
    const note = notes.find(n => n.id == noteId)

    if (!note) {
        return console.error('mark note: cant find note to mark', noteId)
    }

    if (note.status === status) {
        note.status = 'default'
    } else {
        note.status = status
    }

    window[`noteid-${noteId}`].setAttribute('note-status', note.status)
    noter.pushState()
}

// NOTER BEHAVIOR
{
    // listen click note
    window.note_box.addEventListener('click', event => {
        const { target } = event

        const removeId = target.getAttribute('remove-noteid')
        const mark = target.getAttribute('mark')
        
        if (removeId) {
            noter.removeNote(removeId)
        } else if (mark) {
            const [ noteId, status ] = mark.split(':')
            noter.mark(noteId, status)
        }
    })
    
    // handle move
    let resizeId = false
    let moveId = false
    let fixX = 0
    let fixY = 0
    
    window.note_box.addEventListener('mousedown', event => {
        
        // prevent right mouse
        if (event.which === 3) {
            return
        }

        const { target } = event
        
        // detect resize
        if (target.getAttribute('editor-noteid') !== null) {
            const cx = event.clientX
            const cy = event.clientY
            const noteId = +target.getAttribute('editor-noteid')
            const noteIndex = notes.findIndex((note) => note.id == noteId)
            const note = notes[noteIndex]
            
            // detect mouse down over resize btn
            if (note.x + note.w - cx < 15 && note.y + note.h - cy < 15) {
                resizeId = noteId
            }
        }
        
        if (target.getAttribute('move-noteid') !== null) {
            const noteId = +target.getAttribute('move-noteid')
            const noteIndex = notes.findIndex((note) => note.id == noteId)
            
            // fix position mouse vs note
            fixX = event.clientX - notes[noteIndex].x
            fixY = event.clientY - notes[noteIndex].y
            
            // start move handle
            moveId = noteId
        }
    })
    
    window.addEventListener('mousemove', event => {
        if (moveId === false) return
        
        event.preventDefault()
        let x = event.clientX - fixX
        let y = event.clientY - fixY

        if (y < 0) {
            y = 0
        }

        if (y > holder.w_h - 20) {
            y = holder.w_h - 20
        }

        if (x < 0) {
            x = 0
        }

        if (x > holder.w_w - 20) {
            x = holder.w_w - 20
        }

        console.log(window[`noteid-${moveId}`], `noteid-${moveId}`)
        
        if (window[`noteid-${moveId}`]) window[`noteid-${moveId}`].style.transform = `translate(${x}px, ${y}px)`
    })
    
    window.addEventListener('mouseup', event => {
        if (moveId !== false) {
            // update state
            const x = event.clientX - fixX
            const y = event.clientY - fixY
            const noteIndex = notes.findIndex((note) => note.id == moveId)
            
            if (noteIndex !== -1) {
                notes[noteIndex].x = x
                notes[noteIndex].y = y
            }
            
            // end move handle
            moveId = false
            
            // push state when done move a note
            noter.pushState()
            
        } else if (resizeId !== false) {
            const { target } = event
            const noteIndex = notes.findIndex((note) => note.id == resizeId)
            const w = window['noteid-' + resizeId].offsetWidth
            const h = window['noteid-' + resizeId].offsetHeight
            
            if (noteIndex !== -1) {
                notes[noteIndex].w = w
                notes[noteIndex].h = h
            }
            
            // end resize handle
            resizeId = false
            
            // push state when done move a note
            noter.pushState()
        }
        
        
    })
    
    // handle edit notes
    // keyup only when focus textarea
    window.note_box.addEventListener('keyup', (event) => {
        const { target } = event
        if (target.getAttribute('editor-noteid') !== null) {
            const noteId = +target.getAttribute('editor-noteid')
            const noteIndex = notes.findIndex((note) => note.id == noteId)
            
            // handle note code
            if (event.key === '=') noter.checkAndReplaceCode(target)
            
            notes[noteIndex].msg = target.value
            // push state when done press a key if focus textarea
            noter.pushState()
        }
    })
    
    // listen add note
    window.btn_add_note.addEventListener('click', () => {
        noter.addNote(noter.createNoteObject())
        // push state when add a note
        noter.pushState()
    })
    
    // listen switch node
    window.btn_switch_node.addEventListener('click', () => {
        let currentNode = +storage.nodeNumder || 0
        if (currentNode > 2) {
            currentNode = 0
        } else {
            currentNode++
        }
        
        window.btn_switch_node.innerHTML = currentNode
        
        storage.nodeNumder = currentNode
        noter.pushState()
        noter.render()
    })
}

export default noter