import fs from 'fs';
import path from 'path';

// 递归寻找mods目录下所有js
export const findMods = (dir: string, root: string) => {
    let r: string[] = [];

    const files = fs.readdirSync(dir);
    files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            r = r.concat(findMods(filePath, root));
        } else if (stat.isFile() && isModFile(filePath)) {
            r.push(path.relative(path.join(root), filePath));
        }
    });
    return r;
};

function isModFile(filePath: string) {
    return path.extname(filePath) === '.js' || path.extname(filePath) === '.json';
}
