import { Tab as MuiTab, alpha, styled } from '@mui/material';

const StyledTab = styled(MuiTab)`
    font-size: 16px;
    transition: ${({ theme: { transitions } }) => transitions.create(['background-color'])};
    border-radius: ${({ theme: { shape } }) => shape.borderRadius}px;
    border: 1px solid transparent;
    min-height: auto; // 覆盖原来的样式
    justify-content: start;
    &:hover {
        background-color: ${({ theme: { palette } }) => alpha(palette.primary.main, 0.12)};
    }
    &:active {
        background-color: ${({ theme: { palette } }) => alpha(palette.primary.main, 0.24)};
    }
` as typeof MuiTab;

export { StyledTab };

