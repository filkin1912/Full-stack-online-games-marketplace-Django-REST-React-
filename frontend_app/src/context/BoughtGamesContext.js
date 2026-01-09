import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { boughtGamesServiceFactory } from "../services/boughtGameService";
import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";

export const BoughtGamesContext = createContext();

export const BoughtGamesProvider = ({ children }) => {
    const { token, userId, money, deductMoney } = useContext(AuthContext);
    const navigate = useNavigate();

    const [boughtGames, setBoughtGames] = useState(() => {
        const stored = localStorage.getItem("boughtGames");
        return stored ? JSON.parse(stored) : [];
    });

    const boughtGamesService = useMemo(() => {
        return boughtGamesServiceFactory(token);
    }, [token]);

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem("boughtGames", JSON.stringify(boughtGames));
    }, [boughtGames]);

    // Initial fetch on login/token change
    useEffect(() => {
        if (!token) return;
        fetchBoughtGames();
    }, [token, boughtGamesService]);

    // =====================================================
    // Fetch bought games from backend (needed for Header.js)
    // =====================================================
    const fetchBoughtGames = async () => {
        try {
            const result = await boughtGamesService.getAll();

            const extractedGames = (result?.results || [])
                .map((record) => record.game || record)
                .filter(Boolean);

            setBoughtGames(extractedGames);
        } catch (err) {
            console.error("Error fetching bought games:", err);
        }
    };

    // =====================================================
    // Buy game
    // =====================================================
    const buyGame = async (game) => {
        if (String(game.user) === String(userId)) {
            alert("You cannot buy your own game");
            return;
        }

        if (boughtGames.some((g) => g.id === game.id)) {
            alert("You already bought this game");
            return;
        }

        if (money < game.price) {
            alert("Not enough money to buy this game");
            return;
        }

        try {
            const newBoughtGame = await boughtGamesService.buy(game.id);
            const gameData = newBoughtGame?.game || newBoughtGame;

            if (!gameData) throw new Error("Invalid game data returned");

            deductMoney(game.price);

            setBoughtGames((prev) => {
                const updated = [...prev, gameData];
                localStorage.setItem("boughtGames", JSON.stringify(updated));
                return updated;
            });

            alert("Game purchased successfully");
            navigate("/bought-games");
        } catch (err) {
            console.error("Error buying game:", err);
            alert("Error buying game");
        }
    };

    const contextValues = {
        boughtGames,
        buyGame,
        setBoughtGames,
        fetchBoughtGames, // 🔥 added for Header.js
    };

    return (
        <BoughtGamesContext.Provider value={contextValues}>
            {children}
        </BoughtGamesContext.Provider>
    );
};

export const useBoughtGamesContext = () => useContext(BoughtGamesContext);
