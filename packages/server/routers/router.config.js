import fs from 'fs';
import path from 'path';

import * as toml from 'smol-toml';

import { base } from '../base.js';
import { PetCache } from './config.js';

// ===== middlewares =====

/**
 * @type {import('@koa/router').Middleware}
 */
export function queryPets(ctx) {
    const { name } = ctx.query;
    if (typeof name === 'string') {
        ctx.body = [[name, PetCache.query(name)]];
    } else {
        ctx.body = Array.from(PetCache.catchTimeMap.entries());
    }
}

/**
 * @type {import('@koa/router').Middleware}
 */
export function cachePets(ctx) {
    /** @type {Array<[string, number]>} */
    const pets = ctx.request.body;
    const newPetCache = new Map(pets);
    PetCache.update(newPetCache);
    ctx.body = {
        success: true,
    };
}

/**
 * @type {import('@koa/router').Middleware}
 */
export function petFragmentLevel(ctx) {
    const configPath = path.join(base, 'config', 'sea-petFragmentLevel.toml');
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, '');
    }
    const content = fs.readFileSync(configPath, 'utf-8');
    /** @type {any} */
    const config = toml.parse(content);
    ctx.body = config['PetFragmentLevel'];
}

/**
 * @type {import('@koa/router').Middleware}
 */
export function launcherConfig(ctx) {
    const key = ctx.query['key'];
    // 判断是get还是post
    if (ctx.method === 'GET') {
        const configPath = path.join(base, 'config', 'sea-launcher.toml');
        if (!fs.existsSync(configPath)) {
            fs.writeFileSync(configPath, '');
        }
        const content = fs.readFileSync(configPath, 'utf-8');
        /** @type {any} */
        const config = toml.parse(content);
        ctx.body = config[key] ?? {};
    } else if (ctx.method === 'POST') {
        const configPath = path.join(base, 'config', 'sea-launcher.toml');
        if (!fs.existsSync(configPath)) {
            fs.writeFileSync(configPath, '');
        }
        const content = fs.readFileSync(configPath, 'utf-8');
        /** @type {any} */
        const config = toml.parse(content);
        const newConfig = ctx.request.body;
        config[key] = newConfig ?? {};
        fs.writeFileSync(configPath, toml.stringify(config));
        ctx.body = {
            success: true,
        };
    }
}

/**
 * @type {import('@koa/router').Middleware}
 */
export function realm(ctx) {
    throw new Error('Function not implemented.');
}
