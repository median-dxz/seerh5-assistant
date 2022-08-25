import { DataObject } from '@mui/icons-material';
import { Button, ButtonGroup } from '@mui/material';
import * as React from 'react';

const { useState } = React;

export function FunctionBar(props) {
    let [autoCure, setAutoCure] = useState(false);
    const SA = window.SA;
    const mods = window.SaMods;
    return (
        <ButtonGroup sx={{ height: '36px', marginLeft: '12px', display: props.show ? 'block' : 'none' }}>
            <Button
                onClick={() => {
                    setAutoCure(!autoCure);
                    SA.PetHelper.ToggleAutoCure(autoCure);
                    BubblerManager.getInstance().showText(autoCure ? '自动治疗开启' : '自动治疗关闭');
                }}
            >
                <DataObject />
            </Button>
            <Button
                onClick={() => {
                    FightManager.fightNoMapBoss(6730);
                }}
            >
                <DataObject />
            </Button>
            <Button
                onClick={() => {
                    mods.get('sign').run();
                }}
            >
                <DataObject />
            </Button>
            <Button
                onClick={() => {
                    mods.get('sign').teamDispatch();
                }}
            >
                <DataObject />
            </Button>
        </ButtonGroup>
    );
}
