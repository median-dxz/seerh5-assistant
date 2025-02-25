import Close from '@mui/icons-material/Close';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    TextField,
    Typography
} from '@mui/material';
import type { Command } from '@sea/mod-type';
import { Controller, useForm } from 'react-hook-form';

export interface ParametersDialogProps {
    open: boolean;
    onCancel: () => void;
    onSubmit: (param: string) => void;
    command?: Command;
}

const getText = (value?: string | (() => string)) => (typeof value === 'function' ? value() : value);

export function ParametersDialog({ open, command, onCancel, onSubmit }: ParametersDialogProps) {
    const { control, handleSubmit } = useForm<{ param: string }>({
        defaultValues: { param: '{}' }
    });

    const description = getText(command?.parametersDescription);

    return (
        <Dialog open={open} onClose={onCancel} fullWidth scroll="paper">
            <DialogTitle>输入命令参数: {command?.name}</DialogTitle>
            <IconButton
                aria-label="close"
                onClick={onCancel}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8
                }}
            >
                <Close />
            </IconButton>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column' }}>
                <Controller
                    control={control}
                    rules={{
                        validate: (value) => {
                            try {
                                JSON.parse(value);
                                return true;
                            } catch (e) {
                                return '参数必须是一个有效的JSON对象';
                            }
                        }
                    }}
                    name="param"
                    render={({ field, fieldState: { error } }) => (
                        <TextField {...field} label="ParameterObject" helperText={error?.message} multiline />
                    )}
                />
                <Typography variant="body2">{description}</Typography>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleSubmit(({ param }) => onSubmit(param))}
                    variant="contained"
                    disableRipple
                    type="submit"
                >
                    执行
                </Button>
                <Button onClick={onCancel}>取消</Button>
            </DialogActions>
        </Dialog>
    );
}
