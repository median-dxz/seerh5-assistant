import { buildDefaultConfig } from '@/shared';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import type { SEAConfigSchema } from '@sea/mod-type';
import { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { BattleItem } from './BattleItem';
import { CheckboxItem } from './CheckboxItem';
import { InputItem } from './InputItem';
import { SelectItem } from './SelectItem';

export interface SEAConfigFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: object) => void | Promise<void>;
    schema: SEAConfigSchema;
    values: object;
    title?: string;
}

export function SEAConfigForm({ onClose, onSubmit, open, values, schema, title }: SEAConfigFormProps) {
    const defaultValues = buildDefaultConfig(schema);
    const { control, handleSubmit, reset } = useForm<object>({
        values,
        defaultValues
    });

    const [mutating, setMutating] = useState(false);

    const handleClose = useCallback(
        (_?: unknown, reason?: 'backdropClick' | 'escapeKeyDown') => {
            if (reason === 'backdropClick') return;
            onClose();
            reset(values);
        },
        [onClose, reset, values]
    );

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            scroll="paper"
            PaperProps={{
                component: 'form',
                onSubmit: handleSubmit(async (values) => {
                    setMutating(true);
                    await onSubmit(values);
                    setMutating(false);
                })
            }}
        >
            <DialogTitle>{title ?? '编辑配置'}</DialogTitle>
            <DialogContent>
                <Stack sx={{ pt: 2 }} spacing={2} direction="column">
                    {Object.keys(values).map((key) => {
                        const itemSchema = schema[key]!;
                        return (
                            <Controller
                                key={key}
                                control={control}
                                name={key as never}
                                render={({ field }) => {
                                    switch (itemSchema.type) {
                                        case 'select':
                                            return (
                                                <SelectItem
                                                    {...field}
                                                    items={itemSchema.list}
                                                    label={itemSchema.name}
                                                    helperText={itemSchema.helperText}
                                                />
                                            );
                                        case 'input':
                                            return (
                                                <InputItem
                                                    {...field}
                                                    label={itemSchema.name}
                                                    helperText={itemSchema.helperText}
                                                />
                                            );
                                        case 'checkbox':
                                            return (
                                                <CheckboxItem
                                                    {...field}
                                                    label={itemSchema.name}
                                                    helperText={itemSchema.helperText}
                                                />
                                            );
                                        case 'battle':
                                            return (
                                                <BattleItem
                                                    {...field}
                                                    label={itemSchema.name}
                                                    helperText={itemSchema.helperText}
                                                />
                                            );
                                    }
                                }}
                            />
                        );
                    })}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    disabled={mutating}
                    endIcon={<CircularProgress size="inherit" />}
                    disableRipple
                    type="submit"
                >
                    保存
                </Button>
                <Button onClick={() => reset(defaultValues)}>重置</Button>
                <Button onClick={handleClose}>取消</Button>
            </DialogActions>
        </Dialog>
    );
}
