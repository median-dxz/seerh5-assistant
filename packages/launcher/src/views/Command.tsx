import { Box, type SxProps } from '@mui/material';
import { useSnackbar, type SnackbarProviderProps } from 'notistack';
import React, { useState } from 'react';

import type { Command as CommandInstance } from '@sea/mod-type';

import { SeaAutocomplete } from '@/components/styled/Autocomplete';
import { SeaTextField } from '@/components/styled/TextField';
import { commandStore } from '@/features/mod/store';
import { useMapToStore } from '@/features/mod/useModStore';
import type { theme } from '@/style';

interface Option {
    value: CommandInstance;
    label: string;
}

const snackBarOptions: SnackbarProviderProps = {
    autoHideDuration: 3000,
    anchorOrigin: { horizontal: 'center', vertical: 'bottom' }
};

export function CommandInput() {
    const { enqueueSnackbar } = useSnackbar();
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [value, setValue] = useState<null | Option>(null);

    const commands = useMapToStore((state) => state.mod.commandRefs, commandStore);

    const options = React.useMemo(
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
        <SeaAutocomplete
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
                <SeaTextField
                    {...params}
                    label={'SEA Launcher 命令行'}
                    autoFocus
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: <React.Fragment>{params.InputProps.endAdornment}</React.Fragment>
                    }}
                />
            )}
        />
    );
}

const CommandInputRef = React.forwardRef<HTMLDivElement, { sx: SxProps<typeof theme> }>(({ sx, ...props }, ref) => (
    <Box sx={sx} ref={ref}>
        <CommandInput {...props} />
    </Box>
));

export const Command = CommandInputRef;
