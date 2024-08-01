import { Autocomplete, TextField } from '@mui/material';
import { forwardRef } from 'react';
import type { ControllerRenderProps } from 'react-hook-form';

import { mod } from '@/features/mod';
import { useAppSelector } from '@/shared';

export interface BattleItemProps {
    label: string;
    helperText?: string;
}

export const BattleItem = forwardRef<unknown, ControllerRenderProps & BattleItemProps>(function BattleItem(
    { helperText, label, onChange, ...props },
    ref
) {
    const battleKeys = useAppSelector(mod.battleKeys);

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
