/** @type { import('@koa/router').Middleware } */
export const saAppJsProxy = async (ctx, next) => {
    const { 0: path, domain } = ctx.params;

    const url = new URL(ctx.URL);
    url.protocol = 'https';
    url.host = domain;
    url.port = '';
    url.pathname = path;

    delete ctx.headers.host;
    ctx.response.type = 'application/javascript';

    switch (domain) {
        case 'seerh5.61.com':
            url.search = new URLSearchParams({ t: Date.now().toString() }).toString();
            await fetcher(ctx, url, (script) => {
                const matcher = /eval([^)].*)/;
                for (let mr = script.match(matcher); mr; mr = script.match(matcher)) {
                    script = eval(mr[1]);
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
            await fetcher(ctx, url, (script) => {
                return script
                    .replace(
                        'window.location.protocol+"//account-co.61.com/',
                        `window.location.href+"account-co.61.com/`
                    )
                    .replace(`t&&t[0]===i.a`, `((t && t[0] === i.a) || (i.a === 'localhost'))`)
                    .replace(`//support-res.61.com`, `api/js/support-res.61.com`);
            });
            break;
        case 'support-res.61.com':
            url.search = new URLSearchParams({ v: '5' }).toString();
            await fetcher(ctx, url, (script) => {
                const matcher = /eval([^)].*)/;
                for (let mr = script.match(matcher); mr; mr = script.match(matcher)) {
                    script = eval(mr[1]);
                }
                return script
                    .replaceAll(/document.referrer/g, `'http://seerh5.61.com/'`)
                    .replaceAll(/document.location.href/g, `'http://seerh5.61.com/'`);
            });
            break;
        default:
            return next();
    }
};

/**
 * @param { import("@koa/router").RouterContext } ctx
 * @param { URL } url
 * @param { (script: string) => string } modifier
 */
async function fetcher(ctx, url, modifier) {
    // console.log(`[Proxy]: --> ${url}`);
    return fetch(url, {
        // @ts-ignore
        headers: ctx.headers,
        referrer: 'http://seerh5.61.com/',
    })
        .then((r) => {
            // 设置响应头
            ctx.response.status = r.status;
            for (const [header, value] of r.headers.entries()) {
                ctx.set(header, value);
            }
            ctx.set('cache-control', 'no-store, no-cache');
            ctx.remove('content-encoding');
            return r.text();
        })
        .then((script) => {
            script = modifier(script);
            script = `//@ sourceURL=${url}\n${script}`;
            ctx.body = script;
        });
}
