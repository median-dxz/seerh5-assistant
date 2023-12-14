import { Stack, styled } from '@mui/material';

export const StyledRow = styled(Stack)`
    flex-direction: row;
    align-items: center;
    justify-content: start;
    width: 100%;

    & > *:not(:first-child) {
        margin-left: 1em;
    }
`;
