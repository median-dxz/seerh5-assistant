import { Autocomplete as AutocompleteRaw, AutocompleteProps } from '@mui/material';
import { styled } from '@mui/system';
import React, { useEffect, useState } from 'react';
import { useBubbleHint } from '../../utils/useBubbleHint';
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
        font-family: HuaKangXinZongYi;
        font-weight: 200;
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
    const [value, setValue] = useState<null | string>(null);

    useEffect(() => {
        let o = [];
        const Mods = window.SAMods;
        if (modName) {
            for (const key of Mods.get(modName)!.getKeys()) {
                o.push(key);
            }
            o.push('return');
        } else if (window.SAMods) {
            for (const key of window.SAMods.keys()) {
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
        <Autocomplete
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
                    window.SAMods.get(modName)!.reflect(newValue);
                    useBubbleHint(`[Info]: 应用命令: ${modName}: ${newValue}`);
                    if (newValue === 'return') {
                        handleLeaveMod();
                    } else {
                        setValue(null);
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
                <StyledTextField
                    {...params}
                    label={modName ? `应用 ${modName}:` : '选择以应用模组...'}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: <React.Fragment>{params.InputProps.endAdornment}</React.Fragment>,
                    }}
                />
            )}
        />
    );
}
