import { Tab as MuiTab, alpha, styled } from '@mui/material';

const StyledTab = styled(MuiTab)`
    font-size: 16px;
    transition: ${({ theme }) => theme.transitions.create(['background-color'])};
    cursor: pointer;
    margin-block: 4px;
    &:hover {
        background-color: ${({ theme }) => alpha(theme.palette.secondary.main, 0.12)};
        border: 1px solid ${({ theme }) => alpha(theme.palette.primary.main, 0.12)};
    }
    &:active {
        background-color: ${({ theme }) => alpha(theme.palette.secondary.main, 0.24)};
    }
` as typeof MuiTab;

export { StyledTab };

