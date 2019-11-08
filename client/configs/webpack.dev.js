const path = require('path');
const merge = require('webpack-merge');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const common = require('./webpack.common.js');

module.exports = merge.smart(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('development'),
            },
        }),
        new HtmlWebpackPlugin({
            filename: path.resolve(process.cwd(), 'dist', 'index.html'),
            template: path.resolve(__dirname, '..', 'views', 'index.dev.html'),
            inject: true,
            hash: false,
            minify: {
                removeComments: false,
                collapseWhitespace: false,
            },
            chunks: ['index'],
        }),
        new webpack.HotModuleReplacementPlugin(),
    ],
    devServer: {
        contentBase: path.resolve(process.cwd(), 'dist'),
        historyApiFallback: true,
    },
    module: {
        rules: [{
            test: /\.js?$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/env', '@babel/react'],
                    plugins: [
                        [
                            'import', {
                                libraryName: 'antd',
                                libraryDirectory: 'es',
                                style: true,
                            },
                        ],
                        'dva-hmr',
                        '@babel/transform-runtime',
                    ],
                }, 
            },
        }, {
            test: /\.css$/,
            use: [
                'style-loader',
                'css-loader',
            ],
        }, {
            test: /\.less$/,
            use: [
                'style-loader',
                'css-loader',
                {
                    loader: 'less-loader',
                    options: {
                        javascriptEnabled: true,
                    },
                },
            ],
        }],
    },
});
