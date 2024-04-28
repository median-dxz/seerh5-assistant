import closeWithGrace from 'close-with-grace';
import { enableMapSet, enablePatches } from 'immer';
import { createServer } from './server.ts';

enableMapSet(), enablePatches();

async function main() {
    const server = await createServer();

    void server.start();

    closeWithGrace({ delay: 500 }, async function ({ signal, err }) {
        if (err) console.error(err);

        console.log(`Detected ${signal}, progress is shutting down...`);
        void server.stop().then(() => process.exit(0));
    });
}

void main();
