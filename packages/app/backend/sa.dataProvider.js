//@ts-check

import fs, { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.resolve(dirname, 'data', 'data.json');
const data = JSON.parse(fs.readFileSync(dataFile).toString('utf8'));

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const saDataProvider = (req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache');
    switch (req.method) {
        case 'GET':
            res.status(200).json(data);
            break;
        case 'POST':
            const payload = req.body;

            if (req.query.mod) {
                const mod = req.query.mod.toString();
                data.mods[mod] = payload;
            } else {
                data[payload.key] = payload.data;
            }

            writeFileSync(dataFile, data);

            res.status(200).end({
                code: 200,
                ok: true,
            });
            break;
        default:
            next();
            break;
    }
};
