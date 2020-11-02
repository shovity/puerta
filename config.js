const path = require('path')
const config = {}

config.indexWallpaper = {
  entry: path.join(__dirname, 'app/wallpapers'),
  output: path.join(__dirname, 'app/javascripts/wallpapers-index.js')
}

module.exports = config
