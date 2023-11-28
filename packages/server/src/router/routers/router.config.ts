/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';
import path from 'path';

import * as toml from 'smol-toml';

import type { Middleware } from '@koa/router';
import { basePath } from '../../config.ts';
import { PetCache } from './config.ts';

// ===== middlewares =====

export const queryPets: Middleware = (ctx) => {
    const { name } = ctx.query;
    if (typeof name === 'string') {
        ctx.body = [[name, PetCache.query(name)]];
    } else {
        ctx.body = Array.from(PetCache.catchTimeMap.entries());
    }
};

export const cachePets: Middleware = (ctx) => {
    /** @type {Array<[string, number]>} */
    const pets: Array<[string, number]> = ctx.request.body;
    const newPetCache = new Map(pets);
    PetCache.update(newPetCache);
    ctx.body = {
        success: true,
    };
};

export const petFragmentLevel: Middleware = (ctx) => {
    const configPath = path.join(basePath, 'config', 'sea-petFragmentLevel.toml');
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, '');
    }
    const content = fs.readFileSync(configPath, 'utf-8');
    const config: any = toml.parse(content);
    ctx.body = config['PetFragmentLevel'];
};

export const launcherConfig: Middleware = (ctx) => {
    const key = ctx.query['key'] as string;
    // 判断是get还是post
    if (ctx.method === 'GET') {
        const configPath = path.join(basePath, 'config', 'sea-launcher.toml');
        if (!fs.existsSync(configPath)) {
            fs.writeFileSync(configPath, '');
        }
        const content = fs.readFileSync(configPath, 'utf-8');
        const config: any = toml.parse(content);
        ctx.body = config[key] ?? {};
    } else if (ctx.method === 'POST') {
        const configPath = path.join(basePath, 'config', 'sea-launcher.toml');
        if (!fs.existsSync(configPath)) {
            fs.writeFileSync(configPath, '');
        }
        const content = fs.readFileSync(configPath, 'utf-8');
        const config: any = toml.parse(content);
        const newConfig = ctx.request.body;
        config[key] = newConfig ?? {};
        fs.writeFileSync(configPath, toml.stringify(config));
        ctx.body = {
            success: true,
        };
    }
};

export const realm: Middleware = (ctx) => {
    throw new Error('Function not implemented.');
};
