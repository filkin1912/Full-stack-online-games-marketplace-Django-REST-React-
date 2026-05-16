import { requestFactory } from "./requester";
import { API_BASE_URL } from "../config/api";

const baseUrl = `${API_BASE_URL}/api/games`;

export const boughtGamesServiceFactory = (token) => {
    const request = requestFactory(token);

    const getAll = async () => {
        // ✅ Correct endpoint for bought games
        return await request.get(`${baseUrl}/bought-games/`);
    };

    const buy = async (gameId) => {
        // ✅ Correct endpoint for buying a game
        return await request.post(`${baseUrl}/${gameId}/buy/`, {});
    };

    return {
        getAll,
        buy,
    };
};
