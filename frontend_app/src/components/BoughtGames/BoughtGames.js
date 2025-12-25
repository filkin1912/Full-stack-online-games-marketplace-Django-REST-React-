import {useMemo} from "react";
import {useBoughtGamesContext} from "../../context/BoughtGamesContext";
import {useGameContext} from "../../context/GameContext";
import {GameCard} from "../Catalog/Game/Game";

export const BoughtGames = () => {
    const {boughtGames} = useBoughtGamesContext();
    const {
        searchTerm,
        sort,
        page,
        perPage,
    } = useGameContext();

    const hasSearch = searchTerm.trim().length > 0;

    // Base list (search or full)
    const baseList = useMemo(() => {
        if (!hasSearch) return boughtGames;

        return boughtGames.filter((game) =>
            game.title?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [boughtGames, hasSearch, searchTerm]);

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

    // Pagination slicing
    const paginatedGames = useMemo(() => {
        const start = (page - 1) * perPage;
        return sortedGames.slice(start, start + perPage);
    }, [sortedGames, page, perPage]);

    // Early returns
    if (!boughtGames || boughtGames.length === 0) {
        return <p className="no-articles">No bought games yet</p>;
    }

    if (hasSearch && paginatedGames.length === 0) {
        return <p className="no-articles">No such game</p>;
    }

    return (
        <section id="home-page">
            <h1 className="no-articles--welcome">Bought Games</h1>

            {/*<div className="game-grid-wrapper">*/}
            {/*    <section id="welcome-world" className="game-grid">*/}
            {/*        {paginatedGames.map((game) => (*/}
            {/*            <GameCard*/}
            {/*                key={game.id || game._id}*/}
            {/*                game={game}*/}
            {/*                hideBuyButton={true}*/}
            {/*            />*/}
            {/*        ))}*/}
            {/*    </section>*/}
            {/*</div>*/}
            <div className="game-grid-wrapper">
                <section id="welcome-world" className="game-grid">
                    {paginatedGames.map((game) => {
                        console.log("GAME:", game);   // <-- works correctly
                        return (
                            <GameCard
                                key={game.id || game._id}
                                game={game}
                                hideBuyButton={true}
                            />
                        );
                    })}
                </section>
            </div>


        </section>
    );
};
