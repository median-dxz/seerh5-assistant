import Webpack from 'webpack';
import Server from 'webpack-dev-server';

import { config, devServerOptions } from './webpack.server.js';

const compiler = Webpack(config);
const server = new Server(devServerOptions, compiler);

const runServer = async () => {
    console.log('Starting server...');
    await server.start();
};

runServer();
