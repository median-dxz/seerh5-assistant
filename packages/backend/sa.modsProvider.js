//@ts-check

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const saModsProvider = (req, res, next) => {
    if (req.path !== '/') {
        next();
        return;
    }
    res.setHeader('Cache-Control', 'no-cache');
    let modPaths = [];
    // 递归寻找mods目录下所有js
    const findMods = (/** @type {string} */ dir) => {
        const files = fs.readdirSync(dir);
        files.forEach((file) => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                findMods(filePath);
            } else if (stat.isFile() && path.extname(filePath) === '.js') {
                modPaths.push(path.relative(path.join(dirname, 'mods'), filePath));
            }
        });
    };
    findMods(path.join(dirname, 'mods'));
    res.json(modPaths);
};
