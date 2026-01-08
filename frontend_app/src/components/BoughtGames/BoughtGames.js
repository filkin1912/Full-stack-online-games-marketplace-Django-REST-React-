import { useMemo } from "react";
import { useBoughtGamesContext } from "../../context/BoughtGamesContext";
import { useGameContext } from "../../context/GameContext";
import { GameCard } from "../Catalog/Game/Game";
import { CatalogLayout } from "../Shared/CatalogLayout"; // ✅ fixed import path

export const BoughtGames = () => {
    const { boughtGames } = useBoughtGamesContext();
    const {
        searchTerm,
        sort,
        page,
        perPage,
    } = useGameContext();

    const hasSearch = searchTerm.trim().length > 0;

    // Filtered list
    const baseList = useMemo(() => {
        if (!hasSearch) return boughtGames || [];
        return (boughtGames || []).filter((game) =>
            game.title?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [boughtGames, hasSearch, searchTerm]);

    // Sorted list
    const sortedGames = useMemo(() => {
        const sorted = [...baseList];
        if (sort === "oldest") {
            sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        } else if (sort === "price") {
            sorted.sort((a, b) => Number(a.price) - Number(b.price));
        } else {
            sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
        return sorted;
    }, [baseList, sort]);

    // Paginated list
    const paginatedGames = useMemo(() => {
        const start = (page - 1) * perPage;
        return sortedGames.slice(start, start + perPage);
    }, [sortedGames, page, perPage]);

    const noBought = !boughtGames || boughtGames.length === 0;
    const noMatch = hasSearch && paginatedGames.length === 0;

    // Total spent
    const totalSpent = useMemo(() => {
        return boughtGames?.reduce((sum, game) => sum + Number(game.price || 0), 0) || 0;
    }, [boughtGames]);

    return (
        <CatalogLayout totalItems={sortedGames.length}>
            <div className="general-app-container">
                <p className="no-articles no-articles--welcome">
                    {noBought
                        ? "NO BOUGHT GAMES"
                        : noMatch
                        ? "NO SUCH GAME"
                        : "BOUGHT GAMES"}
                </p>

                {!noBought && !noMatch && (
                    <div className="game-grid-wrapper">
                        <section id="welcome-world" className="game-grid">
                            {paginatedGames.map((game) => (
                                <GameCard
                                    key={game.id || game._id}
                                    game={game}
                                    hideBuyButton={true}
                                />
                            ))}
                        </section>
                    </div>
                )}

                {!noBought && (
                    <p className="total-spent-box">
                        Total spent: <strong>${totalSpent.toFixed(2)}</strong>
                    </p>
                )}
            </div>
        </CatalogLayout>
    );
};
