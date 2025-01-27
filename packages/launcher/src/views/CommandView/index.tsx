import { alpha, Autocomplete, Box, TextField as MuiTextField, styled, type BoxProps } from '@mui/material';
import { useSnackbar, type SnackbarProviderProps } from 'notistack';
import { forwardRef, useEffect, useMemo, useState } from 'react';

import type { Command, PlainObject } from '@sea/mod-type';

import { ModStore } from '@/features/mod';
import { theme } from '@/theme';

import { produce } from 'immer';
import { ParametersDialog } from './ParametersDialog';

interface Option {
    value: Command;
    label: string;
}

const snackBarOptions: SnackbarProviderProps = {
    autoHideDuration: 3000,
    anchorOrigin: { horizontal: 'center', vertical: 'bottom' }
};

const TextField = styled(MuiTextField)`
    box-shadow: ${theme.boxShadow};
    background-color: ${alpha(theme.palette.extendedBackground.emphasize, 0.72)};
    backdrop-filter: blur(8px);
    font-family: ${theme.fonts.property};
    border-radius: ${theme.shape.borderRadius}px;
` as typeof MuiTextField;

interface CommandInputProps {
    onExecuteCommand: (cmd: Command) => void;
}

export function CommandInput({ onExecuteCommand }: CommandInputProps) {
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [value, setValue] = useState<null | Option>(null);

    const commands = ModStore.useCommandStore();

    const options = useMemo(
        () =>
            commands.map((cmd) => {
                let description: string;
                if (typeof cmd.description === 'function') {
                    description = cmd.description();
                } else {
                    description = cmd.description ?? '';
                }
                return { value: cmd, label: `${cmd.name} ${description}` } as Option;
            }),
        [commands]
    );

    return (
        <Autocomplete
            id="command-input"
            autoHighlight
            selectOnFocus
            clearOnBlur
            clearOnEscape
            disablePortal
            inputValue={inputValue}
            onInputChange={(event, newInputValue): void => {
                setInputValue(newInputValue);
            }}
            value={value}
            onChange={(event, option: Option | null) => {
                if (!option) return;
                onExecuteCommand(option.value);
                setValue(null);
                setInputValue('');
            }}
            open={open}
            onOpen={() => {
                setOpen(true);
            }}
            onClose={() => {
                setOpen(false);
            }}
            options={options}
            renderInput={(params) => (
                <TextField
                    {...params}
                    slotProps={{
                        htmlInput: {
                            ...params.inputProps,
                            autoComplete: 'off'
                        }
                    }}
                    label={'SEA Launcher 命令行'}
                    autoFocus
                />
            )}
        />
    );
}

export const CommandView = forwardRef<HTMLDivElement, BoxProps>(function CommandRef({ ...props }, ref) {
    const { enqueueSnackbar } = useSnackbar();
    const [executingCommand, setExecutingCommand] = useState<undefined | (Command & { param?: PlainObject })>(
        undefined
    );
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (executingCommand === undefined) return;
        const { handler, param, name } = executingCommand;
        if (handler.length > 0 && param === undefined) {
            setOpen(true);
            return;
        }
        void (async () => {
            try {
                await handler(param);
                enqueueSnackbar(`执行命令成功: ${name}`, snackBarOptions);
            } catch (error: unknown) {
                const errorMsg = `执行命令失败: ${name}`;
                enqueueSnackbar(errorMsg, { ...snackBarOptions, variant: 'error' });
                console.error(`[SEAL] CommandView: ${errorMsg}: ${(error as Error).message}`);
            } finally {
                setExecutingCommand(undefined);
            }
        })();
    }, [enqueueSnackbar, executingCommand]);

    return (
        <Box {...props} ref={ref}>
            <CommandInput onExecuteCommand={setExecutingCommand} />
            <ParametersDialog
                open={open}
                command={executingCommand}
                onCancel={() => {
                    setOpen(false);
                    setExecutingCommand(undefined);
                }}
                onSubmit={(param) => {
                    setOpen(false);
                    setExecutingCommand(
                        produce((draft) => {
                            draft && (draft.param = JSON.parse(param));
                        })
                    );
                }}
            />
        </Box>
    );
});
