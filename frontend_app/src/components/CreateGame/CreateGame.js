import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameContext } from "../../context/GameContext";
import noImage from "../../images/no-image.jpg";

export const CreateGame = () => {
    const { onCreateGameSubmit } = useGameContext();
    const navigate = useNavigate();

    const [formValues, setFormValues] = useState({
        title: "",
        category: "",
        price: "",
        summary: "",
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(noImage);
    const [error, setError] = useState(null);

    const changeHandler = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
    };

    const fileChangeHandler = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setSelectedFile(null);
            setPreviewUrl(noImage);
        }
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

        try {
            const createdGame = await onCreateGameSubmit(formData);
            if (createdGame && createdGame.id) {
                navigate("/");
            }
        } catch (err) {
            console.error("Create game error:", err);
            setError(
                err?.message ||
                (typeof err === "string" ? err : "Failed to create game")
            );
        }
    };

    return (
        <div id="box">
            <p className="no-articles">CREATE GAME</p>

            <section id="general-app-container">
                <form method="post" onSubmit={onSubmit} encType="multipart/form-data">
                    {error && <p className="error">{error}</p>}

                    {/* Title */}
                    <input
                        type="text"
                        name="title"
                        placeholder="Write title"
                        className="form-control"
                        value={formValues.title}
                        onChange={changeHandler}
                        required
                    />

                    {/* Category */}
                    <select
                        name="category"
                        className="form-control"
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

                    {/* Price */}
                    <input
                        type="number"
                        name="price"
                        placeholder="Price"
                        className="form-control"
                        value={formValues.price}
                        onChange={changeHandler}
                        min="10"
                        max="999.99"
                        step="0.01"
                        required
                    />

                    {/* Picture field */}
                    <div className="picture-wrapper">
                        <img
                            className="entity-game-picture"
                            src={previewUrl}
                            alt="game preview"
                        />
                        <input
                            type="file"
                            name="game_picture"
                            accept="image/*"
                            className="form-control file-input"
                            onChange={fileChangeHandler}
                        />
                    </div>

                    {/* Summary */}
                    <textarea
                        name="summary"
                        placeholder="Summary"
                        className="form-control"
                        value={formValues.summary}
                        onChange={changeHandler}
                    />

                    {/* Submit */}
                    <input className="btn submit" type="submit" value="Create Game" />
                </form>
            </section>
        </div>
    );
};
