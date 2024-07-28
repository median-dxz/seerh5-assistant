import type { PetFragmentOptions } from '@/builtin/petFragment/types';
import { Row } from '@/components/styled/Row';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Stack,
    Switch
} from '@mui/material';
import { toRaw } from '@vue/reactivity';
import { dequal } from 'dequal';
import { useSnackbar } from 'notistack';
import { useCallback } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { BattleSelector, DifficultySelector, petFragmentLevels } from './shared';

export interface EditOptionsFormProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    modData: PetFragmentOptions[];
    index: number;
}

export function EditOptionsForm({ open, setOpen, modData, index }: EditOptionsFormProps) {
    const { enqueueSnackbar } = useSnackbar();
    const { control, handleSubmit, watch, reset, clearErrors } = useForm<PetFragmentOptions>({
        defaultValues: {
            ...modData[index]
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
            <DialogTitle>编辑精灵因子配置</DialogTitle>
            <DialogContent>
                <Stack sx={{ pt: 2 }} direction="column">
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
                            validate: (value) => value.length === levelCount || '对战方案数量和关卡不一致'
                        }}
                        render={({ field, fieldState }) => (
                            <BattleSelector {...field} errorText={fieldState.error?.message} levelCount={levelCount} />
                        )}
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" disableRipple type="submit">
                    保存
                </Button>
                <Button onClick={handleClose}>取消</Button>
            </DialogActions>
        </Dialog>
    );
}
