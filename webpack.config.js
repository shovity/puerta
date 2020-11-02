const fs = require('fs')
const path = require('path')

const config = {
    entry: {
        'newtab': './src/newtab.js',
        'background': './src/background.js',
    },

    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'app/javascripts'),
    },
}

module.exports = (env, argv) => {

    if (argv.mode === 'development') {
        config.devtool = 'inline-source-map'
    }

    return config
}