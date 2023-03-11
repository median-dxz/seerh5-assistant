import path from 'path';
import url from 'url';

import webpack from 'webpack';

import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

import { saProxyMiddleware, saRfcMiddleware } from '../../webpack.proxy.js';
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

/**
 * @type {webpack.Configuration}
 */
const testConfig = {
    name: 'sac-test',
    target: ['es2022', 'web'],
    entry: './test/browser-test.js',
    mode: 'development',
    experiments: {
        outputModule: true,
        topLevelAwait: true,
    },
    module: {
        rules: [
            {
                test: /\.(m)?[jt]s(x)?$/,
                loader: 'ts-loader',
                resolve: {
                    fullySpecified: false,
                },
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
        modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        module: true,
        publicPath: '/',
    },
    devtool: 'source-map',
    plugins: [new ForkTsCheckerWebpackPlugin()],
    devServer: {
        static: './dev',
        client: {
            overlay: false,
            logging: 'warn',
        },
        hot: false,
        port: 1234,
        setupMiddlewares: (middlewares, devServer) => {
            if (!devServer) {
                throw new Error('webpack-dev-server is not defined');
            }
            middlewares.push(saProxyMiddleware);
            middlewares.push(saRfcMiddleware);
            return middlewares;
        },
    },
};

export default testConfig;
