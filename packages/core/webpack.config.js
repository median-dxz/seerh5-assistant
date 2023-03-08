import path from 'path';
import url from 'url';

import webpack from 'webpack';

import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';

import { saProxyMiddleware, saRfcMiddleware } from '../../webpack.proxy.js';
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default (env, argv) => {
    const devEnv = argv.mode === 'development';
    /**
     * @type {webpack.Configuration}
     */
    const libConfig = {
        name: 'seerh5-assistant-core',
        target: ['es2022', 'web'],
        entry: './src/index.ts',
        experiments: {
            outputModule: true,
        },
        module: {
            rules: [
                {
                    test: /\.ts(x)?$/,
                    loader: 'ts-loader',
                    exclude: /node_modules/,
                },
            ],
        },
        optimization: {
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
        resolve: {
            extensions: ['.ts', '.js'],
            alias: {
                '@data': '/src/data/index.js',
            },
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'bundle.js',
            publicPath: '/',
            library: {
                type: 'module',
            },
        },
        devtool: 'source-map',
        plugins: [
            new ForkTsCheckerWebpackPlugin(),
            // new CopyPlugin({
            //     patterns: [{ from: 'src/global.d.ts', to: 'global.d.ts' }],
            // }),
        ],
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
    console.log(`build in mode: ${argv.mode}`);
    libConfig.mode = argv.mode;
    let exports = libConfig;
    return exports;
};
