import {Link, useLocation, useNavigate} from "react-router-dom";
import {useAuthContext} from "../../../context/AuthContext";
import {useGameContext} from "../../../context/GameContext";
import {useState} from "react";

export const Header = () => {
    const {isAuthenticated, onLogout, token} = useAuthContext();
    const {
        handleSearch,
        refreshGames,
        resetPagination,
    } = useGameContext();

    const location = useLocation();
    const navigate = useNavigate();

    const [searchValue, setSearchValue] = useState("");

    const onSearchSubmit = (e) => {
        e.preventDefault();
        handleSearch(searchValue.trim());
        resetPagination();
    };

    const resetSearch = () => {
        setSearchValue("");
        handleSearch("");
        resetPagination();
    };

    const seedGames = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/games/seed/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error("Failed to seed games");
            }

            alert("20 games created successfully!");
            await refreshGames();
            handleSearch("");
            resetPagination();
            navigate("/");
        } catch (err) {
            console.error("SEED ERROR:", err);
            alert("Error creating games");
        }
    };


    return (
        <header>
            <div className="header-left">
                <h1>
                    <Link className="home" to="/" onClick={resetSearch}>
                        All Games
                    </Link>
                </h1>

                {location.pathname === "/" && (
                    <form id="search-form" className="search-bar" onSubmit={onSearchSubmit}>
                        <input
                            type="text"
                            name="q"
                            placeholder="Search game"
                            className="search-input"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />

                        <button type="submit" className="search-btn">GO</button>

                        {searchValue && (
                            <button
                                type="button"
                                className="search-btn"
                                onClick={resetSearch}
                            >
                                Clear
                            </button>
                        )}
                    </form>
                )}
            </div>

            <nav>
                {isAuthenticated ? (
                    <>
                        <Link
                            to="#"
                            onClick={seedGames}
                            className="nav-btn"
                        >
                            SEED Games
                        </Link>

                        <Link
                            to="#"
                            onClick={onLogout}
                            className="nav-btn"
                        >
                            LogOut
                        </Link>

                        <Link to="/bought-games" className="nav-btn">Bought games</Link>
                        <Link to="/my-games" className="nav-btn">My games</Link>
                        <Link to="/create" className="nav-btn">Create Game</Link>
                        <Link to="/user-details" className="nav-btn">Profile</Link>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-btn">LogIn</Link>
                        <Link to="/register" className="nav-btn">Create Profile</Link>
                    </>
                )}
            </nav>
        </header>
    );
};
