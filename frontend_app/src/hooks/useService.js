export const useService = (serviceFactory, token = null) => {
    const service = serviceFactory(token);
    return service;
};
