import { alpha, Autocomplete, Box, TextField as MuiTextField, styled, type BoxProps } from '@mui/material';
import { useSnackbar, type SnackbarProviderProps } from 'notistack';
import { forwardRef, useMemo, useState } from 'react';

import type { Command as CommandInstance } from '@sea/mod-type';

import { ModStore } from '@/features/mod';
import { theme } from '@/theme';

interface Option {
    value: CommandInstance;
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

export function CommandInput() {
    const { enqueueSnackbar } = useSnackbar();
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
            onChange={(event, newValue: Option | null) => {
                if (!newValue) return;
                const cmd = newValue.value;

                if (cmd.handler.length > 0) {
                    enqueueSnackbar(`命令: ${cmd.name} 需要输入参数`, snackBarOptions);
                    return;
                }

                cmd.handler();
                enqueueSnackbar(`应用命令: ${cmd.name}`, snackBarOptions);

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

const CommandInputRef = forwardRef<HTMLDivElement, BoxProps>(function CommandInputRef({ ...props }, ref) {
    return (
        <Box {...props} ref={ref}>
            <CommandInput />
        </Box>
    );
});

export const Command = CommandInputRef;
