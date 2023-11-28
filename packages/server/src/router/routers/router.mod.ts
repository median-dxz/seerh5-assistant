import fs from 'fs';
import path from 'path';

import type { Middleware } from '@koa/router';

import { basePath } from '../../config.ts';
import { ModConfig } from './config.ts';

const MOD_DIRNAME = 'mods';

// 递归寻找mods目录下所有js
const findMods = (dir = MOD_DIRNAME) => {
    /**
     * @type { string[] }
     */
    let r: string[] = [];

    const files = fs.readdirSync(dir);
    files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            r = r.concat(findMods(filePath));
        } else if (stat.isFile() && isModFile(filePath)) {
            r.push(path.relative(path.join(basePath, 'mods'), filePath));
        }
    });

    return r;
};

function isModFile(filePath: string) {
    return path.extname(filePath) === '.js' || path.extname(filePath) === '.json';
}

// ===== middlewares =====

export const getAllMods: Middleware = (ctx) => {
    ctx.body = findMods().map((path) => {
        return { path };
    });
};

export const getConfig: Middleware = (ctx) => {
    const { namespace: ns } = ctx.params;
    const config = new ModConfig(ns).load();
    if (config) {
        ctx.body = { config };
    } else {
        ctx.body = { msg: '配置不存在' };
    }
};

export const setConfig: Middleware = (ctx) => {
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
};
