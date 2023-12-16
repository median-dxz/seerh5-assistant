import { styled } from '@mui/material';
import NanoClamp from 'nanoclamp';

export const ClampText: typeof NanoClamp = styled(NanoClamp)(({ theme }) => ({
    ...theme.typography.button,
    fontSize: 12,
    margin: 0,
})) as typeof NanoClamp;
