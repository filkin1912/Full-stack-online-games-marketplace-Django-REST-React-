import { Link } from "react-router-dom";
import { useAuthContext } from "../../../context/AuthContext";
import { useBoughtGamesContext } from "../../../context/BoughtGamesContext";
import noImage from "../../../images/no-image.jpg";

export const GameCard = ({
    game,
    hideButtons = false,
    hideBuyButton = false,
}) => {
    const { isAuthenticated } = useAuthContext();
    const { buyGame } = useBoughtGamesContext();

    if (!game) return null;

    // Normalize image URL with strict fallback logic
    const rawImage = game.game_picture;

    // Detect invalid backend placeholders
    const isInvalid =
        !rawImage ||
        rawImage.trim() === "" ||
        rawImage.includes("no-image") ||
        rawImage.includes("default") ||
        rawImage === "null" ||
        rawImage === "undefined" ||
        rawImage === "None";

    // Final resolved image URL
    const imageUrl = !isInvalid
        ? rawImage.startsWith("http")
            ? rawImage
            : `${process.env.REACT_APP_API_URL}${rawImage}`
        : noImage;

    const title = game.title || "Untitled Game";
    const category = game.category || "Unknown Category";
    const price = game.price || 0;

    return (
        <div className="game">
            <div className="image-wrap">
                <img src={imageUrl} alt={title} />
            </div>

            <h3>{title}</h3>
            <h1>{category}</h1>

            <div className="data-buttons">

                {/* DETAILS BUTTON */}
                {isAuthenticated ? (
                    <Link to={`/catalog/${game.id}`} className="btn btn--details">
                        Details
                    </Link>
                ) : (
                    <span className="btn btn--details disabled">Details</span>
                )}

                {/* BUY / PRICE BUTTON */}
                {!hideButtons && !hideBuyButton && (
                    isAuthenticated ? (
                        <button
                            className="btn btn--details"
                            onClick={() => buyGame(game)}
                        >
                            Buy&nbsp;&nbsp;${price}
                        </button>
                    ) : (
                        <button
                            className="btn btn--details"
                            onClick={() => alert("You must be logged in to buy games.")}
                        >
                            ${price}
                        </button>
                    )
                )}
            </div>
        </div>
    );
};
