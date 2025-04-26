import Close from '@mui/icons-material/Close';

import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack
} from '@mui/material';
import { buildDefaultConfig } from '@sea/mod-resolver';
import { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import type { SEAConfigSchema } from '@sea/mod-type';

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

    const handleClose = useCallback(() => {
        onClose();
        reset(values);
    }, [onClose, reset, values]);

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            scroll="paper"
            slotProps={{
                paper: {
                    component: 'form',
                    onSubmit: handleSubmit(async (values) => {
                        setMutating(true);
                        await onSubmit(values);
                        setMutating(false);
                    })
                }
            }}
        >
            <DialogTitle>{title ?? '编辑配置'}</DialogTitle>
            <IconButton
                aria-label="close"
                onClick={handleClose}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8
                }}
            >
                <Close />
            </IconButton>
            <DialogContent>
                <Stack spacing={2}>
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
                {mutating && <CircularProgress size="1rem" />}
                <Button variant="contained" disabled={mutating} disableRipple type="submit">
                    保存
                </Button>
                <Button onClick={() => reset(defaultValues)}>重置</Button>
                <Button onClick={handleClose}>关闭</Button>
            </DialogActions>
        </Dialog>
    );
}
