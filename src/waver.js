const waver = {
    waveInterval: null,
    ghostTimeout: null,
    cmdPress: false,
}

const addWave = (x, y) => {
    wave_click_box.innerHTML =
    `<div class="wave active" style="transform: translate(${x}px, ${y}px)">
        <div></div>
        <div></div>
        <div></div>
    </div>`
}

window.addEventListener('mousedown', (event) => {
    const x = event.clientX
    const y = event.clientY
    addWave(x, y)
    
    if (waver.cmdPress) {
        clearInterval(waver.waveInterval)
        waver.waveInterval = setInterval(() => {
            addWave(x, y)
        }, 1900)
    } else {
        clearInterval(waver.waveInterval)
    }
})

window.addEventListener('keydown', dEvent => {
    if (dEvent.keyCode === 91 || dEvent.keyCode === 17) {
        waver.cmdPress = true
    }
    
    if (dEvent.keyCode === 32 && !waver.ghostTimeout) {
        wall_ghost.className = 'ghost'
        waver.ghostTimeout = setTimeout(() => {
            wall_ghost.className = ''
            waver.ghostTimeout = null
        }, 700)
    }
})

window.addEventListener('keyup', dEvent => {
    waver.cmdPress = false
})

export default waver