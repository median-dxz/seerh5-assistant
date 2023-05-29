export const useRfcData = () => {
    return fetch('/api?req=data').then((r) => r.json());
};
