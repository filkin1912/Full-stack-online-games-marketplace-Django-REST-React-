import {createContext, useContext, useEffect, useState, useMemo} from "react";
import {boughtGamesServiceFactory} from "../services/boughtGameService";
import {AuthContext} from "./AuthContext";
import {useNavigate} from "react-router-dom";

export const BoughtGamesContext = createContext();

export const BoughtGamesProvider = ({children}) => {
    const {token, userId, money, deductMoney} = useContext(AuthContext);
    const navigate = useNavigate();

    const [boughtGames, setBoughtGames] = useState(() => {
        const stored = localStorage.getItem("boughtGames");
        return stored ? JSON.parse(stored) : [];
    });

    const boughtGamesService = useMemo(() => {
        return boughtGamesServiceFactory(token);
    }, [token]);

    useEffect(() => {
        localStorage.setItem("boughtGames", JSON.stringify(boughtGames));
    }, [boughtGames]);

    useEffect(() => {
        if (!token) return;

        boughtGamesService
            .getAll()
            .then((result) => {
                if (Array.isArray(result)) {
                    setBoughtGames(result);
                }
            })
            .catch((err) => console.error("Error fetching bought games:", err));
    }, [token, boughtGamesService]);

    // ⭐ BUY GAME WITH ALL CHECKS
    const buyGame = async (game) => {
        // 1. Prevent buying your own game
        if (String(game.user) === String(userId)) {
            alert("You cannot buy your own game");
            return;
        }

        // 2. Prevent duplicates
        if (boughtGames.some((g) => g.id === game.id)) {
            alert("You already bought this game");
            return;
        }

        // 3. Check money
        if (money < game.price) {
            alert("Not enough money to buy this game");
            return;
        }

        try {
            // 4. Backend purchase
            const newBoughtGame = await boughtGamesService.buy(game.id);

            // 5. Deduct money
            deductMoney(game.price);

            // 6. Save locally
            setBoughtGames((prev) => {
                const updated = [...prev, newBoughtGame];
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
    };

    return (
        <BoughtGamesContext.Provider value={contextValues}>
            {children}
        </BoughtGamesContext.Provider>
    );
};

export const useBoughtGamesContext = () => useContext(BoughtGamesContext);
