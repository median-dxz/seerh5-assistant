import { Grid, useMediaQuery, useTheme } from '@mui/material';
import { Sidebar } from './Sidebar';
import { TaskStateList } from './TaskStateList';

const sidebarHeight = '192px';

export function TaskStateView() {
    const theme = useTheme();
    const matchMd = useMediaQuery(theme.breakpoints.up('md'));

    return (
        <Grid container direction="row-reverse" sx={{ pt: 3 }}>
            <Grid
                item
                container
                xs={12}
                md={4}
                sx={{
                    mb: 3,
                    pr: matchMd ? 0 : 1,
                    pl: matchMd ? 2 : 0
                }}
            >
                <Sidebar height={sidebarHeight} />
            </Grid>
            <Grid item xs={12} md={8}>
                <TaskStateList
                    disablePadding
                    sx={{
                        width: '100%',
                        // 3(spacing) * 2(top + bottom) * 4px(unit gap)
                        maxHeight: matchMd
                            ? 'calc(100vh - 3 * 2 * 4px)'
                            : `calc(100vh - 3 * 3 * 4px - ${sidebarHeight})`,
                        overflow: 'auto',
                        pr: '2px',
                        '& > *:not(:first-child)': { mt: 2 }
                    }}
                />
            </Grid>
        </Grid>
    );
}
