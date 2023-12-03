import { Box } from '@mui/material';
import React, { useState } from 'react';

import { SeaAutocomplete } from '@/components/styled/Autocomplete';
import { SeaTextField } from '@/components/styled/TextField';
import { useModStore } from '@/context/useModStore';

interface Option {
    value: string;
    label: string;
}

export function CommandInput() {
    const { commandStore } = useModStore();
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [value, setValue] = useState<null | Option>(null);

    const options = React.useMemo(() => {
        return Array.from(commandStore.values()).map((cmd) => {
            let description = cmd.description;
            if (typeof cmd.description === 'function') {
                description = ''
            }
            return { value: cmd.name, label: `${cmd.name} ${description ?? ''}` } as Option;
        });
    }, [commandStore]);

    return (
        <SeaAutocomplete
            id="command-input"
            sx={{
                width: '100%',
            }}
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
                const cmd = commandStore.get(newValue.value)!;

                if (cmd.handler.length > 0) {
                    BubblerManager.getInstance().showText(`[Info]: 命令: ${cmd.name} 需要输入参数`);
                    return;
                }

                cmd.handler();
                BubblerManager.getInstance().showText(`[Info]: 应用命令: ${cmd.name}`);

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
            // isOptionEqualToValue={(option, value) => {
            //     return value === option || value === '' || value === null;
            // }}
            renderInput={(params) => (
                <SeaTextField
                    {...params}
                    label={'SEA Launcher 命令行'}
                    autoFocus
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: <React.Fragment>{params.InputProps.endAdornment}</React.Fragment>,
                    }}
                />
            )}
        />
    );
}

const CommandInputRef = React.forwardRef<HTMLDivElement>((props, ref) => (
    <Box
        sx={{
            position: 'absolute',
            left: '30vw',
            top: '10vh',
            width: '40vw',
            minWidth: '240px',
            zIndex: (theme) => theme.zIndex.snackbar,
        }}
    >
        <div ref={ref} {...props}>
            <CommandInput />
        </div>
    </Box>
));

export const Command = CommandInputRef;
