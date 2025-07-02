import closeWithGrace from 'close-with-grace';
import { createServer } from './server.ts';

async function main() {
    const server = await createServer();

    void server.start();

    closeWithGrace({ delay: 500 }, async function ({ signal, err }) {
        if (err) console.error(err);

        console.log(`${signal ? 'Detected' + signal + ', ' : ''}progress is shutting down...`);
        return server.stop().then(() => process.exit(0));
    });
}

void main();
