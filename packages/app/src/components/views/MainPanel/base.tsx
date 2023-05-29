import {
    LinearProgress,
    LinearProgressProps,
    styled,
    Table,
    TableBody,
    TableHead,
    TableProps,
    TableRow,
    TableRowProps,
    Typography,
} from '@mui/material';
import React, { PropsWithChildren } from 'react';

export const PanelTableBodyRow = styled(TableRow)<TableRowProps>(() => ({
    '&:last-child td, &:last-child th': { border: 0 },
    transition: 'all 0.3s',
    '&:hover': {
        bgcolor: `rgba(231 247 67 / 26%)`,
    },
})) as typeof TableRow;

export function PanelTableBase(props: PropsWithChildren<{ heads: React.ReactNode } & TableProps>) {
    const { heads: title, children, ...tableProps } = props;
    return (
        <Table {...tableProps}>
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
