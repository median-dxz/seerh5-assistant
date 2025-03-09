import { alpha, lighten, SpeedDial as MuiSpeedDial, styled } from '@mui/material';

export const SeaQuickAccess = styled(MuiSpeedDial)`
    border-radius: ${({ theme: { shape } }) => shape.borderRadius}px;
    background-color: ${({ theme: { palette } }) => alpha(palette.extendedBackground.emphasize, 0.6)};
    backdrop-filter: blur(4px);

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
        color: ${({ theme: { palette } }) => palette.primary.main};
        &:hover {
            color: ${({ theme: { palette } }) => lighten(palette.primary.main, 0.4)};
            filter: drop-shadow(0 0 4px ${({ theme: { palette } }) => palette.primary.main});
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
        border-top: 1px solid ${({ theme: { palette } }) => palette.primary.main};
        box-shadow: 0 0 4px ${({ theme: { palette } }) => palette.primary.main};
        transition: ${({ theme: { transitions } }) => transitions.create(['width'])};
    }

    &::before {
        content: ' ';
        position: absolute;
        bottom: 0;
        right: 0;
        width: 0;
        border-bottom: 1px solid ${({ theme: { palette } }) => palette.primary.main};
        box-shadow: 0 0 4px ${({ theme: { palette } }) => palette.primary.main};
        transition: ${({ theme: { transitions } }) => transitions.create(['width'])};
    }

    &:hover::before,
    &:hover::after {
        width: 100%;
    }
` as typeof MuiSpeedDial;
