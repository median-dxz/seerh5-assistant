import { SvgIcon } from '@mui/material';
import type { SVGProps } from 'react';

export const Acute = (props: SVGProps<SVGSVGElement>) => (
    <SvgIcon fontSize="inherit">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" {...props}>
            <path
                fill="currentColor"
                d="M15 20q-3.35 0-5.675-2.325T7 12q0-3.325 2.325-5.663T15 4q3.325 0 5.663 2.338T23 12q0 3.35-2.337 5.675T15 20m0-2q2.5 0 4.25-1.75T21 12t-1.75-4.25T15 6t-4.25 1.75T9 12t1.75 4.25T15 18m1-6.4V9q0-.425-.288-.712T15 8t-.712.288T14 9v3.025q0 .2.088.388t.212.312L16.575 15q.3.3.713.3T18 15t.3-.712t-.3-.713zM3 9q-.425 0-.712-.288T2 8t.288-.712T3 7h2q.425 0 .713.288T6 8t-.288.713T5 9zm-1 4q-.425 0-.712-.288T1 12t.288-.712T2 11h3q.425 0 .713.288T6 12t-.288.713T5 13zm1 4q-.425 0-.712-.288T2 16t.288-.712T3 15h2q.425 0 .713.288T6 16t-.288.713T5 17zm12-5"
            ></path>
        </svg>
    </SvgIcon>
);
