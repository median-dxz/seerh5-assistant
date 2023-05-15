import path from 'path';
import url from 'url';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';

import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import ReactRefreshTypeScript from 'react-refresh-typescript';
import TerserPlugin from 'terser-webpack-plugin';
import WorkboxPlugin from 'workbox-webpack-plugin';

import { saProxyMiddleware, saRfcMiddleware } from '../../webpack.proxy.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (env, argv) => {
    const isDevelopment = argv.mode === 'development';

    /** @type {webpack.Configuration} */
    const appConfig = {
        name: 'app',
        context: path.resolve(__dirname),
        target: ['web', 'es2022'],
        entry: './src/index.tsx',
        experiments: {},
        module: {
            rules: [
                {
                    test: /\.(t|j)sx?$/,
                    use: {
                        loader: 'ts-loader',
                        options: {
                            projectReferences: true,
                            getCustomTransformers: () => ({
                                before: [isDevelopment && ReactRefreshTypeScript()].filter(Boolean),
                            }),
                            transpileOnly: isDevelopment,
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
                    },
                }),
            ],
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: '[name].[contenthash:8].js',
            chunkFilename: '[id].[contenthash:8].js',
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
            new ForkTsCheckerWebpackPlugin(),
        ],
        devServer: {
            static: './dist',
            client: {
                overlay: false,
                logging: 'info',
            },
            hot: true,
            port: 1234,
            liveReload: false,
            setupMiddlewares: (middlewares, devServer) => {
                if (!devServer) {
                    throw new Error('webpack-dev-server is not defined');
                }
                middlewares.push(saProxyMiddleware);
                middlewares.push(saRfcMiddleware);
                return middlewares;
            },
            watchFiles: ['src/**/*', '../core/dist'],
        },
    };

    let exports = appConfig;
    exports.optimization = {
        chunkIds: isDevelopment ? 'named' : 'deterministic',
        moduleIds: isDevelopment ? 'named' : 'deterministic',
    };
    console.log(`dev-mode: ${isDevelopment}`);

    const sw = new WorkboxPlugin.GenerateSW({
        exclude: [/./],
        navigationPreload: false,
        runtimeCaching: [
            {
                urlPattern: /seerh5\.61\.com\/resource\/assets/,
                handler: 'CacheFirst',
                options: {
                    cacheName: 'seerh5-game-cache',
                    expiration: {
                        maxAgeSeconds: 60 * 60 * 24 * 7,
                    },
                },
            },
        ],
    });

    Object.defineProperty(sw, 'alreadyCalled', {
        get() {
            return false;
        },
        set() {
            // do nothing; the internals try to set it to true, which then results in a warning
            // on the next run of webpack.
        },
    });

    exports.plugins.push(sw);

    if (!isDevelopment) {
        delete exports.devtool;
    } else {
        exports.plugins.push(
            new ReactRefreshWebpackPlugin({
                overlay: false,
            })
        );
    }
    return exports;
};
