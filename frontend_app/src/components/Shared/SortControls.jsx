export const SortControls = ({sort, setSort, setPage}) => {
    return (
        <form className="sort-form">
            <label>Sort by:</label>
            <select
                value={sort}
                onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                }}
            >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="price">Price</option>
            </select>
        </form>
    );
};
