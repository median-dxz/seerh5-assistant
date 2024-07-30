import { TextField } from '@mui/material';
import { forwardRef } from 'react';
import type { ControllerRenderProps } from 'react-hook-form';

export interface InputItemProps {
    label: string;
    helperText?: string;
}

export const InputItem = forwardRef<HTMLDivElement, ControllerRenderProps & InputItemProps>(
    function InputItem(props, ref) {
        return <TextField {...props} ref={ref} multiline />;
    }
);
