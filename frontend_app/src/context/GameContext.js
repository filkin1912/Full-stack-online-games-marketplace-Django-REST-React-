import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { gameServiceFactory } from "../services/gameService";
import { AuthContext } from "./AuthContext";

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
    const { token, incrementGamesCount } = useContext(AuthContext) || {};
    const navigate = useNavigate();

    const [games, setGames] = useState([]);
    const [filteredGames, setFilteredGames] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(12);

    // ⭐ Sorting state
    const [sort, setSort] = useState("newest");

    const gameService = useMemo(() => gameServiceFactory(token), [token]);

    // ⭐ Sorting logic
    const sortGames = (list, sortType) => {
        if (!Array.isArray(list)) return [];

        const sorted = [...list];

        switch (sortType) {
            case "newest":
                sorted.sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                );
                break;

            case "oldest":
                sorted.sort(
                    (a, b) => new Date(a.created_at) - new Date(b.created_at)
                );
                break;

            case "title-asc":
                sorted.sort((a, b) =>
                    a.title.localeCompare(b.title, "en", { sensitivity: "base" })
                );
                break;

            case "title-desc":
                sorted.sort((a, b) =>
                    b.title.localeCompare(a.title, "en", { sensitivity: "base" })
                );
                break;

            default:
                break;
        }

        return sorted;
    };

    // ⭐ Load games from backend
    const refreshGames = async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await gameService.getAll();
            const list = Array.isArray(result) ? result : result?.results || [];

            // ⭐ Apply sorting
            const sorted = sortGames(list, sort);

            setGames(sorted);

            // Reset filtered list if search is empty
            if (!searchTerm) {
                setFilteredGames([]);
            }
        } catch (err) {
            setError(err?.message || "Failed to load games");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshGames();
    }, [gameService, sort]);

    // ⭐ Create a new game
    const onCreateGameSubmit = async (formData) => {
        try {
            const createdGame = await gameService.create(formData);

            // Add new game and re-sort
            setGames((prev) => sortGames([createdGame, ...prev], sort));

            incrementGamesCount();
            return createdGame;
        } catch (err) {
            throw err;
        }
    };

    // ⭐ Edit an existing game
    const onGameEditSubmit = async (gameId, formData) => {
        try {
            const updatedGame = await gameService.edit(gameId, formData);

            setGames((prev) =>
                sortGames(
                    prev.map((g) =>
                        Number(g.id) === Number(gameId)
                            ? { ...g, ...updatedGame }
                            : g
                    ),
                    sort
                )
            );

            await refreshGames();
            return updatedGame;
        } catch (err) {
            throw err;
        }
    };

    // ⭐ Delete a game
    const onGameDeleteSubmit = async (gameId) => {
        try {
            await gameService.remove(gameId);
            await refreshGames();
            navigate("/");
        } catch (err) {
            console.error("Failed to delete game:", err);
        }
    };

    // ⭐ Search games
    const handleSearch = (term) => {
        const normalized = term.trim();
        setPage(1);
        setSearchTerm(normalized);

        if (!normalized) {
            setFilteredGames([]);
            return;
        }

        const filtered = games.filter((game) =>
            game.title?.toLowerCase().includes(normalized.toLowerCase())
        );

        setFilteredGames(filtered);
    };

    const resetPagination = () => {
        setPerPage(12);
        setPage(1);
    };

    // ⭐ Exposed context
    const contextValue = {
        games,
        filteredGames,
        searchTerm,
        loading,
        error,

        handleSearch,
        refreshGames,

        page,
        setPage,
        perPage,
        setPerPage,

        sort,
        setSort,

        onCreateGameSubmit,
        onGameEditSubmit,
        onGameDeleteSubmit,

        resetPagination,
    };

    return (
        <GameContext.Provider value={contextValue}>
            {children}
        </GameContext.Provider>
    );
};

export const useGameContext = () => useContext(GameContext);
