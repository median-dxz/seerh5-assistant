import { theme } from '@/style';
import { SpeedDial as MuiSpeedDial } from '@mui/material';
import { styled } from '@mui/system';

const { palette } = theme;

export const SeaQuickAccess = styled(MuiSpeedDial)`
    & .MuiSpeedDial-actions {
        margin: 0;
        padding: 0;
    }
    & .MuiSpeedDial-actions .MuiSpeedDialAction-fab,
    & .MuiSpeedDial-fab {
        border-radius: 0;
        box-shadow: none;
        background: none;
        transition: all 0.2s ease-in-out !important;
        color: ${palette.secondary.main};
        filter: drop-shadow(0 0 4px ${palette.secondary.main});
        &:hover {
            color: ${palette.primary.main};
            background: none;
        }
        &:active {
            padding-top: 4px;
            box-shadow: none;
        }
    }
    &::after {
        content: ' ';
        position: absolute;
        top: 0;
        left: 0;
        width: 0;
        border-top: 1px solid ${palette.primary.main};
        box-shadow: 0 0 4px ${palette.primary.main};
        transition: ${theme.transitions.create(['width'])};
    }

    &::before {
        content: ' ';
        position: absolute;
        bottom: 0;
        right: 0;
        width: 0;
        border-bottom: 1px solid ${palette.primary.main};
        box-shadow: 0 0 4px ${palette.primary.main};
        transition: ${theme.transitions.create(['width'])};
    }

    &:hover::before,
    &:hover::after {
        width: 100%;
    }
` as typeof MuiSpeedDial;
