import React from "react";

export const SortControls = ({ sort, setSort, setPage }) => {
    const handleChange = (e) => {
        setSort(e.target.value);
        setPage(1); // ✅ reset to first page on sort change
    };

    return (
        <form className="sort-form">
            <label htmlFor="sort">Sort by:</label>
            <select
                id="sort"
                name="sort"
                value={sort}
                onChange={handleChange}
            >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="price">Price</option>
            </select>
        </form>
    );
};
