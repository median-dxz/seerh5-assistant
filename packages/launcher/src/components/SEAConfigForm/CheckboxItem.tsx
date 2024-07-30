import { Checkbox, FormControlLabel, FormHelperText } from '@mui/material';
import { forwardRef } from 'react';
import type { ControllerRenderProps } from 'react-hook-form';
import { Row } from '../styled/Row';

export interface CheckboxItemProps {
    label: string;
    helperText?: string;
}

export const CheckboxItem = forwardRef<HTMLDivElement, ControllerRenderProps & CheckboxItemProps>(function CheckboxItem(
    { label, helperText, value, ...props },
    ref
) {
    return (
        <Row>
            <FormControlLabel
                label={label}
                sx={{
                    width: 'fit-content'
                }}
                {...props}
                ref={ref}
                checked={value}
                control={<Checkbox />}
            />
            {helperText && <FormHelperText sx={{ fontSize: '1rem' }}>{helperText}</FormHelperText>}
        </Row>
    );
});
