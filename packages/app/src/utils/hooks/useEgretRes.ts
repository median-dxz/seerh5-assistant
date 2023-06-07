export function useEgretImageRes(url: string) {
    const resUrl = RES.getVirtualUrl(url);
    return { src: resUrl };
}
