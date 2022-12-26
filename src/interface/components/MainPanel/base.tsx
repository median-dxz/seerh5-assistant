import {
    LinearProgress,
    LinearProgressProps,
    styled,
    Table,
    TableBody,
    TableHead,
    TableRow,
    TableRowProps,
    Typography
} from '@mui/material';
import React, { PropsWithChildren } from 'react';

export const PanelTableBodyRow = styled(TableRow)<TableRowProps>(() => ({
    '&:last-child td, &:last-child th': { border: 0 },
})) as typeof TableRow;

export function PanelTableBase(props: PropsWithChildren<{ heads: React.ReactFragment }>) {
    const { heads: title, children } = props;
    return (
        <Table size="small">
            <TableHead>
                <TableRow>{title}</TableRow>
            </TableHead>
            <TableBody>{children}</TableBody>
        </Table>
    );
}

type PercentLinearProgressProps = LinearProgressProps & {
    prompt?: string;
    cover?: string;
    progress: number;
    total: number;
};

export function PercentLinearProgress(props: PercentLinearProgressProps) {
    let display = null;
    if (props.cover != undefined) {
        display = props.cover;
    } else if (props.prompt) {
        display = `${props.prompt}${props.prompt && ':'} ${props.progress} / ${props.total}`;
    } else {
        display = `${props.progress} / ${props.total}`;
    }
    return (
        <Typography component={'div'}>
            {display}
            <LinearProgress
                color="inherit"
                variant="determinate"
                value={(props.progress / props.total) * 100}
                {...props}
            />
        </Typography>
    );
}
