import ButtonUnstyled from '@mui/base/Button';
import type { ButtonBaseProps } from '@mui/material';
import { styled } from '@mui/system';
import * as React from 'react';
import { ForwardedRef, forwardRef, PropsWithChildren } from 'react';

const ButtonRoot = forwardRef(function ButtonRoot(
    props: PropsWithChildren<{}> & { baseSize: number },
    ref: ForwardedRef<any>
) {
    const { children, baseSize, ...other } = props;
    const viewBoxSize = baseSize * 2 + 20;
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
                <polygon points={points(baseSize * 1.15)} id="dash" fill="none" strokeWidth="2" strokeLinecap="round" />
                <foreignObject x={-viewBoxSize / 2} y={-viewBoxSize / 2} width={viewBoxSize} height={viewBoxSize}>
                    <div className="content">{children}</div>
                </foreignObject>
            </g>
        </svg>
    );
});

const CustomButtonRoot = styled(ButtonRoot)`
    overflow: overlay;
    clip-path: polygon(
        calc(50% - 25% * 1.732 - 18%) calc(50% - 50% / 2),
        50% -18%,
        calc(100% - (50% - 25% * 1.732) + 18%) calc(50% - 50% / 2),
        calc(100% - (50% - 25% * 1.732) + 18%) calc(50% + 50% / 2),
        50% 118%,
        calc(50% - 25% * 1.732 - 18%) calc(50% + 50% / 2)
    );
    &:focus {
        outline: none;
    }
    &:hover {
        cursor: pointer;
    }

    & .content {
        user-select: none;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
    & .bg {
        stroke: rgba(211 244 254 / 50%);
        stroke-width: 2px;
        stroke-linecap: round;
        fill: rgba(10 54 115 / 75%);
        filter: drop-shadow(0 0 8px rgba(211 244 254 / 66%));
        transition: all 0.5s;
    }
    & #dash {
        stroke: #43d9fa;
        stroke-dasharray: calc(50% / 1.15 * 0.8) calc(50% / 1.15 * 0.2) calc(50% / 1.075 * 0.8) calc(50% / 1.075 * 0.2);
        animation: 4s linear infinite line-rotate;
        filter: drop-shadow(0 0 4px rgba(21 24 24 / 100%));
    }
    & * {
        color: rgba(211 244 254);
    }
    @keyframes line-rotate {
        0% {
            stroke-dashoffset: 0%;
            stroke: #ffffff8f;
        }

        25% {
            stroke-dashoffset: 25%;
            stroke: #43d9fa;
        }

        75% {
            stroke-dashoffset: 65%;
            stroke: #eef3bf;
        }

        100% {
            stroke-dashoffset: calc(50% / 1.15 + 50% / 1.075);
            stroke: #ffffff8f;
        }
    }

    &:hover .bg {
        filter: drop-shadow(0 0 8px rgba(20 24 24 / 66%));
        stroke: rgba(211 244 254 / 100%);
    }

    &:active .bg,
    &:active #dash {
        transform: scale(0.94);
        transition: transform 0.3s;
    }
`;

export const HexagonalButton = forwardRef(function (
    props: ButtonBaseProps & { baseSize: number },
    ref: ForwardedRef<any>
) {
    return <ButtonUnstyled {...props} slots={{ root: CustomButtonRoot }} ref={ref} />;
});
