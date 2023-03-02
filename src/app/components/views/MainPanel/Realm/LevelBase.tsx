import { DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { AutoBattle, Manager, } from '@sa-core/battle';
import React from 'react';

export type LevelExtendsProps<P = unknown> = P & {
    running: boolean;
    setRunning: React.Dispatch<React.SetStateAction<boolean>>;
};

interface LevelBaseProps {
    title: string;
    hint: string | JSX.Element;
}

export function LevelBase(props: React.PropsWithChildren<LevelBaseProps>) {
    return (
        <>
            <DialogTitle>{props.title}</DialogTitle>
            <DialogContent>
                {props.children}
                <DialogContentText component={'span'}>{props.hint}</DialogContentText>
            </DialogContent>
        </>
    );
}

export function updateCustomStrategy(custom?: AutoBattle.MoveModule) {
    Manager.strategy = custom;
}
