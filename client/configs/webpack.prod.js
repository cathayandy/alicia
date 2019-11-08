const path = require('path');
const merge = require('webpack-merge');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const common = require('./webpack.common.js');

module.exports = merge.smart(common, {
    mode: 'production',
    externals: {
        moment: 'moment',
        react: 'React',
        dva: 'dva',
        'dva/router': 'dva.router',
        'dva/dynamic': 'dva.dynamic.default',
        'react-dom': 'ReactDOM',
    },
    plugins: [
        new CompressionPlugin({
            threshold: 10000,
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production'),
            },
        }),
        new HtmlWebpackPlugin({
            filename: path.resolve(process.cwd(), 'dist', 'index.html'),
            template: path.resolve(__dirname, '..', 'views', 'index.prod.html'),
            inject: true,
            hash: false,
            minify: {
                removeComments: false,
                collapseWhitespace: false,
            },
            chunks: ['index'],
        }),
        new MiniCssExtractPlugin({
            filename: '[name].[hash].css',
            chunkFilename: '[id].[hash].css',
        }),
    ],
    optimization: {
        minimizer: [
            new UglifyJsPlugin(),
            new OptimizeCSSAssetsPlugin({}),
        ],
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
                        '@babel/transform-runtime',
                    ],
                },
            },
        }, {
            test: /\.css$/,
            use: [
                MiniCssExtractPlugin.loader,
                'css-loader',
            ],
        }, {
            test: /\.less$/,
            use: [
                MiniCssExtractPlugin.loader,
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
