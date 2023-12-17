import type { LinearProgressProps, TypographyProps } from '@mui/material';
import { LinearProgress, Stack, Typography } from '@mui/material';
import React from 'react';

type LabeledProgressProps = LinearProgressProps & {
    prompt?: string;
    overridePrompt?: React.ReactNode;
    progress: number;
    total: number;
    labelPosition?: 'right' | 'top-left' | 'top-center';
    typographyProps?: TypographyProps;
};

export function LabeledLinearProgress({
    progress,
    total,
    prompt,
    overridePrompt,
    labelPosition: position,
    typographyProps,
    sx,
    ...rest
}: LabeledProgressProps) {
    let display = prompt ? `${prompt}: ` : '';
    position = position ?? 'top-left';

    display += `${progress} / ${total}`;

    if (position === 'top-left') {
        return (
            <Typography component={'div'} {...typographyProps}>
                {overridePrompt ?? display}
                <LinearProgress variant="determinate" value={(progress / total) * 100} sx={sx} {...rest} />
            </Typography>
        );
    } else if (position === 'right') {
        return (
            <Stack flexDirection="row" justifyContent="center" alignItems="baseline">
                <LinearProgress
                    variant="determinate"
                    value={(progress / total) * 100}
                    sx={{ width: '100%', ...sx }}
                    {...rest}
                />
                <Typography component={'span'} {...typographyProps}>
                    {overridePrompt ?? display}
                </Typography>
            </Stack>
        );
    } else if (position === 'top-center') {
        return (
            <Stack flexDirection="column" justifyContent="center" alignItems="center">
                <Typography component={'span'} {...typographyProps}>
                    {overridePrompt ?? display}
                </Typography>
                <LinearProgress
                    variant="determinate"
                    value={(progress / total) * 100}
                    sx={{ width: '100%', ...sx }}
                    {...rest}
                />
            </Stack>
        );
    }
}
