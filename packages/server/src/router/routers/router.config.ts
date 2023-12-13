import fs from 'fs';
import path from 'path';
import * as superjson from 'superjson';
import { PetCache } from '../../data/PetCacheManager.ts';

// ===== procedures =====

export const queryPets = (name?: string) => {
    if (name) {
        return [name, PetCache.query(name)] as const;
    } else {
        return PetCache.catchTimeMap;
    }
};

export const cachePets = (pets: Map<string, number>) => {
    PetCache.update(pets);
    return {
        success: true,
    };
};

export const petFragmentLevel = (appRoot: string) => {
    const configPath = path.join(appRoot, 'config', 'sea-petFragmentLevel.json');
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, '{}');
    }
    const content = fs.readFileSync(configPath, 'utf-8');
    const config = superjson.parse(content);
    return config;
};

export const launcherConfig = (key: string, appRoot: string): unknown => {
    const configPath = path.join(appRoot, 'config', 'sea-launcher.json');
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, '{}');
    }
    const content = fs.readFileSync(configPath, 'utf-8');
    const config: Record<string, unknown> = superjson.parse(content);
    if (JSON.stringify(config[key]) === '{}') {
        return null;
    }
    return config[key] ?? null;
};

export const setLauncherConfig = (key: string, appRoot: string, newConfig: unknown) => {
    const configPath = path.join(appRoot, 'config', 'sea-launcher.json');
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, '{}');
    }
    const content = fs.readFileSync(configPath, 'utf-8');
    const config: Record<string, unknown> = superjson.parse(content);
    config[key] = newConfig ?? ({} as unknown);
    fs.writeFileSync(configPath, superjson.stringify(config));
    return {
        success: true,
    };
};
