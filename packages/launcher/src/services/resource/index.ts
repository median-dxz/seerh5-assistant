function item(id: number) {
    const url = ClientConfig.getItemIcon(id);
    const resUrl = RES.getVirtualUrl(url);
    return resUrl;
}

function petHead(id: number) {
    const url = ClientConfig.getPetHeadPath(id);
    const resUrl = RES.getVirtualUrl(url);
    return resUrl;
}

export const Icon = { item, petHead };
