import type { LinearProgressProps, TypographyProps } from '@mui/material';
import { LinearProgress, Stack, styled, Typography } from '@mui/material';

type LabeledProgressProps = LinearProgressProps & {
    prompt?: string;
    overridePrompt?: React.ReactNode;
    progress: number;
    total: number;
    labelPosition?: 'right' | 'top-left' | 'top-center';
    typographyProps?: TypographyProps;
};

const FullWidthLinearProgress = styled(LinearProgress)`
    width: 100%;
`;

export function LabeledLinearProgress({
    progress,
    total,
    prompt,
    overridePrompt,
    labelPosition: position,
    typographyProps,
    ...rest
}: LabeledProgressProps) {
    let display = prompt ?? '';
    position = position ?? 'top-left';

    display += `${progress} / ${total}`;

    if (position === 'top-left') {
        return (
            <Typography component={'div'} {...typographyProps}>
                {overridePrompt ?? display}
                <LinearProgress variant="determinate" value={(progress / total) * 100} {...rest} />
            </Typography>
        );
    } else if (position === 'right') {
        return (
            <Stack
                sx={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
                spacing={0}
            >
                <FullWidthLinearProgress variant="determinate" value={(progress / total) * 100} {...rest} />
                <Typography component={'span'} {...typographyProps}>
                    {overridePrompt ?? display}
                </Typography>
            </Stack>
        );
    } else {
        // position === 'top-center'
        return (
            <Stack
                sx={{
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
                spacing={0}
            >
                <Typography component={'span'} {...typographyProps}>
                    {overridePrompt ?? display}
                </Typography>
                <FullWidthLinearProgress variant="determinate" value={(progress / total) * 100} {...rest} />
            </Stack>
        );
    }
}
