import {useEffect, useMemo} from "react";
import {useGameContext} from "../../context/GameContext";
import {GameCard} from "../Catalog/Game/Game";

export const Home = () => {
    const {
        games,
        filteredGames,
        searchTerm,
        sort,
        page,
        perPage,
        setPage,
        setPerPage
    } = useGameContext();

    // Reset pagination when entering Home
    useEffect(() => {
        setPerPage(12);
        setPage(1);
    }, [setPerPage, setPage]);

    const hasSearch = searchTerm.trim().length > 0;
    const baseList = hasSearch ? filteredGames : games;

    // Sorting
    const sortedGames = useMemo(() => {
        let sorted = [...baseList];

        if (sort === "oldest") {
            sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        } else if (sort === "price") {
            sorted.sort((a, b) => Number(a.price) - Number(b.price));
        } else {
            sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }

        return sorted;
    }, [baseList, sort]);

    // Pagination
    const paginatedGames = useMemo(() => {
        const start = (page - 1) * perPage;
        return sortedGames.slice(start, start + perPage);
    }, [sortedGames, page, perPage]);

    if (!games.length && !hasSearch) {
        return <p className="no-articles">No games yet</p>;
    }

    if (hasSearch && paginatedGames.length === 0) {
        return <p className="no-articles">No such game</p>;
    }

    return (
        <section id="home-page">
            <h1 className="no-articles--welcome">All Games</h1>

            <div className="game-grid-wrapper">
                <section id="welcome-world" className="game-grid">
                    {paginatedGames.map((game) => (
                        <GameCard key={game.id || game._id} game={game}/>
                    ))}
                </section>
            </div>
        </section>
    );
};
