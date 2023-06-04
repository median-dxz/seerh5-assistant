export const requestSAApi = () => {
    return fetch('/api/data').then((r) => r.json());
};
