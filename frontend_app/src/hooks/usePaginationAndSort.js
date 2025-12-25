import { useState, useMemo } from "react";

export const usePaginationAndSort = (items) => {
    const [perPage, setPerPage] = useState(5);
    const [sort, setSort] = useState("newest");
    const [page, setPage] = useState(1);

    // Sort items based on selected sort option
    const sortedItems = useMemo(() => {
        const sorted = [...items];
        if (sort === "newest") {
            sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else if (sort === "oldest") {
            sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        } else if (sort === "price") {
            sorted.sort((a, b) => a.price - b.price);
        }
        return sorted;
    }, [items, sort]);

    // Calculate pagination
    const totalPages = Math.ceil(sortedItems.length / perPage);
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedItems = sortedItems.slice(startIndex, endIndex);

    return {
        paginatedItems,
        sortedItems,
        perPage,
        setPerPage,
        sort,
        setSort,
        page,
        setPage,
        totalPages,
        startIndex,
        endIndex,
    };
};
