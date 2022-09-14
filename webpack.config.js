// @ts-nocheck
import path from 'path';

import CopyPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';

import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import ReactRefreshTypeScript from 'react-refresh-typescript';

import { saApiMiddleware, saProxyMiddleware } from './webpack.proxy.js';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export { __dirname };

const libConfig = {
    name: 'core',
    mode: 'production',
    target: 'es2022',
    context: path.resolve(__dirname),
    entry: {
        core: './src/proxy/core.js',
    },
    experiments: {
        outputModule: true,
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'core.lib.js',
        publicPath: '/',
        module: true,
        clean: true,
        chunkLoading: 'import',
        library: {
            type: 'module',
        },
    },
    devtool: 'eval-source-map',
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: '**/*',
                    to: 'mods',
                    context: path.resolve(__dirname, 'src', 'mods'),
                    transform(content, absoluteFilename) {
                        if (absoluteFilename.match(/\.js$/i)) {
                            content = content
                                .toString()
                                .replace(/(from ['"]\.\.\/\.\.\/)(.*?\/)(core\.js)/, '$1core.lib.js');
                        }
                        return content;
                    },
                },
            ],
        }),
    ],
};

const appConfig = {
    name: 'app',
    target: 'web',
    // dependencies: ['core'],
    entry: {
        index: './src/index.tsx',
    },
    experiments: {
        outputModule: true,
    },
    module: {
        rules: [
            {
                test: /\.(t|j)sx?$/,
                use: {
                    loader: 'ts-loader',
                    options: {},
                },
                exclude: [/node_modules/, /archive/],
                include: path.resolve(__dirname, 'src'),
            },
            {
                test: /\.js$/,
                loader: 'source-map-loader',
                exclude: /node_modules/,
                include: path.resolve(__dirname, 'src'),
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
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[contenthash:8].js',
        chunkFilename: '[id][contenthash:8].js',
        publicPath: '/',
        module: true,
        clean: true,
    },
    resolve: {
        alias: {
            '@mui/styled-engine': '@mui/styled-engine-sc',
            '@data': '/src/data/index.js',
        },
        extensions: ['.js', '.jsx', '.tsx', '.ts'],
    },
    devtool: 'source-map',
    plugins: [
        new HtmlWebpackPlugin({
            title: 'seer-proxy | 赛尔号h5登陆器 by median',
            scriptLoading: 'module',
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
            middlewares.push(saApiMiddleware);
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
                include: [path.resolve(__dirname, 'src', 'interface'), /\.[jt]sx/],
            })
        );
        exports.module.rules[0].use.options = {
            getCustomTransformers: () => ({
                before: [ReactRefreshTypeScript()],
            }),
            transpileOnly: true,
        };
    }
    return appConfig;
};
