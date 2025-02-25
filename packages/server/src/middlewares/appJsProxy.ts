import type { FastifyPluginCallback, RouteOptions } from 'fastify';

export const createAppJsProxy: FastifyPluginCallback = (fastify, _opts, done) => {
    const options: RouteOptions = {
        method: 'GET',
        url: '/api/js/:domain/*',
        handler: async function (request, reply) {
            const { domain, '*': path } = request.params as { '*': string; domain: string };
            const url = new URL(request.originalUrl, `${request.protocol}:\\${request.hostname}`);
            url.protocol = 'http';
            url.host = domain;
            url.port = '';
            url.pathname = path;
            request.headers.host = domain;
            request.headers.referer = 'http://seerh5.61.com/';

            async function fetcher(url: URL, modifier: (script: string) => string) {
                // console.log(`[Proxy]: --> ${url}`);
                return fetch(url, {
                    headers: request.headers as RequestInit['headers'],
                    referrer: 'http://seerh5.61.com/'
                })
                    .then(async (r) => {
                        // 设置响应头
                        void reply.status(r.status);
                        for (const [header, value] of Object.entries(r.headers)) {
                            void reply.header(header, value);
                        }
                        void reply.header('cache-control', 'no-store, no-cache');
                        void reply.removeHeader('content-encoding');
                        return r.text();
                    })
                    .then((script) => {
                        script = modifier(script);
                        script = `//@ sourceURL=${url.toString()}\n${script}`;
                        void reply.send(script);
                    });
            }

            void reply.type('application/javascript');

            switch (domain) {
                case 'seerh5.61.com':
                    url.search = new URLSearchParams({ t: Date.now().toString() }).toString();
                    void fetcher(url, (script) => {
                        const matcher = /eval([^)].*)/;
                        for (let mr = matcher.exec(script); mr; mr = matcher.exec(script)) {
                            script = eval(mr[1]) as string;
                        }
                        return script
                            .replace(`= window["wwwroot"] || "";`, `= '/seerh5.61.com/';`) // 替换wwwroot
                            .replace(/loadSingleScript\("https:\/\/hm\.baidu\.com\/hm\.js\?[a-z0-9].*"\);/, '') // 删除百度统计
                            .replace(
                                `web_sdk_js_url`,
                                `web_sdk_js_url.replace('https://opensdk.61.com/', 'api/js/opensdk.61.com/')`
                            ); // 代理sdk
                    });
                    break;
                case 'opensdk.61.com':
                    url.search = new URLSearchParams({ v: '1' }).toString();
                    void fetcher(url, (script) =>
                        script
                            .replace(
                                `(n?"https:":window.location.protocol)+u.b`,
                                `(window.location.origin+u.b.slice(1,u.b.length-1))`
                            )
                            .replace(`t&&t[0]===i.a`, `((t && t[0] === i.a) || (i.a === 'localhost'))`)
                            .replace(`//support-res.61.com`, `api/js/support-res.61.com`)
                    );
                    break;
                case 'support-res.61.com':
                    url.search = new URLSearchParams({ v: '5' }).toString();
                    void fetcher(url, (script) => {
                        const matcher = /eval([^)].*)/;
                        for (let mr = matcher.exec(script); mr; mr = matcher.exec(script)) {
                            script = eval(mr[1]) as string;
                        }
                        return script
                            .replaceAll(/document.referrer/g, `'http://seerh5.61.com/'`)
                            .replaceAll(/document.location.href/g, `'http://seerh5.61.com/'`);
                    });
                    break;
                default:
                    void reply.send('');
                    break;
            }
            await reply;
        }
    };
    fastify.route(options);
    done();
};
