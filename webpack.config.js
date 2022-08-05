import path from 'path';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export { __dirname };
import { saProxyMiddleware } from './webpack.proxy.js';
import CopyPlugin from 'copy-webpack-plugin';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';

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
        index: './src/index.js',
    },
    experiments: {
        outputModule: true,
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/i,
                exclude: /(node_modules)/,
                include: path.resolve(__dirname, 'src'),
                loader: 'babel-loader',
                options: {
                    cacheDirectory: true,
                    presets: [
                        [
                            '@babel/preset-react',
                            {
                                runtime: 'automatic',
                            },
                        ],
                    ],
                    plugins: [],
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
            chunks: 'all',
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'react-mui',
                    chunks: 'all',
                },
            },
        },
        runtimeChunk: 'single',
        moduleIds: 'deterministic',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[contenthash:8].js',
        chunkFilename: '[id][contenthash:8].js',
        publicPath: '/',
        module: true,
        clean: true
    },
    resolve: {
        alias: {
            '@mui/styled-engine': '@mui/styled-engine-sc',
        },
        extensions: ['.js', '.jsx'],
    },
    devtool: 'eval-source-map',
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
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
            // progress: true,
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
    if (argv.mode === 'production') {
        delete exports.devtool;
    } else if (argv.mode === 'development') {
        exports.plugins.push(new ReactRefreshWebpackPlugin({ overlay: false }));
        exports.module.rules[0].options.plugins.push('react-refresh/babel');
        exports.module.rules[0].options.presets[0].development = true;
    }
    return appConfig;
};
