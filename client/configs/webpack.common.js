const path = require('path');

module.exports = {
    entry: {
        index: path.resolve(__dirname, '..', 'index.js'),
    },
    output: {
        path: path.resolve(process.cwd(), 'dist'),
        publicPath: '/',
        filename: '[name].[hash].js',
        chunkFilename: '[id].[hash].js',
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    name: 'commons',
                    chunks: 'initial',
                    minChunks: 2,
                },
            },
        },
    },
    module: {
        rules: [{
            test: /\.(png|jpg|jpeg|gif|eot|ttf|svg|woff|woff2|pdf|mp4)$/,
            loader: 'url-loader?limit=1000',
        },],
    },
    resolve: {
        extensions: ['.js'],
    },
};
