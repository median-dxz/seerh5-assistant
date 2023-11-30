import { SpeedDial as MuiSpeedDial } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { styled } from '@mui/system';
import { saTheme } from '@sea-launcher/style';

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
        filter: drop-shadow(0 0 4px ${alpha(saTheme.palette.primary.main, 0.8)});
        &:hover {
            color: ${saTheme.palette.emphases.main};
            background: none;
        }
        &:active {
            padding-top: 4px;
        }
    }
    &::after {
        content: ' ';
        position: absolute;
        top: 0;
        left: 0;
        width: 0;
        border-top: 1px solid ${saTheme.palette.emphases.main};
        box-shadow: 0 0 4px ${saTheme.palette.emphases.main};
        transition: ${saTheme.transitions.create(['width'])};
    }

    &::before {
        content: ' ';
        position: absolute;
        bottom: 0;
        right: 0;
        width: 0;
        border-bottom: 1px solid ${saTheme.palette.emphases.main};
        box-shadow: 0 0 4px ${saTheme.palette.emphases.main};
        transition: ${saTheme.transitions.create(['width'])};
    }

    &:hover {
        &::before,
        &::after {
            width: 100%;
        }
    }
` as typeof MuiSpeedDial;
