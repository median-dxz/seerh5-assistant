import { ButtonUnstyledProps } from '@mui/base';
import { ElectricBolt } from '@mui/icons-material';
import { styled } from '@mui/system';
import React from 'react';
import { HexagonalButton } from './HexagonalButton';

const LocatedButton: typeof HexagonalButton = styled(HexagonalButton)`
    top: 10vh;
    left: 6vw;
    position: absolute;
    z-index: 3;
`;

export function MainButton(props: ButtonUnstyledProps) {
    return (
        <LocatedButton {...props} baseSize={36}>
            <ElectricBolt />
        </LocatedButton>
    );
}
