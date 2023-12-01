import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/system';
import { theme } from '@sea/launcher/style';
import React from 'react';

export default function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
        </ThemeProvider>
    );
}

// sub.on(fromSocket(CommandID.NOTE_USE_SKILL, 'receive'), (data) => {
//     const [fi, si] = data;
//     Logger.BattleManager.info(`对局信息更新:
//         先手方:${fi.userId}
//         hp: ${fi.hp.remain} / ${fi.hp.max}
//         造成伤害: ${fi.damage}
//         是否暴击:${fi.isCrit}
//         使用技能: ${SkillXMLInfo.getName(fi.skillId)}
//         ===========
//         后手方:${si.userId}
//         hp: ${si.hp.remain} / ${si.hp.max}
//         造成伤害: ${si.damage}
//         是否暴击:${si.isCrit}
//         使用技能: ${SkillXMLInfo.getName(si.skillId)}`);
// });
