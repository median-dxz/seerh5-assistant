export function getItemIcon(id: number) {
    const url = ClientConfig.getItemIcon(id);
    const resUrl = RES.getVirtualUrl(url);
    return resUrl;
}

export function getPetHeadIcon(id: number) {
    const url = ClientConfig.getPetHeadPath(id);
    const resUrl = RES.getVirtualUrl(url);
    return resUrl;
}
