import type { PetFragmentOptions } from '@/builtin/petFragment/types';
import { Row } from '@/components/styled/Row';
import {
    Autocomplete,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Stack,
    Switch,
    TextField
} from '@mui/material';
import type { PetFragmentLevel } from '@sea/core';
import { PetFragmentLevelDifficulty as Difficulty } from '@sea/core';
import { toRaw } from '@vue/reactivity';
import { dequal } from 'dequal';
import { useSnackbar } from 'notistack';
import { useCallback } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { BattleSelector, DifficultySelector, petFragmentLevels, validatePrimitive } from './shared';

export interface AddOptionsFormProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    modData: PetFragmentOptions[];
}

export function AddOptionsForm({ open, setOpen, modData }: AddOptionsFormProps) {
    const { enqueueSnackbar } = useSnackbar();
    const { control, handleSubmit, watch, reset, clearErrors } = useForm<PetFragmentOptions>({
        defaultValues: {
            id: NaN,
            difficulty: Difficulty.Ease,
            sweep: false,
            battle: []
        }
    });

    const handleClose = useCallback(
        (_?: unknown, reason?: 'backdropClick' | 'escapeKeyDown') => {
            if (reason === 'backdropClick') return;
            setOpen(false);
            reset();
        },
        [setOpen, reset]
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
            PaperProps={{
                component: 'form',
                onSubmit: handleSubmit((newData) => {
                    newData.battle = newData.battle ?? [];
                    if (!toRaw(modData).some((data) => dequal(data, newData))) {
                        modData.push({ ...newData });
                        handleClose();
                    } else {
                        reset({ ...newData, battle: [] });
                        enqueueSnackbar('配置已存在', { variant: 'warning' });
                    }
                })
            }}
        >
            <DialogTitle>添加精灵因子配置</DialogTitle>
            <DialogContent>
                <Stack sx={{ pt: 2 }} direction="column">
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
                                        inputProps={{ ...params.inputProps, autoComplete: 'off' }}
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
                                    control={<Switch />}
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
