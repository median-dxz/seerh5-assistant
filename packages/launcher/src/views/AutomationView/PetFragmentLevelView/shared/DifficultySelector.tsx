import type { PetFragmentOptions } from '@/builtin/petFragment/types';
import { DifficultyText } from '@/constants';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { PetFragmentLevelDifficulty as Difficulty } from '@sea/core';
import { forwardRef } from 'react';
import type { ControllerRenderProps } from 'react-hook-form';

const AllDifficulty = [Difficulty.Ease, Difficulty.Normal, Difficulty.Hard];

export const DifficultySelector = forwardRef<HTMLDivElement, ControllerRenderProps<PetFragmentOptions, 'difficulty'>>(
    function DifficultySelector({ ...field }, ref) {
        return (
            <FormControl
                ref={ref}
                sx={{
                    width: '6rem'
                }}
            >
                <InputLabel>难度</InputLabel>
                <Select {...field} label="难度">
                    {AllDifficulty.map((difficulty) => (
                        <MenuItem key={difficulty} value={difficulty}>
                            {DifficultyText[difficulty]}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        );
    }
);
