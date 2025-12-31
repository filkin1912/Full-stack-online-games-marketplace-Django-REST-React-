import {requestFactory} from "./requester";
import {boughtGamesServiceFactory} from "./boughtGameService";

const baseUrl = `${process.env.REACT_APP_API_URL}/api/games/`;

export const gameServiceFactory = (token) => {
    const request = requestFactory(token);
    const boughtGamesService = boughtGamesServiceFactory(token);

    // ✅ Fetch ALL games by walking through paginated pages
    const getAll = async ({signal} = {}) => {
        let page = 1;
        let allGames = [];
        let hasNext = true;

        while (hasNext) {
            const url = `${baseUrl}?page=${page}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                signal,
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.message || "Failed to load games");
            }

            const data = await response.json();

            const results = Array.isArray(data)
                ? data
                : data.results || [];

            allGames = allGames.concat(results);

            // DRF-style pagination: has `next` when more pages exist
            if (data.next) {
                page += 1;
            } else {
                hasNext = false;
            }
        }

        return allGames;
    };

    const getOne = async (gameId) => request.get(`${baseUrl}${gameId}/`);

    // ✅ Create game with FormData
    const create = async (formData) => request.postForm(baseUrl, formData);

    const edit = async (gameId, data) => request.put(`${baseUrl}${gameId}/`, data);
    const deleteGame = async (gameId) => request.delete(`${baseUrl}${gameId}/`);
    const buyGame = async (gameId) => boughtGamesService.buy(gameId);

    return {
        getAll,
        getOne,
        create,
        edit,
        remove: deleteGame,
        buyGame,
    };

};
