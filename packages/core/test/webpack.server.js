//@ts-check
import path from 'path';
import { __dirname as dirname, saProxyMiddleware } from './saMiddleware.js';

/** @type {import('webpack-dev-server').Configuration} */
export const devServerOptions = {
    open: true,
    static: {
        directory: './test',
        watch: {
            ignored: ['./*.js', './*.ts', './*.json'],
            usePolling: false,
        },
    },
    client: {
        overlay: false,
        logging: 'warn',
    },
    hot: false,
    port: 1234,
    watchFiles: ['../dist/**/*.js'],
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
    devServer: devServerOptions,
};
