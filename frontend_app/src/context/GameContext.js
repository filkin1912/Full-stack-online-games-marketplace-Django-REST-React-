import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import {gameServiceFactory} from "../services/gameService";
import {AuthContext} from "./AuthContext";

export const GameContext = createContext();

export const GameProvider = ({children}) => {
    const {token, incrementGamesCount} = useContext(AuthContext) || {};

    const [games, setGames] = useState([]);
    const [filteredGames, setFilteredGames] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(12);
    const [sort, setSort] = useState("newest");

    const gameService = useMemo(() => gameServiceFactory(token), [token]);

    // Load games
    const refreshGames = async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await gameService.getAll();
            const list = Array.isArray(result)
                ? result
                : result?.results || [];

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

    // Create game
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

    // -----------------------------
    // FIXED SEARCH — PAGE RESET FIRST
    // -----------------------------
    const handleSearch = (term) => {
        const normalized = term.trim();

        // 🔥 Reset page BEFORE updating searchTerm
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
        resetPagination,
    };

    return (
        <GameContext.Provider value={contextValue}>
            {children}
        </GameContext.Provider>
    );
};

export const useGameContext = () => useContext(GameContext);
