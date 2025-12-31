import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {useGameContext} from "../../context/GameContext";
import {useService} from "../../hooks/useService";
import {gameServiceFactory} from "../../services/gameService";
import noImage from "../../images/no-image.jpg";

export const EditGame = () => {
    const {onGameEditSubmit} = useGameContext();
    const {gameId} = useParams();
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

    // Convert imported noImage into a File object
    const urlToFile = async (url, filename) => {
        const res = await fetch(url);
        const blob = await res.blob();
        return new File([blob], filename, {type: blob.type});
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
        const {name, value} = e.target;
        setFormValues((prev) => ({...prev, [name]: value}));
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

        console.log("Form values before submit:", formValues);

        const formData = new FormData();
        formData.append("title", formValues.title);
        formData.append("category", formValues.category);
        formData.append("price", formValues.price);
        formData.append("summary", formValues.summary);

        if (selectedFile) {
            formData.append("game_picture", selectedFile);
        }

        // If image was deleted, send default noImage file
        if (imageDeleted && !selectedFile) {
            const defaultFile = await urlToFile(noImage, "no-image.jpg");
            formData.append("game_picture", defaultFile);
        }

        try {
            await onGameEditSubmit(gameId, formData);
            navigate(`/catalog/${gameId}`);
        } catch (err) {
            console.error("Edit game error:", err);
            setError(
                err?.message ||
                (typeof err === "string" ? err : "Failed to edit game")
            );
        }
    };

    return (
        <section id="create-page" className="auth">
            <form
                id="create"
                method="post"
                onSubmit={onSubmit}
                encType="multipart/form-data"
            >
                <div className="container">
                    <h1>EDIT GAME</h1>

                    {error && <p className="error">{error}</p>}

                    <label htmlFor="title">TITLE:</label>
                    <input
                        value={formValues.title}
                        onChange={changeHandler}
                        type="text"
                        id="title"
                        name="title"
                        placeholder="Enter game title..."
                        required
                    />

                    <label htmlFor="category">CATEGORY:</label>
                    <select
                        id="category"
                        name="category"
                        value={formValues.category}
                        onChange={changeHandler}
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

                    <label htmlFor="game_picture">IMAGE:</label>
                    <div className="picture-wrapper">
                        <img
                            className="entity-game-picture"
                            src={previewUrl}
                            alt="game"
                        />
                        <input
                            type="file"
                            id="game_picture"
                            name="game_picture"
                            accept="image/*"
                            className="file-input"
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

                    <label htmlFor="summary">SUMMARY:</label>
                    <textarea
                        name="summary"
                        id="summary"
                        value={formValues.summary}
                        onChange={changeHandler}
                        placeholder="Enter game summary..."
                    />

                    <label htmlFor="price">PRICE:</label>
                    <input
                        value={formValues.price}
                        onChange={changeHandler}
                        type="number"
                        id="price"
                        name="price"
                        min="10"
                        max="999.99"
                        step="0.01"
                        placeholder="10.00"
                        required
                    />

                    <input className="btn submit" type="submit" value="EDIT GAME"/>
                </div>
            </form>
        </section>
    );
};
