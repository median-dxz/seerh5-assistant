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
        ctx.body = [name, PetCache.query(name)];
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
    const configPath = path.join(base, 'config', 'sa-petFragmentLevel.toml');
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
export function realm(ctx) {
    throw new Error('Function not implemented.');
}
