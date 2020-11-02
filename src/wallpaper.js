import storage from './core/storage'

let wallpapers = storage.wallpapers

if (!wallpapers) {
    wallpapers = window.defaultWallpapers.map(e => {
        return {
            url: `wallpapers/${e}`,
            active: true,
        }
    })

    storage.wallpapers = wallpapers
}

wallpapers = wallpapers.filter(w => w.active)

const i = Math.floor(Math.random() * wallpapers.length)
const wallForShow = wallpapers[i]

if (wallForShow) {
    wall.style.backgroundImage = `url(${wallForShow.url})`
    wall_ghost.style.backgroundImage = `url(${wallForShow.url})`
}
