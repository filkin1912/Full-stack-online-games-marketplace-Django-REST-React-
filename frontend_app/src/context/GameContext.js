import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import {useNavigate} from "react-router-dom";
import {gameServiceFactory} from "../services/gameService";
import {AuthContext} from "./AuthContext";

export const GameContext = createContext();

export const GameProvider = ({children}) => {
    const {token, incrementGamesCount} = useContext(AuthContext) || {};
    const navigate = useNavigate();

    const [games, setGames] = useState([]);
    const [filteredGames, setFilteredGames] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(12);
    const [sort, setSort] = useState("newest");

    const gameService = useMemo(() => gameServiceFactory(token), [token]);

    // ✅ Load games from backend
    const refreshGames = async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await gameService.getAll();
            const list = Array.isArray(result) ? result : result?.results || [];

            setGames(list);

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
    }, [gameService]);

    // ✅ Create a new game
    const onCreateGameSubmit = async (formData) => {
        try {
            const createdGame = await gameService.create(formData);
            setGames((prev) => [createdGame, ...prev]);
            incrementGamesCount();
            return createdGame;
        } catch (err) {
            throw err;
        }
    };

    // ✅ Edit an existing game
    const onGameEditSubmit = async (gameId, formData) => {
        try {
            const updatedGame = await gameService.edit(gameId, formData);

            // Update the game in local state
            setGames((prev) =>
                prev.map((g) =>
                    Number(g.id) === Number(gameId)
                        ? {...g, ...updatedGame}
                        : g
                )
            );

            // Refresh full list from backend to avoid stale data
            await refreshGames();

            return updatedGame;
        } catch (err) {
            throw err;
        }
    };


    // ✅ Delete a game by ID
    const onGameDeleteSubmit = async (gameId) => {
        try {
            await gameService.remove(gameId);
            await refreshGames();
            navigate("/");
        } catch (err) {
            console.error("Failed to delete game:", err);
        }
    };

    // ✅ Search games by title
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

    // ✅ Context value exposed to consumers
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
        onGameEditSubmit, // ✅ Now available to EditGame.js
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
