// src/components/Shared/Paginator.jsx
import React from "react";

export const Paginator = ({ page, setPage, totalPages }) => {
    if (!totalPages || totalPages <= 1) {
        return null;
    }

    const goToPage = (targetPage) => {
        if (targetPage < 1 || targetPage > totalPages || targetPage === page) {
            return;
        }
        setPage(targetPage);
    };

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="fixed-paginator">
            <span className="page-range">
                Page {page} – {totalPages}
            </span>

            <div className="page-controls">
                {page === 1 ? (
                    <span className="page-btn disabled">&laquo;</span>
                ) : (
                    <button className="page-btn" onClick={() => goToPage(1)}>
                        &laquo;
                    </button>
                )}

                {page === 1 ? (
                    <span className="page-btn disabled">&lsaquo;</span>
                ) : (
                    <button className="page-btn" onClick={() => goToPage(page - 1)}>
                        &lsaquo;
                    </button>
                )}

                {pageNumbers.map((num) =>
                    num === page ? (
                        <span key={num} className="page-btn current">
                            {num}
                        </span>
                    ) : (
                        <button
                            key={num}
                            className="page-btn"
                            onClick={() => goToPage(num)}
                        >
                            {num}
                        </button>
                    )
                )}

                {page === totalPages ? (
                    <span className="page-btn disabled">&rsaquo;</span>
                ) : (
                    <button className="page-btn" onClick={() => goToPage(page + 1)}>
                        &rsaquo;
                    </button>
                )}

                {page === totalPages ? (
                    <span className="page-btn disabled">&raquo;</span>
                ) : (
                    <button className="page-btn" onClick={() => goToPage(totalPages)}>
                        &raquo;
                    </button>
                )}
            </div>
        </div>
    );
};
