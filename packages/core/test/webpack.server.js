//@ts-check
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import path from 'path';
import { __dirname as dirname, saProxyMiddleware } from './saMiddleware.js';

/** @type {import('webpack-dev-server').Configuration} */
export const devServerOptions = {
    open: false,
    static: ['./test'],
    client: {
        overlay: false,
        logging: 'warn',
    },
    hot: false,
    port: 1234,
    watchFiles: ['./dist/**/*.js'],
    setupMiddlewares: (middlewares) => {
        middlewares.push(saProxyMiddleware);
        return middlewares;
    },
};

/** @type {import('webpack').Configuration} */
export const config = {
    name: 'sa-core-test',
    target: ['es2022', 'web'],
    entry: './test/entry.js',
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
        modules: [dirname, 'node_modules'],
    },
    output: {
        path: path.resolve(dirname, 'dist'),
        filename: 'bundle.js',
        module: true,
        publicPath: '/',
    },
    devtool: 'source-map',
    plugins: [new ForkTsCheckerWebpackPlugin()],
    devServer: devServerOptions,
};
