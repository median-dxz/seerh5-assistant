import { Autocomplete, TextField } from '@mui/material';
import { forwardRef } from 'react';
import type { ControllerRenderProps } from 'react-hook-form';

import { useAppSelector } from '@/store';

export interface BattleItemProps {
    label: string;
    helperText?: string;
}

export const BattleItem = forwardRef<unknown, ControllerRenderProps & BattleItemProps>(function BattleItem(
    { helperText, label, onChange, ...props },
    ref
) {
    const battleKeys = useAppSelector((state) => state.mod.battleKeys);
    return (
        <Autocomplete
            {...props}
            ref={ref}
            autoComplete
            freeSolo
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
            onChange={(event: unknown, newValue: string | null) => {
                onChange(newValue ?? '');
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    inputProps={{
                        ...params.inputProps,
                        autoComplete: 'off'
                    }}
                    label={label}
                    helperText={helperText}
                />
            )}
            options={battleKeys}
        />
    );
});
