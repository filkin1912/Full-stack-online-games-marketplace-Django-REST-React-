import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGameContext } from "../../context/GameContext";
import { useService } from "../../hooks/useService";
import { gameServiceFactory } from "../../services/gameService";
import noImage from "../../images/no-image.jpg";

export const EditGame = () => {
    const { onGameEditSubmit } = useGameContext();
    const { gameId } = useParams();
    const navigate = useNavigate();
    const gameService = useService(gameServiceFactory);

    const [formValues, setFormValues] = useState({
        title: "",
        category: "",
        price: "",
        summary: "",
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(noImage);
    const [error, setError] = useState(null);
    const [imageDeleted, setImageDeleted] = useState(false);

    const urlToFile = async (url, filename) => {
        const res = await fetch(url);
        const blob = await res.blob();
        return new File([blob], filename, { type: blob.type });
    };

    useEffect(() => {
        const loadGame = async () => {
            try {
                const game = await gameService.getOne(gameId);
                setFormValues({
                    title: game.title || "",
                    category: game.category || "",
                    price: game.price?.toString() || "",
                    summary: game.summary || "",
                });
                setPreviewUrl(game.game_picture || noImage);
            } catch (err) {
                console.error("Failed to load game:", err);
                setError("Game not found or failed to load.");
            }
        };
        loadGame();
    }, [gameId]);

    const changeHandler = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
    };

    const fileChangeHandler = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setImageDeleted(false);
        } else {
            setSelectedFile(null);
            setPreviewUrl(noImage);
        }
    };

    const handleImageDelete = () => {
        setSelectedFile(null);
        setPreviewUrl(noImage);
        setImageDeleted(true);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const formData = new FormData();
        formData.append("title", formValues.title);
        formData.append("category", formValues.category);
        formData.append("price", formValues.price);
        formData.append("summary", formValues.summary);

        if (selectedFile) {
            formData.append("game_picture", selectedFile);
        }

        if (imageDeleted && !selectedFile) {
            const defaultFile = await urlToFile(noImage, "no-image.jpg");
            formData.append("game_picture", defaultFile);
        }

        try {
            await onGameEditSubmit(gameId, formData);
            navigate(`/catalog/${gameId}`);
        } catch (err) {
            console.error("Edit game error:", err);
            setError(err?.message || "Failed to edit game");
        }
    };

    return (
        <section id="edit-game-container">
            <form method="post" onSubmit={onSubmit} encType="multipart/form-data">
                <p className="no-articles no-articles--welcome no-articles--edit-game">EDIT GAME</p>
                {error && <p className="error">{error}</p>}

                <div className="edit-game-wrapper">
                    {/* Left Column: Image */}
                    <div className="edit-game-left">
                        <img
                            src={previewUrl}
                            alt="Game"
                            className={`profile-img ${previewUrl === noImage ? "no-image" : ""}`}
                        />
                        <input
                            type="file"
                            name="game_picture"
                            id="game_picture"
                            accept="image/*"
                            className="form-control"
                            onChange={fileChangeHandler}
                        />
                        {previewUrl !== noImage && (
                            <button
                                type="button"
                                className="btn delete-image"
                                onClick={handleImageDelete}
                            >
                                Delete Image
                            </button>
                        )}
                    </div>

                    {/* Right Column: Form Fields */}
                    <div className="edit-game-right">
                        <input
                            type="text"
                            name="title"
                            value={formValues.title}
                            onChange={changeHandler}
                            className="form-control"
                            placeholder="Enter game title..."
                            required
                        />

                        <select
                            name="category"
                            value={formValues.category}
                            onChange={changeHandler}
                            className="form-control"
                            required
                        >
                            <option value="">Select category...</option>
                            <option value="ACTION">Action</option>
                            <option value="ADVENTURE">Adventure</option>
                            <option value="PUZZLE">Puzzle</option>
                            <option value="STRATEGY">Strategy</option>
                            <option value="SPORTS">Sports</option>
                            <option value="BOARD">Board/Card Game</option>
                            <option value="OTHER">Other</option>
                        </select>

                        <input
                            type="number"
                            name="price"
                            value={formValues.price}
                            onChange={changeHandler}
                            className="form-control"
                            min="10"
                            max="999.99"
                            step="0.01"
                            placeholder="10.00"
                            required
                        />

                        <textarea
                            name="summary"
                            value={formValues.summary}
                            onChange={changeHandler}
                            className="form-control"
                            placeholder="Enter game summary..."
                        />

                        <input className="btn submit" type="submit" value="Edit Game" />
                    </div>
                </div>
            </form>
        </section>
    );
};
