import {Link} from "react-router-dom";
import {useAuthContext} from "../../context/AuthContext";
import {useBoughtGamesContext} from "../../context/BoughtGamesContext";

export const GameCard = ({game, hideButtons = false, hideBuyButton = false}) => {
    const {isAuthenticated} = useAuthContext();
    const {buyGame} = useBoughtGamesContext();

    const imageUrl = game.game_picture
        ? game.game_picture
        : "/images/no-image.jpg"; // fallback

    return (
        <div className="game">
            <div className="image-wrap">
                <img src={imageUrl} alt={game.title}/>
            </div>
            <h3>{game.title}</h3>
            <h1>{game.category}</h1>

            <div className="data-buttons">
                {/* Always show Details */}
                <Link to={`/catalog/${game.id}`} className="btn btn--details">Details</Link>

                {/* Show Buy only if not hidden and user is authenticated */}
                {!hideButtons && !hideBuyButton && isAuthenticated && (
                    <button
                        className="btn btn--details"
                        onClick={() => buyGame(game)}
                    >
                        Buy&nbsp;&nbsp;${game.price}
                    </button>
                )}
            </div>
        </div>
    );
};
