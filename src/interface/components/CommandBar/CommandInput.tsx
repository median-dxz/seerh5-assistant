import { Autocomplete as AutocompleteRaw, AutocompleteProps, CircularProgress } from '@mui/material';
import { styled } from '@mui/system';
import React, { useEffect, useState } from 'react';
import { mainColor, StyledTextField } from './StyledTextField';

const Autocomplete: typeof AutocompleteRaw = styled(
    ({ className, ...props }: AutocompleteProps<unknown, false, false, false>) => (
        <AutocompleteRaw {...props} classes={{ popper: className }} />
    )
)`
    --main-color: rgba(${mainColor} / 75%);
    --main-color-full: rgb(${mainColor});
    & .MuiAutocomplete-paper {
        backdrop-filter: blur(12px);
        background-color: rgba(10 55 118 / 50%);
        box-shadow: 0 0 16px rgba(10 55 118 / 50%);
        border-radius: 0;
        color: var(--main-color-full);
        & .MuiAutocomplete-noOptions {
            color: var(--main-color-full);
        }
    }
`;

export function CommandInput() {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<readonly string[]>([]);
    const [modName, setModName] = useState<null | string>(null);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        let o = [];
        const Mods = window.SAMods;
        if (modName) {
            for (const key of Mods.get(modName)!.getKeys()) {
                o.push(key);
            }
        } else {
            for (const key of window.SAMods.keys()) {
                o.push(key);
            }
        }

        setOptions([...o]);
        setInputValue('');
    }, [modName, open]);

    return (
        <Autocomplete
            id="command-input"
            sx={{
                width: '100%',
            }}
            autoComplete
            autoHighlight
            clearOnBlur
            clearOnEscape
            inputValue={inputValue}
            onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
            }}
            onChange={(event, newValue: string | null) => {
                if (modName && newValue) {
                    window.SAMods.get(modName)!.reflect(newValue);
                } else {
                    setModName(newValue);
                }
            }}
            open={open}
            onOpen={() => {
                setOpen(true);
            }}
            onClose={() => {
                setOpen(false);
            }}
            isOptionEqualToValue={(option, value) => option === value}
            getOptionLabel={(option) => option}
            options={options}
            renderInput={(params) => (
                <StyledTextField
                    {...params}
                    label={modName ?? '选择以应用模组...'}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: <React.Fragment>{params.InputProps.endAdornment}</React.Fragment>,
                    }}
                />
            )}
        />
    );
}
