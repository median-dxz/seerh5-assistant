import React, { useEffect, useState } from 'react';
import { SeaAutocomplete } from '../components/styled/Autocomplete';
import { SeaTextField } from '../components/styled/TextField';

// const AutocompleteWrapped: typeof MuiAutocomplete = ({ className, ...props }) => (
//     <MuiAutocomplete {...props} classes={{ popper: className }} />
// );

export function CommandInput() {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<readonly string[]>([]);
    const [modName, setModName] = useState<null | string>(null);
    const [inputValue, setInputValue] = useState('');
    const [value, setValue] = useState<null | string>(null);

    useEffect(() => {
        const o = [];
        if (modName) {
            for (const key of ModStore.get(modName)!.getKeys()) {
                o.push(key);
            }
            o.push('return');
        } else if (ModStore) {
            for (const key of ModStore.keys()) {
                o.push(key);
            }
        }

        setOptions([...o]);
    }, [modName, open]);

    const handleEnterMod = (newModName: string) => {
        setModName(newModName);
        setValue(null);
        setInputValue('');
    };

    const handleLeaveMod = () => {
        setModName(null);
        setValue(null);
        setInputValue('');
    };

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
            onKeyDown={(event) => {
                if (event.key === 'Backspace') {
                    if (inputValue === '') {
                        handleLeaveMod();
                    }
                }
            }}
            inputValue={inputValue}
            onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
            }}
            value={value}
            onChange={(event, newValue: string | null) => {
                if (modName && newValue) {
                    ModStore.get(modName)!.reflect(newValue);
                    BubblerManager.getInstance().showText(`[Info]: 应用命令: ${modName}: ${newValue}`);
                    if (newValue === 'return') {
                        handleLeaveMod();
                    } else {
                        setValue(null);
                        setInputValue('');
                    }
                } else {
                    handleEnterMod(newValue!);
                }
            }}
            open={open}
            onOpen={() => {
                setOpen(true);
            }}
            onClose={() => {
                setOpen(false);
            }}
            options={options}
            isOptionEqualToValue={(option, value) => {
                return value === option || value === '' || value === null;
            }}
            renderInput={(params) => (
                <SeaTextField
                    {...params}
                    label={modName ? `应用 ${modName}:` : '选择以应用模组...'}
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
