const contextMenu = {
    htmlMenu: window.context_menu,
    isOpen: false
}

contextMenu.open = (x, y, event) => {
    const px = (x > holder.w_w - 200)? holder.w_w - 200 : x
    const py = (y > holder.w_h - 180)? holder.w_h - 180 : y+20

    const command = event.target.getAttribute('context')

    console.log(command)
    
    contextMenu.isOpen = true
    
    contextMenu.htmlMenu.innerHTML =
    `<div style='transform: translate(${px}px, ${py}px)'>
        <div class="cm-i" click-emit="setting_open">Settings</div>
    </div>`
}

contextMenu.close = () => {
    contextMenu.isOpen = false
    contextMenu.htmlMenu.innerHTML = ''
}

// handle open menu
window.addEventListener('contextmenu', (event) => {
    contextMenu.open(event.clientX, event.clientY, event)
    event.preventDefault()
})

// handle close and actions menu
window.addEventListener('click', (event) => {
    // pass when menu is closed
    if (!contextMenu.isOpen) return
    
    const { target } = event

    if (target.className !== 'cm-i') {
        contextMenu.close()
        event.preventDefault()
    } else {
        // console.log('hang ve: ' + target.getAttribute("cmd"))
        contextMenu.close()
    }
})

export default contextMenu