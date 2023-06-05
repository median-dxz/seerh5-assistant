/// <reference lib="webworker" />

self.addEventListener('fetch', (/** @type {FetchEvent} */ event) => {
    const { request } = event;

    if (request.url.match(/opensdk.61.com\/v1\/js\/taomeesdk/)) {
        event.respondWith(fetch(`/api/taomeeSDK`));
        return;
    }

    if (request.url.match(/^http:\/\/account-co\.61\.com/)) {
        const url = request.url.replace(/^http:\/\/account-co\.61\.com/, `/api/login`);
        const headers = new Headers(request.headers);
        console.log('ACCOUNT: ', url);
        if (request.method !== 'POST') {
            event.respondWith(fetch(url, { headers }));
        } else {
            headers.delete('Content-Type');
            event.respondWith(
                request
                    .clone()
                    .formData()
                    .then((body) =>
                        fetch(url, {
                            body,
                            method: request.method,
                            headers,
                        })
                    )
            );
        }

        return;
    }
});
