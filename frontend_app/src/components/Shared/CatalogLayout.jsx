import {useEffect} from "react";
import {useLocation} from "react-router-dom";
import {useGameContext} from "../../context/GameContext";
import {PerPageSelector} from "./PerPageSelector";
import {SortControls} from "./SortControls";
import {Paginator} from "./Paginator";

export const CatalogLayout = ({children}) => {
    const {
        games,
        filteredGames,
        perPage,
        setPerPage,
        page,
        setPage,
        sort,
        setSort,
        searchTerm,   // ✅ added
    } = useGameContext();

    const location = useLocation();

    useEffect(() => {
        // 🔥 Reset page when route OR search changes
        setPage(1);
    }, [location.pathname, searchTerm, setPage]);

    const totalItems = filteredGames.length || games.length;
    const totalPages = Math.ceil(totalItems / perPage);

    return (
        <>
            <PerPageSelector
                perPage={perPage}
                setPerPage={setPerPage}
                setPage={setPage}
            />

            <SortControls
                sort={sort}
                setSort={setSort}
                setPage={setPage}
            />

            {children}

            <Paginator
                page={page}
                setPage={setPage}
                totalPages={totalPages}
            />
        </>
    );
};
