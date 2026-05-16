import { requestFactory } from "./requester";
import { API_BASE_URL } from "../config/api";

const authBase = `${API_BASE_URL}/api/auth`;
const accountsBase = `${API_BASE_URL}/api/accounts`;

export const authServiceFactory = (token) => {
    const request = requestFactory(token);

    return {
        login: (data) => request.post(`${authBase}/token/`, data),

        register: async (data) => {
            try {
                return await request.post(`${accountsBase}/signup/`, data);
            } catch (err) {
                // ⭐ Forward backend errors to AuthContext
                throw err;
            }
        },

        refresh: (data) => request.post(`${authBase}/token/refresh/`, data),
        verify: (data) => request.post(`${authBase}/token/verify/`, data),
        details: () => request.get(`${accountsBase}/me/`),
    };
};
