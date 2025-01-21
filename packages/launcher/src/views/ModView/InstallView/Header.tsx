import { Row } from '@/components/Row';
import { alpha } from '@mui/material';
import { InstallFromLocalForm } from './InstallFromLocalForm';

export function Header() {
    return (
        <Row
            sx={{
                pb: 2,
                borderBottom: ({ palette }) => `1px solid ${alpha(palette.divider, 0.12)}`
            }}
            spacing={2}
        >
            <InstallFromLocalForm />
        </Row>
    );
}
