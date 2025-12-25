export const Paginator = ({page, setPage, totalPages}) => {
    if (totalPages <= 1) return null;

    return (
        <div className="fixed-paginator">
      <span className="page-range">
        Page {page} of {totalPages}
      </span>

            <div className="page-controls">
                {page > 1 ? (
                    <>
                        <button className="page-btn" onClick={() => setPage(1)}>
                            &laquo;
                        </button>
                        <button className="page-btn" onClick={() => setPage(page - 1)}>
                            &lsaquo;
                        </button>
                    </>
                ) : (
                    <>
                        <span className="page-btn disabled">&laquo;</span>
                        <span className="page-btn disabled">&lsaquo;</span>
                    </>
                )}

                {Array.from({length: totalPages}, (_, i) => i + 1)
                    .filter((num) => Math.abs(num - page) <= 2)
                    .map((num) =>
                            num === page ? (
                                <span key={num} className="page-btn current">
                {num}
              </span>
                            ) : (
                                <button
                                    key={num}
                                    className="page-btn"
                                    onClick={() => setPage(num)}
                                >
                                    {num}
                                </button>
                            )
                    )}

                {page < totalPages ? (
                    <>
                        <button className="page-btn" onClick={() => setPage(page + 1)}>
                            &rsaquo;
                        </button>
                        <button className="page-btn" onClick={() => setPage(totalPages)}>
                            &raquo;
                        </button>
                    </>
                ) : (
                    <>
                        <span className="page-btn disabled">&rsaquo;</span>
                        <span className="page-btn disabled">&raquo;</span>
                    </>
                )}
            </div>
        </div>
    );
};
