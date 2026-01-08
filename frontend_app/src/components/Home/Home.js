import { useMemo } from "react";
import { useGameContext } from "../../context/GameContext";
import { GameCard } from "../Catalog/Game/Game";
import { CatalogLayout } from "../Shared/CatalogLayout";

export const Home = () => {
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

    const paginatedGames = useMemo(() => {
        const start = (page - 1) * perPage;
        return sortedGames.slice(start, start + perPage);
    }, [sortedGames, page, perPage]);

    const noGames = !games.length && !hasSearch;
    const noMatch = hasSearch && paginatedGames.length === 0;

    return (
        <CatalogLayout totalItems={sortedGames.length}>
            <div className="general-app-container">
                <p className="no-articles no-articles--welcome">
                    {noGames
                        ? "NO GAMES YET"
                        : noMatch
                        ? "NO SUCH A GAME"
                        : "ALL NEW GAMES"}
                </p>

                {!noGames && !noMatch && (
                    <div className="game-grid-wrapper">
                        <section id="welcome-world" className="game-grid">
                            {paginatedGames.map((game) => (
                                <GameCard key={game.id || game._id} game={game} />
                            ))}
                        </section>
                    </div>
                )}
            </div>
        </CatalogLayout>
    );
};
