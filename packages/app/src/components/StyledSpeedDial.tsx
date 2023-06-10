import { SpeedDial } from '@mui/material';
import { styled } from '@mui/system';
import { mainTheme } from '@sa-app/style';

export const StyledSpeedDial: typeof SpeedDial = styled(SpeedDial)`
    & .MuiSpeedDial-fab {
        transition: all 0.3s !important;
    }
    & .MuiSpeedDial-fab:hover {
        background-color: rgb(103 225 255);
    }
    & .MuiSpeedDial-actions .MuiFab-root {
        border: none;
        background: none;
        box-shadow: none;
        border-radius: 0;
        &::after {
            content: ' ';
            position: absolute;
            top: 0;
            left: 0;
            width: 0;
            border-top: 1px solid ${mainTheme.palette.secondary.main};
            box-shadow: 0 0 4px ${mainTheme.palette.secondary.main};
            transition: width 0.3s;
        }

        &::before {
            content: ' ';
            position: absolute;
            bottom: 0;
            right: 0;
            width: 0;
            border-bottom: 1px solid ${mainTheme.palette.secondary.main};
            box-shadow: 0 0 4px ${mainTheme.palette.secondary.main};
            transition: width 0.3s;
        }

        :hover {
            &::before,
            &::after {
                width: 100%;
            }
        }
    }
`;
