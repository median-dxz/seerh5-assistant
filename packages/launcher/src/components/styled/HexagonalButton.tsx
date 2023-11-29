import type { ButtonBaseProps } from '@mui/material';
import ButtonBase from '@mui/material/ButtonBase';
import { styled } from '@mui/system';
import { saTheme } from '@sea-launcher/style';
import * as React from 'react';
import { forwardRef, type ForwardedRef, type PropsWithChildren } from 'react';

const HexagonalButtonRoot = forwardRef(function (
    props: PropsWithChildren<object> & { baseSize: number },
    ref: ForwardedRef<SVGSVGElement>
) {
    const { children, baseSize, ...other } = props;
    const viewBoxSize = baseSize * 2 + 8;
    const points = (size: number) => `0 ${-size},
    ${(size / 2) * Math.sqrt(3)} ${-size / 2},
    ${(size / 2) * Math.sqrt(3)} ${size / 2},
    0 ${size},
    -${(size / 2) * Math.sqrt(3)} ${size / 2},
    -${(size / 2) * Math.sqrt(3)} ${-size / 2}`;

    return (
        <svg
            width={viewBoxSize}
            height={viewBoxSize}
            viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
            {...other}
            ref={ref}
        >
            <g transform={`translate(${viewBoxSize / 2}, ${viewBoxSize / 2})`}>
                <polygon points={points(baseSize)} className="bg" />
                <foreignObject x={-viewBoxSize / 2} y={-viewBoxSize / 2} width={viewBoxSize} height={viewBoxSize}>
                    <div className="content">{children}</div>
                </foreignObject>
            </g>
        </svg>
    );
});

const StyledButtonRoot = styled(HexagonalButtonRoot)`
    overflow: overlay;
    clip-path: polygon(
        calc(50% - 25% * 1.732 - 18%) calc(50% - 50% / 2),
        50% -18%,
        calc(100% - (50% - 25% * 1.732) + 18%) calc(50% - 50% / 2),
        calc(100% - (50% - 25% * 1.732) + 18%) calc(50% + 50% / 2),
        50% 118%,
        calc(50% - 25% * 1.732 - 18%) calc(50% + 50% / 2)
    );
    transition: ${saTheme.transitions.create(['all'], { duration: saTheme.transitions.duration.shortest })};

    &:focus {
        outline: none;
    }

    &:hover {
        cursor: pointer;
    }

    &:active {
        transform: translateY(4px);
    }

    & .content {
        user-select: none;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        transition: ${saTheme.transitions.create(['all'])};
    }

    & .bg {
        stroke: ${saTheme.palette.primary.main};
        stroke-width: 2px;
        stroke-linecap: round;
        fill: transparent;
        animation: breathe 2s linear infinite;
    }

    &:hover .content {
        filter: drop-shadow(0 0 4px ${saTheme.palette.emphases.main});
    }

    @keyframes breathe {
        from {
            opacity: 1;
            transform: scale(1);
            filter: none;
        }

        50% {
            opacity: 0.45;
            transform: scale(1.02);
            filter: drop-shadow(0 0 4px ${saTheme.palette.primary.main});
        }
    }
`;

export const HexagonalButton = forwardRef(function (
    props: ButtonBaseProps & { baseSize: number },
    ref: ForwardedRef<HTMLButtonElement>
) {
    return <ButtonBase {...props} component={StyledButtonRoot} ref={ref} disableRipple />;
});
