import React from 'react';

import ElectricBolt from '@mui/icons-material/ElectricBolt';

import { HexagonalButton } from '@/components/styled/HexagonalButton';
import { useMainState } from '@/context/useMainState';

export function MainButton() {
    const { setOpen } = useMainState();
    return (
        <HexagonalButton
            baseSize={32}
            sx={{ top: '10vh', left: '6vw', position: 'absolute', zIndex: (theme) => theme.zIndex.appBar }}
            onClick={() => {
                setOpen((prev) => !prev);
            }}
        >
            <ElectricBolt />
        </HexagonalButton>
    );
}
