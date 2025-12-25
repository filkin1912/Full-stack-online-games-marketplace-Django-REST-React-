export const PerPageSelector = ({perPage, setPerPage, setPage}) => {
    return (
        <form className="per-page-form">
            <label>Show per page:</label>
            <select
                value={perPage}
                onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setPage(1);
                }}
            >
                {[4, 6, 8, 12].map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
        </form>
    );
};
