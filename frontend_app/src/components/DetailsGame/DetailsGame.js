import {useEffect, useState, useContext, useMemo} from "react";
import {useParams, Link} from "react-router-dom";

import {gameServiceFactory} from "../../services/gameService";
import * as commentService from "../../services/commentService";
import {AuthContext} from "../../context/AuthContext";
import {useGameContext} from "../../context/GameContext";
import goBackIcon from "../../images/go-back.jpg";

export const DetailsGame = () => {
    const {userId} = useContext(AuthContext);
    const {onGameDeleteSubmit} = useGameContext();
    const {gameId} = useParams();

    const gameService = useMemo(() => gameServiceFactory(), []);

    const [game, setGame] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [showDeletePopup, setShowDeletePopup] = useState(false);

    const isLoggedIn = Boolean(userId);

    console.log("COMMENTS STATE:", comments); // ← LOGGING HERE

    useEffect(() => {
        const loadData = async () => {
            try {
                const gameDetails = await gameService.getOne(gameId);
                const allComments = await commentService.getAll(gameId);

                setGame(gameDetails);
                setComments(Array.isArray(allComments) ? allComments : []);
            } catch (err) {
                console.error("Failed to load game details:", err);
            }
        };

        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameId]);

    if (!game) return <p>Loading...</p>;

    const isOwner = game.userId === userId;
    const isBought = game.isBought === true;

    const onCommentSubmit = async (e) => {
        e.preventDefault();

        try {
            const created = await commentService.create(gameId, {text: commentText});
            setComments((state) => [...state, created]);
            setCommentText("");
        } catch (err) {
            console.error("Failed to submit comment:", err);
        }
    };

    const onCommentDelete = async (commentId) => {
        try {
            await commentService.remove(commentId);
            setComments((state) => state.filter((c) => c.id !== commentId));
        } catch (err) {
            console.error("Failed to delete comment:", err);
        }
    };

    return (
        <div className="details-page-wrapper" style={{display: "flex", gap: "40px", alignItems: "flex-start"}}>

            {/* LEFT COLUMN */}
            <section id="game-details" style={{flex: 1}}>
                <h1>Game Details</h1>

                <div className="game-details-wrapper">
                    <div className="game-picture-block">
                        {game.game_picture ? (
                            <img className="entity-game-picture" src={game.game_picture} alt="game"/>
                        ) : (
                            <img src=".." alt="Go back" className="go-back-icon"/>

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
                                <td>{game.ownerEmail}</td>
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
                                    <Link to={`/games/${gameId}/edit`} className="btn btn--submit">Edit</Link>
                                    <button className="btn btn--submit"
                                            onClick={() => setShowDeletePopup(true)}>Delete
                                    </button>
                                </>
                            ) : (
                                !isBought ? (
                                    <Link to="/" className="go-back-btn">
                                        <span className="go-back-text">Go back&nbsp;</span>
                                        <img src={goBackIcon} alt="Go back" className="go-back-icon"/>


                                    </Link>
                                ) : (
                                    <h2>You already bought this game</h2>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* RIGHT COLUMN */}
            <div className="comment-section" style={{flex: 1}}>
                <h2>Comments</h2>

                {comments.length === 0 && <p>No comments yet.</p>}

                {Array.isArray(comments) && comments.map((c) => (
                    <div key={c.id} className="comment-box">
                        <p><strong>{c.user_email}</strong>: {c.text}</p>
                        {c.user_id === userId && (
                            <button className="comment-close" title="Delete" onClick={() => onCommentDelete(c.id)}>
                                &times;
                            </button>
                        )}
                    </div>
                ))}

                {isLoggedIn && (
                    <form className="comment-form" onSubmit={onCommentSubmit}>
                        <textarea
                            placeholder="Leave your comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            required
                        ></textarea>
                        <button type="submit" className="btn btn--details">Submit</button>
                    </form>
                )}
            </div>

            {/* DELETE POPUP */}
            {showDeletePopup && (
                <div id="delete-popup" className="popup-overlay">
                    <div className="popup-box">
                        <p>Do you want to delete this game?</p>
                        <button className="btn btn--submit" onClick={() => onGameDeleteSubmit(gameId)}>Yes</button>
                        <button className="btn btn--cancel" onClick={() => setShowDeletePopup(false)}>No</button>
                    </div>
                </div>
            )}
        </div>
    );
};
