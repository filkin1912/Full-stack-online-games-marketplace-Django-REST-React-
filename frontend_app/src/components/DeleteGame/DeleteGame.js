import { useParams } from "react-router-dom";
import {BoughtGamesContext} from "../../context/BoughtGamesContext";
import {useContext} from "react";

export const DeleteGame = (onGameDeleteSubmit) => {
    const { boughtGames, setBoughtGames } = useContext(BoughtGamesContext);
    const { gameId } = useParams();

    setBoughtGames(boughtGames.filter(game => game._id !== gameId));
    onGameDeleteSubmit(gameId);
};
