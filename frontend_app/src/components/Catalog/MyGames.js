import {useContext, useMemo} from "react";
import {AuthContext} from "../../context/AuthContext";
import {useGameContext} from "../../context/GameContext";
import {GameCard} from "./Game/Game";

export const MyGames = () => {
    const {userId, isAuthenticated} = useContext(AuthContext);
    const {games, filteredGames, searchTerm, sort, page, perPage} = useGameContext();

    const hasSearch = searchTerm.trim().length > 0;
    const baseList = hasSearch ? filteredGames : games;

    // Filter owned games
    const ownedGames = useMemo(() => {
        return baseList.filter((game) => String(game.user) === String(userId));
    }, [baseList, userId]);

    // Sorting
    const sortedOwned = useMemo(() => {
        let sorted = [...ownedGames];
        if (sort === "oldest") {
            sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        } else if (sort === "price") {
            sorted.sort((a, b) => Number(a.price) - Number(b.price));
        } else {
            sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
        return sorted;
    }, [ownedGames, sort]);

    // Pagination slicing
    const paginatedOwned = useMemo(() => {
        const start = (page - 1) * perPage;
        return sortedOwned.slice(start, start + perPage);
    }, [sortedOwned, page, perPage]);

    if (!games.length && !hasSearch) {
        return <p className="no-articles">No games yet</p>;
    }

    if (hasSearch && paginatedOwned.length === 0) {
        return <p className="no-articles">No such game</p>;
    }

    if (!ownedGames.length) {
        return <p className="no-articles">You don’t own any games</p>;
    }

    return (
        <section id="home-page">
            <h1 className="no-articles--welcome">{isAuthenticated ? "My Games" : "Please login to view your games"}</h1>

            <div className="game-grid-wrapper">
                <section id="welcome-world" className="game-grid">
                    {paginatedOwned.map((game) => (
                        <GameCard key={game.id || game._id} game={game}/>
                    ))}
                </section>
            </div>
        </section>
    );
};
