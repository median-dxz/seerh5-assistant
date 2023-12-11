import { Tab as MuiTab, alpha, styled } from '@mui/material';

const StyledTab = styled(MuiTab)`
    font-size: 16px;
    transition: ${({ theme }) => theme.transitions.create(['background-color'])};
    border-radius: ${({ theme }) => theme.shape.borderRadius}px;
    cursor: pointer;
    &:hover {
        background-color: ${({ theme }) => alpha(theme.palette.secondary.main, 0.12)};
        border: 1px solid ${({ theme }) => alpha(theme.palette.primary.main, 0.12)};
    }
    &:active {
        background-color: ${({ theme }) => alpha(theme.palette.secondary.main, 0.24)};
    }
` as typeof MuiTab;

export { StyledTab };

