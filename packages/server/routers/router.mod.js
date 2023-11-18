import fs from 'fs';
import path from 'path';

import { base } from '../base.js';
import { ModConfig } from './config.js';

const MOD_DIRNAME = 'mods';

// 递归寻找mods目录下所有js
const findMods = (dir = MOD_DIRNAME) => {
    /**
     * @type { string[] }
     */
    let r = [];

    const files = fs.readdirSync(dir);
    files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            r = r.concat(findMods(filePath));
        } else if (stat.isFile() && isModFile(filePath)) {
            r.push(path.relative(path.join(base, 'mods'), filePath));
        }
    });

    return r;
};

/**
 * @param {string} filePath
 */
function isModFile(filePath) {
    return path.extname(filePath) === '.js' || path.extname(filePath) === '.json';
}

// ===== middlewares =====

/**
 * @type {import('@koa/router').Middleware}
 */
export const getAllMods = (ctx) => {
    ctx.body = findMods().map((path) => {
        return { path };
    });
};

/**
 * @type {import('@koa/router').Middleware}
 */
export function getConfig(ctx) {
    const { namespace: ns } = ctx.params;
    const config = new ModConfig(ns).load();
    if (config) {
        ctx.body = { config };
    } else {
        ctx.body = { msg: '配置不存在' };
    }
}

/**
 * @type {import('@koa/router').Middleware}
 */
export function setConfig(ctx) {
    const { namespace: ns } = ctx.params;
    const config = new ModConfig(ns);
    try {
        config.save(ctx.request.body);
        ctx.body = {
            success: true,
        };
    } catch (e) {
        ctx.state = 500;
        ctx.body = {
            msg: e,
        };
    }
}
