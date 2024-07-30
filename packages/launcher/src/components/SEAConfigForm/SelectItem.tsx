import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';
import { forwardRef } from 'react';
import type { ControllerRenderProps } from 'react-hook-form';

export interface SelectItemProps {
    label: string;
    helperText?: string;
    items: Record<string, string>;
}

export const SelectItem = forwardRef<HTMLDivElement, ControllerRenderProps & SelectItemProps>(function SelectItem(
    { label, items, helperText, ...field },
    ref
) {
    return (
        <FormControl ref={ref}>
            <InputLabel>{label}</InputLabel>
            <Select {...field}>
                {Object.entries(items).map(([key, item]) => (
                    <MenuItem key={item} value={item}>
                        {key}
                    </MenuItem>
                ))}
            </Select>
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
    );
});
