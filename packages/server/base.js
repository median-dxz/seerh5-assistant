import path from 'path';
import { fileURLToPath } from 'url';

export const base = path.dirname(fileURLToPath(import.meta.url));
