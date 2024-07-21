import { theme } from '@/style';
import type { ButtonBaseProps } from '@mui/material';
import { alpha, ButtonBase, styled } from '@mui/material';
import { forwardRef, type ForwardedRef, type PropsWithChildren } from 'react';

const HexagonalButtonRoot = forwardRef(function (
    props: PropsWithChildren<React.SVGProps<SVGSVGElement>> & { baseSize: number },
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

const { palette, transitions } = theme;

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
    transition: ${transitions.create(['all'], { duration: transitions.duration.shortest })};

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
        transition: ${transitions.create(['all'])};
    }

    & .bg {
        stroke: ${palette.primary.main};
        stroke-width: 3px;
        stroke-linecap: round;
        fill: transparent;
        animation: breathe 2s linear infinite;
    }

    &:hover .content {
        filter: drop-shadow(0 0 4px ${alpha(palette.primary.main, 1)});
    }

    @keyframes breathe {
        from {
            opacity: 1;
            transform: scale(1);
            filter: none;
        }

        50% {
            opacity: 0.85;
            transform: scale(1.02);
            filter: drop-shadow(0 0 4px ${alpha(palette.background.default, 1)});
        }
    }
`;

export const HexagonalButton = forwardRef(function (
    props: ButtonBaseProps & { baseSize: number },
    ref: ForwardedRef<HTMLButtonElement>
) {
    const { baseSize, children, ...other } = props;
    return (
        <ButtonBase {...other} ref={ref} disableRipple>
            <StyledButtonRoot baseSize={baseSize}>{children}</StyledButtonRoot>
        </ButtonBase>
    );
});
