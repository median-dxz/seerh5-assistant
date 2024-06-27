import type { HtmlTagDescriptor, PluginOption } from 'vite';

type ExternalURLs = string[];

export default function externalURL(urls: ExternalURLs) {
    return {
        name: 'external-url',
        transformIndexHtml: {
            handler(html) {
                const tags: HtmlTagDescriptor[] = urls.map((url) => ({
                    tag: 'script',
                    attrs: {
                        src: url,
                        defer: true
                    },
                    injectTo: 'body'
                }));
                return { html, tags };
            }
        }
    } as PluginOption;
}
