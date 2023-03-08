import path from 'path';
import url from 'url';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';

import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import ReactRefreshTypeScript from 'react-refresh-typescript';
import TerserPlugin from 'terser-webpack-plugin';

import { saProxyMiddleware } from '../../webpack.proxy.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/** @type {webpack.Configuration} */
const appConfig = {
    name: 'app',
    context: path.resolve(__dirname),
    target: ['web', 'es2022'],
    entry: './src/index.tsx',
    experiments: {
        topLevelAwait: true,
    },
    module: {
        rules: [
            {
                test: /\.(t|j)sx?$/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        projectReferences: true,
                        getCustomTransformers: () => ({
                            before: [ReactRefreshTypeScript()],
                        }),
                        transpileOnly: true,
                    },
                },
                exclude: /node_modules/,
                include: path.resolve(__dirname, 'src'),
            },
            {
                test: /\.js$/,
                loader: 'source-map-loader',
                exclude: /node_modules/,
                include: path.resolve(__dirname, 'src'),
            },
            {
                test: /\.js$/,
                resolve: {
                    fullySpecified: false, // disable the behavior
                },
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    optimization: {
        splitChunks: {
            chunks: 'async',
            hidePathInfo: true,
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor',
                    chunks: 'all',
                },
            },
        },
        runtimeChunk: 'single',
        minimize: true,
        minimizer: [
            new TerserPlugin({
                parallel: true,
                terserOptions: {
                    ecma: 2020,
                    module: true,
                },
            }),
        ],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[contenthash:8].js',
        chunkFilename: '[id][contenthash:8].js',
        publicPath: '/',
        clean: true,
    },
    resolve: {
        modules: ['../../node_modules', path.resolve(__dirname)],
        alias: {
            '@mui/styled-engine': '@mui/styled-engine-sc',
            '@sa-app': '/src',
        },
        extensions: ['.js', '.jsx', '.tsx', '.ts'],
    },
    externals: {
        gsap: 'root gsap', // global access from egret
    },
    devtool: 'source-map',
    plugins: [
        new HtmlWebpackPlugin({
            title: 'SeerH5-Assistant | 赛尔号h5登陆器 by median',
            filename: 'index.html',
            template: './src/index.html',
        }),
    ],
    devServer: {
        static: './dist',
        client: {
            overlay: false,
            logging: 'info',
        },
        hot: 'only',
        port: 1234,
        setupMiddlewares: (middlewares, devServer) => {
            if (!devServer) {
                throw new Error('webpack-dev-server is not defined');
            }
            middlewares.push(saProxyMiddleware);
            return middlewares;
        },
    },
};

export default (env, argv) => {
    let exports = appConfig;
    const development = argv.mode === 'development';

    exports.optimization = {
        chunkIds: development ? 'named' : 'deterministic',
        moduleIds: development ? 'named' : 'deterministic',
    };

    if (!development) {
        delete exports.devtool;
    } else {
        exports.plugins.push(
            new webpack.HotModuleReplacementPlugin(),
            new ForkTsCheckerWebpackPlugin(),
            new ReactRefreshWebpackPlugin({
                overlay: false,
                include: [path.resolve(__dirname, 'src'), /\.[jt]sx/],
            })
        );
    }
    return appConfig;
};
