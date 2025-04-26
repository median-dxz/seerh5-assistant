import type { PetFragmentOptions } from '@/builtin/petFragment/types';
import { Row } from '@/components/Row';
import {
    Autocomplete,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Stack,
    TextField
} from '@mui/material';
import type { PetFragmentLevel } from '@sea/core';
import { PetFragmentLevelDifficulty as Difficulty } from '@sea/core';
import { dequal } from 'dequal';
import { useSnackbar } from 'notistack';
import { useCallback } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { BattleSelector, DifficultySelector, petFragmentLevels, useOptionsList, validatePrimitive } from './shared';

export interface AddOptionsFormProps {
    open: boolean;
    onClose: () => void;
}

const defaultValues: PetFragmentOptions = {
    id: NaN,
    difficulty: Difficulty.Ease,
    sweep: false,
    battle: []
};

export function AddOptionsForm({ open, onClose }: AddOptionsFormProps) {
    const { enqueueSnackbar } = useSnackbar();
    const { control, handleSubmit, watch, reset, clearErrors } = useForm<PetFragmentOptions>({
        defaultValues
    });
    const { optionsList, mutate } = useOptionsList();

    const handleClose = useCallback(
        (_?: unknown, reason?: 'backdropClick' | 'escapeKeyDown') => {
            if (reason === 'backdropClick') return;
            onClose();
            reset(defaultValues);
        },
        [onClose, reset]
    );

    const difficulty = watch('difficulty');
    const isSweep = watch('sweep');
    const levelId = watch('id');

    let levelCount = 0;
    if (levelId && difficulty) {
        const bosses = petFragmentLevels.selectById(levelId)?.bosses;
        levelCount = bosses?.[difficulty].length ?? 0;
    }

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            slotProps={{
                paper: {
                    component: 'form',
                    onSubmit: handleSubmit((payload) => {
                        payload.battle = payload.battle ?? [];
                        if (!optionsList.some((data) => dequal(data, payload))) {
                            mutate((draft) => {
                                draft.push(structuredClone(payload));
                            });
                            handleClose();
                        } else {
                            reset({ ...payload, battle: [] });
                            enqueueSnackbar('配置已存在', { variant: 'warning' });
                        }
                    })
                }
            }}
        >
            <DialogTitle>添加精灵因子配置</DialogTitle>
            <DialogContent>
                <Stack sx={{ pt: 2, mt: 2 }}>
                    <Controller
                        control={control}
                        name="id"
                        rules={{
                            validate: (value) => validatePrimitive(value) || '请选择一个因子关卡'
                        }}
                        render={({ field, fieldState }) => (
                            <Autocomplete<PetFragmentLevel | null>
                                {...field}
                                fullWidth
                                onChange={(_, value) => {
                                    field.onChange(value?.id ?? NaN);
                                }}
                                value={petFragmentLevels.selectById(field.value) ?? null}
                                autoComplete
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        slotProps={{ htmlInput: { ...params.inputProps, autoComplete: 'off' } }}
                                        label="因子"
                                        helperText={fieldState.error?.message}
                                    />
                                )}
                                options={petFragmentLevels.all().sort((a, b) => b.id - a.id)}
                                getOptionLabel={(pf) => (pf ? pf.name.split(' ')[1] : '')}
                            />
                        )}
                    />
                    <Row sx={{ alignItems: 'center' }}>
                        <Controller
                            control={control}
                            name="difficulty"
                            render={({ field }) => <DifficultySelector {...field} />}
                        />
                        <Controller
                            control={control}
                            name="sweep"
                            render={({ field }) => (
                                <FormControlLabel
                                    {...field}
                                    onChange={(e, checked) => {
                                        clearErrors('battle');
                                        field.onChange(e, checked);
                                    }}
                                    checked={field.value}
                                    control={<Checkbox />}
                                    label="扫荡"
                                />
                            )}
                        />
                    </Row>
                    <Controller
                        control={control}
                        disabled={isSweep}
                        name="battle"
                        rules={{
                            deps: ['sweep'],
                            validate: (value) => (!isSweep && value.length === levelCount) || '对战方案数量和关卡不一致'
                        }}
                        render={({ field, fieldState }) => (
                            <BattleSelector {...field} errorText={fieldState.error?.message} levelCount={levelCount} />
                        )}
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" disableRipple type="submit">
                    添加
                </Button>
                <Button onClick={handleClose}>取消</Button>
            </DialogActions>
        </Dialog>
    );
}
