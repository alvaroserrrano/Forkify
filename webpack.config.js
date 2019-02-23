//require node module
const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');

//export object
module.exports = {
    //bundle starts. webpack starts looking for dependencies
    entry: [ 'babel-polyfill','./src/js/index.js'],
    //output. tell webpack where to save the bundle file.-->Object
    output: {
        //use method resolve in the path package
        path: path.resolve(__dirname, 'dist/'),
        filename: 'js/bundle.js'
    },
    //webpack-dev-server
    devServer:{
        //specify the folder from whcih webpack should serve
        //src folder is only for development purposes
        contentBase: './dist'
    },
    plugins: [
        new HTMLWebpackPlugin({
            filename: 'index.html',
            template: './src/index.html'
        })
    ],
    module: {
        rules: [{
            test: '/\.js$/',
            exclude: '/node_modules/',
            use: {
                loader: 'babel-loader'
            }
        }]
    }
};