import type { PetFragmentOptions } from '@/builtin/petFragment/types';
import { Row } from '@/components/styled/Row';
import { DifficultyText } from '@/constants';
import { useAppSelector } from '@/store';
import {
    alpha,
    Autocomplete,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Switch,
    TextField,
    Typography
} from '@mui/material';
import { PetFragmentLevelDifficulty as Difficulty, PetFragmentLevel } from '@sea/core';
import { toRaw } from '@vue/reactivity';
import { dequal } from 'dequal';
import { useSnackbar } from 'notistack';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import { Controller, useForm, type ControllerRenderProps } from 'react-hook-form';

declare const config: {
    xml: {
        getAnyRes: (name: 'new_super_design') => {
            Root: {
                Design: seerh5.PetFragmentLevelObj[];
            };
        };
    };
};

export interface AddOptionsFormProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    modData: PetFragmentOptions[];
}

const validatePrimitive = (value: number | string) => {
    if (typeof value === 'number') {
        return !isNaN(value);
    }
    return value.trim() !== '';
};

const AllDifficulty = [Difficulty.Ease, Difficulty.Normal, Difficulty.Hard];

export function AddOptionsForm({ open, setOpen, modData }: AddOptionsFormProps) {
    const { enqueueSnackbar } = useSnackbar();
    const { control, handleSubmit, watch, reset } = useForm<PetFragmentOptions>({
        defaultValues: {
            id: NaN,
            difficulty: Difficulty.Ease,
            sweep: false,
            battle: []
        }
    });

    const petFragmentLevelList = useMemo(
        () => config.xml.getAnyRes('new_super_design').Root.Design.map((o) => new PetFragmentLevel(o)),
        []
    );

    const handleClose = useCallback(
        (_?: unknown, reason?: 'backdropClick' | 'escapeKeyDown') => {
            if (reason === 'backdropClick') return;
            setOpen(false);
            reset();
        },
        [setOpen, reset]
    );

    const isSweep = watch('sweep');

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
                                value={petFragmentLevelList.find((pf) => pf.id === field.value) ?? null}
                                autoComplete
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        inputProps={{ ...params.inputProps, autoComplete: 'off' }}
                                        label="因子"
                                        helperText={fieldState.error?.message}
                                    />
                                )}
                                options={petFragmentLevelList.sort((a, b) => b.id - a.id)}
                                getOptionLabel={(pf) => (pf ? pf.name.split(' ')[1] : '')}
                            />
                        )}
                    />
                    <Row sx={{ alignItems: 'center' }}>
                        <Controller
                            control={control}
                            name="difficulty"
                            render={({ field }) => (
                                <FormControl
                                    sx={{
                                        width: '10rem'
                                    }}
                                >
                                    <InputLabel>难度</InputLabel>
                                    <Select
                                        {...field}
                                        MenuProps={{
                                            MenuListProps: {
                                                sx: { bgcolor: ({ palette }) => alpha(palette.secondary.main, 0.88) }
                                            }
                                        }}
                                        label="难度"
                                    >
                                        {AllDifficulty.map((difficulty) => (
                                            <MenuItem key={difficulty} value={difficulty}>
                                                {DifficultyText[difficulty]}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}
                        />
                        <Controller
                            control={control}
                            name="sweep"
                            render={({ field }) => <FormControlLabel {...field} control={<Switch />} label="扫荡" />}
                        />
                    </Row>
                    <Controller
                        control={control}
                        disabled={isSweep}
                        name="battle"
                        rules={{
                            validate: (value) => value.length === 7 || '对战方案数量和关卡不一致'
                        }}
                        render={({ field, fieldState }) => (
                            <PFBattleSelector {...field} errorText={fieldState.error?.message} levelCount={7} />
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

const PFBattleSelector = forwardRef(function PFBattleSelector(
    {
        onChange,
        value,
        errorText,
        levelCount,
        ...props
    }: ControllerRenderProps<PetFragmentOptions, 'battle'> & { errorText?: string; levelCount: number },
    ref
) {
    const [inputValue, setInputValue] = useState('');
    const battleKeys = useAppSelector((state) => state.mod.battleKeys);
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
                        InputProps={{
                            ...params.InputProps
                        }}
                        inputProps={{
                            ...params.inputProps,
                            autoComplete: 'off'
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
