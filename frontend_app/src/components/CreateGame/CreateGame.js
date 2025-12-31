import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {useGameContext} from "../../context/GameContext";
import noImage from "../../images/no-image.jpg";

export const CreateGame = () => {
    const {onCreateGameSubmit} = useGameContext();
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
        const {name, value} = e.target;
        setFormValues((prev) => ({...prev, [name]: value}));
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
        <section id="create-page" className="auth">
            <form id="create" method="post" onSubmit={onSubmit} encType="multipart/form-data">
                <div className="container">
                    <h1>CREATE GAME</h1>

                    {error && <p className="error">{error}</p>}

                    {/* Title */}
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

                    {/* Category (matching Django choices enum) */}
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

                    {/* Image upload */}
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
                    </div>

                    {/* Summary */}
                    <label htmlFor="summary">SUMMARY:</label>
                    <textarea
                        name="summary"
                        id="summary"
                        value={formValues.summary}
                        onChange={changeHandler}
                        placeholder="Enter game summary..."
                    />

                    {/* Price */}
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

                    <input className="btn submit" type="submit" value="CREATE GAME"/>
                </div>
            </form>
        </section>
    );
};
