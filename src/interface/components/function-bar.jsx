import { DataObject } from '@mui/icons-material';
import { Button, ButtonGroup } from '@mui/material';
import React from 'react';

export function FunctionBar(props) {
    return (
        <ButtonGroup sx={{ height: '36px', marginLeft: '12px', display: props.show ? 'block' : 'none' }}>
            <Button>
                <DataObject />
            </Button>
        </ButtonGroup>
    );
}
