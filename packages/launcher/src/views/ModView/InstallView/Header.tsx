import { alpha, Toolbar } from '@mui/material';
import { InstallFromLocalForm } from './InstallFromLocalForm';

export function Header() {
    return (
        <Toolbar
            sx={{
                borderBottom: ({ palette }) => `1px solid ${alpha(palette.divider, 0.12)}`
            }}
        >
            <InstallFromLocalForm />
        </Toolbar>
    );
}
