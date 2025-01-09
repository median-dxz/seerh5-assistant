import type { PetFragmentOptions } from '@/builtin/petFragment/types';
import { Row } from '@/components/styled/Row';
import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Stack
} from '@mui/material';
import { dequal } from 'dequal';
import { useSnackbar } from 'notistack';
import { useCallback } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { BattleSelector, DifficultySelector, petFragmentLevels, useOptionsList } from './shared';

export interface EditOptionsFormProps {
    open: boolean;
    onClose: () => void;
    index: number;
}

export function EditOptionsForm({ open, onClose, index }: EditOptionsFormProps) {
    const { enqueueSnackbar } = useSnackbar();
    const { optionsList, mutate } = useOptionsList();
    const { control, handleSubmit, watch, clearErrors } = useForm<PetFragmentOptions>({
        values: optionsList[index]
    });

    const handleClose = useCallback(
        (_?: unknown, reason?: 'backdropClick' | 'escapeKeyDown') => {
            if (reason === 'backdropClick') return;
            onClose();
        },
        [onClose]
    );

    const difficulty = watch('difficulty');
    const isSweep = watch('sweep');

    const levelId = optionsList.at(index)?.id;
    // 即便 open 为 false, levelId也可能是有效的, 此时会导致 difficulty 为 undefined
    const bosses = open && levelId ? petFragmentLevels.selectById(levelId)?.bosses : undefined;
    const levelCount = bosses?.[difficulty].length ?? 0;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            PaperProps={{
                component: 'form',
                onSubmit: handleSubmit((payload) => {
                    payload.battle = payload.battle ?? [];
                    if (!optionsList.some((data) => dequal(data, payload))) {
                        mutate((draft) => {
                            draft[index] = structuredClone(payload);
                        });
                        handleClose();
                    } else {
                        enqueueSnackbar('配置已存在', { variant: 'warning' });
                    }
                })
            }}
        >
            <DialogTitle>{levelId && petFragmentLevels.selectById(levelId)?.name}</DialogTitle>
            <DialogContent>
                <Stack sx={{ pt: 2, mt: 2 }}>
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
                    保存
                </Button>
                <Button onClick={handleClose}>取消</Button>
            </DialogActions>
        </Dialog>
    );
}
