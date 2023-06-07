import ElectricBolt from '@mui/icons-material/ElectricBolt';
import type { ButtonBaseProps } from '@mui/material';
import { styled } from '@mui/system';
import { HexagonalButton } from '@sa-app/components/HexagonalButton';
import React from 'react';

const LocatedButton: typeof HexagonalButton = styled(HexagonalButton)`
    top: 10vh;
    left: 6vw;
    position: absolute;
    z-index: 3;
`;

export function MainButton(props: ButtonBaseProps) {
    return (
        <LocatedButton {...props} baseSize={36}>
            <ElectricBolt />
        </LocatedButton>
    );
}
