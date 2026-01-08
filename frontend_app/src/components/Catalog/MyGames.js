import { useContext, useMemo } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useGameContext } from "../../context/GameContext";
import { GameCard } from "./Game/Game";
import { CatalogLayout } from "../Shared/CatalogLayout";

export const MyGames = () => {
    const { userId, isAuthenticated } = useContext(AuthContext);
    const {
        games,
        filteredGames,
        searchTerm,
        sort,
        page,
        perPage,
    } = useGameContext();

    const hasSearch = searchTerm.trim().length > 0;
    const baseList = hasSearch ? filteredGames : games;

    const ownedGames = useMemo(() => {
        return baseList.filter((game) => String(game.user) === String(userId));
    }, [baseList, userId]);

    const sortedOwned = useMemo(() => {
        const sorted = [...ownedGames];
        if (sort === "oldest") {
            sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        } else if (sort === "price") {
            sorted.sort((a, b) => Number(a.price) - Number(b.price));
        } else {
            sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
        return sorted;
    }, [ownedGames, sort]);

    const paginatedOwned = useMemo(() => {
        const start = (page - 1) * perPage;
        return sortedOwned.slice(start, start + perPage);
    }, [sortedOwned, page, perPage]);

    const noGames = !games.length && !hasSearch;
    const noMatch = hasSearch && paginatedOwned.length === 0;
    const noOwned = !ownedGames.length;

    return (
        <CatalogLayout totalItems={sortedOwned.length}>
            <div className="general-app-container">
                <p className="no-articles no-articles--welcome">
                    {isAuthenticated ? "MY GAMES" : "Please login to view your games"}
                </p>

                {noGames && <p className="no-articles">NO UPLOADED GAMES YET</p>}
                {noMatch && <p className="no-articles">NO GAME</p>}
                {noOwned && !noMatch && !noGames && (
                    <p className="no-articles">NO OWNED GAMES</p>
                )}

                {!noOwned && !noMatch && !noGames && (
                    <div className="game-grid-wrapper">
                        <section id="welcome-world" className="game-grid">
                            {paginatedOwned.map((game) => (
                                <GameCard key={game.id || game._id} game={game} />
                            ))}
                        </section>
                    </div>
                )}
            </div>
        </CatalogLayout>
    );
};
