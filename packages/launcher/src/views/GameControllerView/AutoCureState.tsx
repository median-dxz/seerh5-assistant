import { Paper } from '@/components/styled/Paper';
import { Row } from '@/components/styled/Row';
import { QueryKey } from '@/constants';
import { CircularProgress, Switch, Typography } from '@mui/material';
import { SEAEventSource, Subscription, engine } from '@sea/core';
import type { ChangeEvent } from 'react';
import React from 'react';
import type { SWRSubscriptionOptions } from 'swr/subscription';
import useSWRSubscription from 'swr/subscription';

export function AutoCureState() {
    const { data: autoCure } = useSWRSubscription(
        QueryKey.multiValue.autoCure,
        (_, { next }: SWRSubscriptionOptions<boolean, Error>) => {
            const sub = new Subscription();
            sub.on(SEAEventSource.socket(42019, 'send'), (data) => {
                if (Array.isArray(data) && data.length === 2 && data[0] === 22439) {
                    const [_, autoCure] = data as [number, number];
                    next(null, autoCure === 1);
                }
            });

            void engine.autoCureState().then((autoCure) => {
                next(null, autoCure);
            });

            return () => {
                sub.dispose();
            };
        }
    );

    const handleToggleMode = (_: ChangeEvent, checked: boolean) => {
        void engine.toggleAutoCure(checked);
    };

    return (
        <Paper>
            <Row justifyContent="space-between">
                <Typography>自动治疗</Typography>
                {autoCure != undefined ? (
                    <Switch
                        checked={autoCure}
                        onChange={handleToggleMode}
                        inputProps={{ 'aria-label': 'switch auto cure state' }}
                    />
                ) : (
                    <CircularProgress />
                )}
            </Row>
        </Paper>
    );
}
