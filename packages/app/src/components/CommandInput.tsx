import { Autocomplete as AutocompleteRaw } from '@mui/material';
import { styled } from '@mui/system';
import { Mods } from '@sa-app/mod-manager';
import { mainTheme } from '@sa-app/style';
import React, { useEffect, useState } from 'react';
import { StyledTextField } from './StyledTextField';

const AutocompleteWrapped: typeof AutocompleteRaw = ({ className, ...props }) => (
    <AutocompleteRaw {...props} classes={{ popper: className }} />
);

const Autocomplete = styled(AutocompleteWrapped)`
    & .MuiAutocomplete-paper {
        backdrop-filter: blur(12px);
        background-color: ${mainTheme.palette.background.default};
        box-shadow: 0 0 16px rgba(0, 0, 0, 0.18);
        border-radius: 0;
        color: ${mainTheme.palette.text};
        font-family: HuaKangXinZongYi;
        font-weight: 200;
        & .MuiAutocomplete-noOptions {
            color: ${mainTheme.palette.text.primary};
        }
    }
` as typeof AutocompleteRaw;

export function CommandInput() {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<readonly string[]>([]);
    const [modName, setModName] = useState<null | string>(null);
    const [inputValue, setInputValue] = useState('');
    const [value, setValue] = useState<null | string>(null);

    useEffect(() => {
        const o = [];
        if (modName) {
            for (const key of Mods.get(modName)!.getKeys()) {
                o.push(key);
            }
            o.push('return');
        } else if (Mods) {
            for (const key of Mods.keys()) {
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
                    Mods.get(modName)!.reflect(newValue);
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
                <StyledTextField
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
