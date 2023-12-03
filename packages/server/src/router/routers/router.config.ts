import fs from 'fs';
import path from 'path';

import * as toml from 'smol-toml';

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
    const configPath = path.join(appRoot, 'config', 'sea-petFragmentLevel.toml');
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, '');
    }
    const content = fs.readFileSync(configPath, 'utf-8');
    const config = toml.parse(content);
    return config['PetFragmentLevel'] as unknown;
};

export const launcherConfig = (key: string, appRoot: string): unknown => {
    const configPath = path.join(appRoot, 'config', 'sea-launcher.toml');
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, '');
    }
    const content = fs.readFileSync(configPath, 'utf-8');
    const config = toml.parse(content);
    if (JSON.stringify(config[key]) === '{}') {
        return null;
    }
    return config[key] ?? null;
};

export const setLauncherConfig = (key: string, appRoot: string, newConfig: unknown) => {
    const configPath = path.join(appRoot, 'config', 'sea-launcher.toml');
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, '');
    }
    const content = fs.readFileSync(configPath, 'utf-8');
    const config = toml.parse(content);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    config[key] = newConfig ?? ({} as any);
    fs.writeFileSync(configPath, toml.stringify(config));
    return {
        success: true,
    };
};
