import { fastifyFormbody } from '@fastify/formbody';
import type { FastifyPluginCallback, RouteOptions } from 'fastify';

const ENDPOINTS = {
    gather: 'gather',
    opensdk: 'opensdk',
    login_gate: 'online_gate'
};

const modifiers = {
    opensdk: (script: string) =>
        script
            .replace(`(n?"https:":window.location.protocol)+u.b`, `(window.location.origin+u.b.slice(1,u.b.length-1))`)
            .replace(/t&&t\[0\]===([a-z]*\.[a-z]*)/, `((t && t[0] === $1) || (e?.data?.data?.login_type === "taomee"))`)
            .replace(`//support-res.61.com`, `api/taomee/support-res.61.com`)
            .replace(`path=/;domain="+this._domain`, 'path=/account-co.61.com"'),

    gather: (script: string) => {
        const matcher = /eval([^)].*)/;
        let result = script;
        for (let mr = matcher.exec(result); mr; mr = matcher.exec(result)) {
            result = eval(mr[1]) as string;
        }
        return result
            .replaceAll(/document.referrer/g, `''`)
            .replaceAll(/document.location.href/g, `'http://seerh5.61.com/'`)
            .replaceAll(/([a-zA-Z]+)\("tm-uuid",([a-zA-Z]+)\)/g, `$1("tm-uuid",$2,"/seerh5.61.com")`);
    }
};

const weightedRandom = (weights: number[], values: number[]) => {
    let acc = weights.reduce((tot, weight) => tot + weight, 0);
    if (weights.length < values.length && acc < 1) {
        const r = (1 - acc) / (values.length - weights.length);
        for (let i = weights.length; i < values.length; i++) {
            weights.push(r);
        }
    }
    const random = Math.random();
    acc = 0;
    for (let i = 0; i < weights.length; i++) {
        if (random >= acc && acc + weights[i] > random) {
            return values[i];
        }
        acc += weights[i];
    }
    return values[values.length - 1];
};

export const taomeeProxy: FastifyPluginCallback = (fastify, _opts, done) => {
    fastify.register(fastifyFormbody);

    const options: RouteOptions = {
        method: ['GET', 'POST'],
        url: '/api/taomee/:endpoint',
        handler: async function (request, reply) {
            const contentLength = Number(request.headers['content-length'] ?? 0);

            const fetchConfig = {
                headers: request.headers as RequestInit['headers'],
                referrer: 'http://seerh5.61.com/',
                body: contentLength > 0 ? (request.body as RequestInit['body']) : undefined,
                method: request.method
            };

            const { endpoint } = request.params as { endpoint: string };

            switch (endpoint) {
                case ENDPOINTS.opensdk:
                    {
                        const response = await fetch(
                            `https://opensdk.61.com/v1/js/taomeesdk.1.1.1.js?v=1`,
                            fetchConfig
                        );
                        const script = await response.text();
                        void reply.type('application/javascript').send(modifiers.opensdk(script));
                    }
                    break;
                case ENDPOINTS.gather:
                    {
                        const response = await fetch(`https://support-res.61.com/gather/gather.js?v=5`, fetchConfig);
                        const script = await response.text();
                        void reply.type('application/javascript').send(modifiers.gather(script));
                    }
                    break;
                case ENDPOINTS.login_gate:
                    {
                        // 加权构造服务器网关地址
                        const loginGate = `h5gy.61.com/ws/:300${weightedRandom([0.25, 0.25, 0.15, 0.15], [7, 8, 1, 2, 3, 4, 5, 6])}`;
                        const url = new URL(`https://seerh5login.61.com/online_gate?is_ssl=1`);
                        let sent = false;

                        reply.header('cache-control', 'no-store, no-cache');

                        // 请求服务器网关，重试三次
                        for (let i = 0; i < 3; i++) {
                            const response = await fetch(url, fetchConfig);
                            const text = await response.text();
                            if (response.status !== 404) {
                                void reply.type('text/plain').send(text);
                                sent = true;
                                break;
                            } else {
                                fastify.log.warn('[API][Taomee][login_gate] 404 response from server, retrying...');
                            }
                        }

                        // 如果三次都没有成功，直接返回构造的网关URL
                        if (!sent) {
                            fastify.log.warn(
                                `[API][Taomee][login_gate] Failed to get a valid response after 3 attempts\n` +
                                    `   use: ${loginGate} as login gate`
                            );
                            void reply.status(200).type('text/plain').send(loginGate);
                        }
                    }
                    break;
                default:
                    fastify.log.warn(`Unknown endpoint: ${endpoint}`);
                    void reply.status(500).send('Invalid endpoint');
                    break;
            }

            await reply;
        }
    };

    fastify.route(options);
    done();
};
