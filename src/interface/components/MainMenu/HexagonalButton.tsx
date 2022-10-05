import ButtonUnstyled, { ButtonUnstyledProps } from '@mui/base/ButtonUnstyled';
import { styled } from '@mui/system';
import * as React from 'react';

const points = `0 -84,
  ${42 * Math.sqrt(3)} -42,
  ${42 * Math.sqrt(3)} 42,
  0 84,
  -${42 * Math.sqrt(3)} 42,
  -${42 * Math.sqrt(3)} -42`;

const ButtonRoot = React.forwardRef(function ButtonRoot(
    props: React.PropsWithChildren<{}>,
    ref: React.ForwardedRef<any>
) {
    const { children, ...other } = props;

    return (
        <svg width="148" height="148" viewBox="0 0 182 182" {...other} ref={ref}>
            <g transform="translate(91,91)">
                <polygon points={points} className="bg" />
                <polygon
                    points={`0 -90,
          ${46 * Math.sqrt(3)} -45,
          ${46 * Math.sqrt(3)} 45,
          0 90,
          -${45 * Math.sqrt(3)} 45,
          -${45 * Math.sqrt(3)} -45`}
                    id="dash"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
                {/* <rect
          x="-84"
          y="-84"
          width="168"
          height="168"
          className="dash-rotate"
        /> */}
                <foreignObject x="-91" y="-91" width="182" height="182">
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
        filter: drop-shadow(0 0 12px rgba(211 244 254 / 75%));
        transition: all 0.5s;
    }
    & #dash {
        stroke-dasharray: 44% 6%;
        stroke-dashoffset: 0%;
        animation: 4s linear infinite line-rotate;
        filter: drop-shadow(0 0 6px rgba(21 24 24 / 100%));
    }
    & * {
        color: rgba(211 244 254);
    }
    @keyframes line-rotate {
        0% {
            stroke-dashoffset: 30%;
            stroke: #ffffff8f;
        }

        50% {
            stroke-dashoffset: 80%;
            stroke: #ffffff;
        }

        100% {
            stroke-dashoffset: 130%;
            stroke: #ffffff8f;
        }
    }
    &:hover .bg {
        filter: drop-shadow(0 0 16px rgba(20 24 24 / 100%));
        stroke: rgba(211 244 254 / 100%);
    }
`;

export const SvgButton = React.forwardRef(function SvgButton(props: ButtonUnstyledProps, ref: React.ForwardedRef<any>) {
    return <ButtonUnstyled {...props} component={CustomButtonRoot} ref={ref} />;
});
