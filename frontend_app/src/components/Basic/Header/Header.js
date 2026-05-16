import {Link, useLocation, useNavigate} from "react-router-dom";
import {useAuthContext} from "../../../context/AuthContext";
import {useGameContext} from "../../../context/GameContext";
import {useBoughtGamesContext} from "../../../context/BoughtGamesContext";
import {useState} from "react";
import {API_BASE_URL} from "../../../config/api";

export const Header = () => {
    const {isAuthenticated, onLogout, token, refreshUser} = useAuthContext();
    const {handleSearch, refreshGames, resetPagination} = useGameContext();
    const {fetchBoughtGames} = useBoughtGamesContext();

    const location = useLocation();
    const navigate = useNavigate();

    const [searchValue, setSearchValue] = useState("");

    // NEW: mobile menu state
    const [menuOpen, setMenuOpen] = useState(false);
    const toggleMenu = () => setMenuOpen(prev => !prev);
    const closeMenu = () => setMenuOpen(false);

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

    const reloadAllGames = async () => {
        resetSearch();
        await refreshGames();
        await refreshUser();
        closeMenu();
        navigate("/");
    };

    const seedGames = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/games/seed/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            // If games already exist, backend will NOT return 201
            if (res.status !== 201) {
                alert("20 games are already seeded!");
                closeMenu();
                return;
            }

            // Successful seeding
            alert("20 games created successfully!");
            await refreshGames();
            resetSearch();
            closeMenu();
            navigate("/");
        } catch (err) {
            console.error("SEED ERROR:", err);
            alert("Error creating games");
        }
    };

    const loadGames = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/games/load/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            // Games already exist → backend returns 200
            if (res.status === 200) {
                alert("20 games are already fetched and available!");
                closeMenu();
                return;
            }

            // Games successfully loaded → backend returns 201
            if (res.status === 201) {
                alert("20 games loaded successfully!");
                await refreshGames();
                resetSearch();
                closeMenu();
                navigate("/");
                return;
            }

            throw new Error("Failed to load games");
        } catch (err) {
            console.error("LOAD ERROR:", err);
            alert("Error loading games");
        }
    };


    return (
        <header>
            <div className="header-left">
                <h1>
                    <Link className="home" to="/" onClick={reloadAllGames}>
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

            {/* HAMBURGER BUTTON (visible on mobile) */}
            <button className="hamburger-btn" onClick={toggleMenu}>≡</button>

            {/* DESKTOP NAV */}
            <nav>
                {isAuthenticated ? (
                    <>
                        <Link to="#" onClick={loadGames} className="nav-btn">Load games</Link>
                        {/*<Link to="#" onClick={seedGames} className="nav-btn">Seed games</Link>*/}
                        <Link to="#" onClick={onLogout} className="nav-btn">LogOut</Link>

                        <Link
                            to="/bought-games"
                            className="nav-btn"
                            onClick={async () => {
                                await fetchBoughtGames();
                                await refreshUser();
                            }}
                        >
                            Bought games
                        </Link>

                        <Link
                            to="/my-games"
                            className="nav-btn"
                            onClick={async () => {
                                await refreshGames();
                                await refreshUser();
                            }}
                        >
                            My games
                        </Link>

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

            {/* MOBILE NAV */}
            <div className={`mobile-nav ${menuOpen ? "open" : ""}`}>
                {isAuthenticated ? (
                    <>
                        <Link to="#" onClick={() => {
                            loadGames();
                            closeMenu();
                        }} className="nav-btn">Load games</Link>
                        {/*<Link to="#" onClick={() => {*/}
                        {/*    seedGames();*/}
                        {/*    closeMenu();*/}
                        {/*}} className="nav-btn">Seed games</Link>*/}
                        <Link to="#" onClick={() => {
                            onLogout();
                            closeMenu();
                        }} className="nav-btn">LogOut</Link>

                        <Link
                            to="/bought-games"
                            className="nav-btn"
                            onClick={async () => {
                                await fetchBoughtGames();
                                await refreshUser();
                                closeMenu();
                            }}
                        >
                            Bought games
                        </Link>

                        <Link
                            to="/my-games"
                            className="nav-btn"
                            onClick={async () => {
                                await refreshGames();
                                await refreshUser();
                                closeMenu();
                            }}
                        >
                            My games
                        </Link>

                        <Link to="/create" className="nav-btn" onClick={closeMenu}>Create Game</Link>
                        <Link to="/user-details" className="nav-btn" onClick={closeMenu}>Profile</Link>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-btn" onClick={closeMenu}>LogIn</Link>
                        <Link to="/register" className="nav-btn" onClick={closeMenu}>Create Profile</Link>
                    </>
                )}
            </div>
        </header>
    );
};
