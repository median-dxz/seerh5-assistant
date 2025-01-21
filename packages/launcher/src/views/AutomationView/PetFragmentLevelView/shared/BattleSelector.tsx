import { Autocomplete, Chip, TextField, Typography } from '@mui/material';
import { forwardRef, useState } from 'react';
import type { ControllerRenderProps } from 'react-hook-form';

import type { PetFragmentOptions } from '@/builtin/petFragment/types';
import { Row } from '@/components/Row';
import { mod } from '@/features/mod';
import { useAppSelector } from '@/shared';

export const BattleSelector = forwardRef<
    unknown,
    ControllerRenderProps<PetFragmentOptions, 'battle'> & { errorText?: string; levelCount: number }
>(function BattleSelector({ onChange, value, errorText, levelCount, ...props }, ref) {
    const [inputValue, setInputValue] = useState('');
    const battleKeys = useAppSelector(mod.battleKeys);
    return (
        <>
            <Autocomplete
                {...props}
                ref={ref}
                autoComplete
                onChange={(_, v) => {
                    setInputValue('');
                    if (v && value.length < levelCount) {
                        onChange(value.concat(v));
                    }
                }}
                value={null}
                inputValue={inputValue}
                onInputChange={(_, v) => {
                    setInputValue(v);
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        slotProps={{
                            htmlInput: {
                                ...params.inputProps,
                                autoComplete: 'off'
                            },
                            input: {
                                ...params.InputProps
                            }
                        }}
                        label="对战方案"
                        helperText={errorText}
                    />
                )}
                options={battleKeys}
            />
            <Typography>
                已选择: {value.length} / {levelCount}
            </Typography>
            <Row sx={{ overflowX: 'scroll' }} spacing={2}>
                {value.map((battle, index) => (
                    <Chip
                        key={index}
                        label={battle}
                        onDelete={() => {
                            onChange(value.filter((_, i) => i !== index));
                        }}
                    />
                ))}
            </Row>
        </>
    );
});
