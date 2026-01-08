import {useEffect, useState, useContext, useMemo} from "react";
import {useParams, useNavigate, Link} from "react-router-dom";

import {gameServiceFactory} from "../../services/gameService";
import * as commentService from "../../services/commentService";
import {AuthContext} from "../../context/AuthContext";
import {useGameContext} from "../../context/GameContext";
import goBackIcon from "../../images/go-back.jpg";
import defaultAvatar from "../../images/default-user.jpg";

export const DetailsGame = () => {
    const {userId, userEmail, profile_picture} = useContext(AuthContext);   // ✅ FIXED
    const {onGameDeleteSubmit} = useGameContext();
    const {gameId} = useParams();

    const gameService = useMemo(() => gameServiceFactory(), []);

    const [game, setGame] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [showDeletePopup, setShowDeletePopup] = useState(false);

    const navigate = useNavigate();
    const isLoggedIn = Boolean(userId);

    useEffect(() => {
        const loadData = async () => {
            try {
                const gameDetails = await gameService.getOne(gameId);
                const allComments = await commentService.getAll(gameId);

                setGame(gameDetails);
                setComments(Array.isArray(allComments) ? allComments : []);
            } catch (err) {
                console.error("Failed to load game details:", err);
                setGame(null);
            }
        };

        loadData();
    }, [gameId]);

    if (game === null) {
        return <h2>Game not found</h2>;
    }

    if (!game) {
        return <p>Loading...</p>;
    }

    const isOwner = String(game.user) === String(userId);
    const isBought = game.isBought === true;

    // ✅ EMAIL-BASED: detect if user already commented
    const existingComment = isLoggedIn
        ? comments.find((c) => c.user_email === userEmail)
        : null;

    const onCommentSubmit = async (e) => {
        e.preventDefault();

        if (!isLoggedIn || existingComment) return;

        const formData = new FormData();
        formData.append("text", commentText);

        try {
            const created = await commentService.create(gameId, formData);
            // const created = await commentService.create(gameId, { text: commentText });
            console.log("SET COMMENTS", created)
            setComments((prev) => [...prev, created]);
            setCommentText("");
        } catch (err) {
            console.error("Failed to submit comment:", err);
        }
    };

    const onCommentDelete = async (commentId) => {
        try {
            await commentService.remove(commentId);
            setComments((prev) => prev.filter((c) => c.id !== commentId));
        } catch (err) {
            console.error("Failed to delete comment:", err);
        }
    };
    console.log("FIRST COMMENT:", comments[1]);

    return (
        <>
            <div className="details-page-wrapper">
                <p className="no-articles no-articles--welcome details-page-title">
                    GAME DETAILS
                </p>

                {/* LEFT COLUMN */}
                <section id="game-details">
                    <div className="game-details-wrapper">
                        <div className="game-picture-block">
                            {game.game_picture ? (
                                <img
                                    className="entity-game-picture"
                                    src={game.game_picture}
                                    alt="game"
                                />
                            ) : (
                                <img
                                    className="entity-game-picture"
                                    src="/images/no-image.jpg"
                                    alt="game"
                                />
                            )}
                        </div>

                        <div className="game-info-block">
                            <h2>{game.title}</h2>

                            <table className="game-info-table">
                                <thead>
                                <tr>
                                    <th>Field</th>
                                    <th>Value</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td>Category</td>
                                    <td>{game.category}</td>
                                </tr>
                                <tr>
                                    <td>Price</td>
                                    <td>{game.price} $</td>
                                </tr>
                                <tr>
                                    <td>Owner</td>
                                    <td>{game.ownerEmail || "Unknown"}</td>
                                </tr>

                                {game.summary && (
                                    <tr>
                                        <td>Description</td>
                                        <td>{game.summary}</td>
                                    </tr>
                                )}
                                </tbody>
                            </table>

                            <div className="buttons">
                                {isOwner ? (
                                    <>
                                        <button
                                            className="btn btn--submit"
                                            onClick={() => navigate(`/catalog/${gameId}/edit`)}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="btn btn--submit"
                                            onClick={() => setShowDeletePopup(true)}
                                        >
                                            Delete
                                        </button>
                                    </>
                                ) : (
                                    <Link to="/" className="go-back-btn">
                                        <span className="go-back-text">Go back&nbsp;</span>
                                        <img
                                            src={goBackIcon}
                                            alt="Go back"
                                            className="go-back-icon"
                                        />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* RIGHT COLUMN — COMMENTS */}
                <div className="comment-section">
                    {comments.map((c) => (
                        <div key={c.id} className="comment-box">
                            <div className="comment-inner">
                                <img
                                    src={c.profile_picture || defaultAvatar}
                                    alt="User avatar"
                                    className="comment-avatar"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = defaultAvatar;
                                    }}
                                />
                                <div className="comment-content">
                                    <p>
                                        <span className="comment-email">{c.user_email}</span>: {c.text}
                                    </p>
                                </div>
                                {isLoggedIn && c.user_email === userEmail && (
                                    <button
                                        className="comment-close"
                                        title="Delete"
                                        onClick={() => onCommentDelete(c.id)}
                                    >
                                        &times;
                                    </button>
                                )}
                            </div>
                        </div>


                    ))}

                    {/* Show form only if user has NOT commented */}
                    {isLoggedIn && !existingComment && (
                        <form className="comment-form" onSubmit={onCommentSubmit}>
                            <textarea
                                placeholder="Leave your comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                required
                            ></textarea>

                            <button type="submit" className="btn btn--details">
                                Submit
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {showDeletePopup && (
                <div className="popup-overlay">
                    <div className="popup-box">
                        <p>Do you want to delete this game?</p>

                        <div className="popup-buttons">
                            <button
                                className="btn btn--submit"
                                onClick={() => {
                                    onGameDeleteSubmit(gameId);
                                    setShowDeletePopup(false);
                                }}
                            >
                                Yes
                            </button>

                            <button
                                className="btn btn--cancel"
                                onClick={() => setShowDeletePopup(false)}
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
