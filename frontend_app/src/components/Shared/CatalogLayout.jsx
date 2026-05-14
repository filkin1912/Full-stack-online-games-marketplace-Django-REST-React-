import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useGameContext } from "../../context/GameContext";
import { PerPageSelector } from "./PerPageSelector";
import { SortControls } from "./SortControls";
import { Paginator } from "./Paginator";

export const CatalogLayout = ({ children, totalItems }) => {
    const {
        perPage,
        setPerPage,
        page,
        setPage,
        sort,
        setSort,
        searchTerm,
        games,
        filteredGames,
    } = useGameContext();

    const location = useLocation();

    useEffect(() => {
        setPage(1);
    }, [location.pathname, searchTerm, setPage]);

    const noGames = !games.length && !searchTerm.trim();
    const noMatch = searchTerm.trim() && filteredGames.length === 0;

    const headingText = noGames
        ? "NO GAMES YET"
        : noMatch
        ? "NO SUCH A GAME"
        : "ALL NEW GAMES";

    const totalPages = Math.ceil(totalItems / perPage);

    return (
        <>
            <div className="controls-row">
                <SortControls sort={sort} setSort={setSort} setPage={setPage} />

                <PerPageSelector
                    perPage={perPage}
                    setPerPage={setPerPage}
                    setPage={setPage}
                />
            </div>


            {children}

            <Paginator
                page={page}
                setPage={setPage}
                totalPages={totalPages}
            />
        </>
    );
};
