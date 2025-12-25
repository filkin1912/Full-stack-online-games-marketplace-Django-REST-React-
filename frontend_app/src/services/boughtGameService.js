import { requestFactory } from "./requester";

const baseUrl = `${process.env.REACT_APP_API_URL}/api/games`;


export const boughtGamesServiceFactory = (token) => {
    const request = requestFactory(token);

    const getAll = async () => {
        // GET /dashboard/  → returns list of bought games
        return await request.get(baseUrl + "/");
    };

    const buy = async (gameId) => {
        // POST /dashboard/<gameId>/buy/
        return await request.post(`${baseUrl}/${gameId}/buy/`, {});
    };

    return {
        getAll,
        buy,
    };
};
