import {useEffect} from "react";
import {useParams} from "react-router-dom";

import {useForm} from "../../hooks/useForm";
import {useService} from "../../hooks/useService";
import {gameServiceFactory} from "../../services/gameService";
import {useGameContext} from "../../context/GameContext";


export const EditGame = () => {

    const {onGameEditSubmit} = useGameContext();
    const {gameId} = useParams();
    const gameService = useService(gameServiceFactory);
    const {values, changeHandler, onSubmit, changeValues} = useForm({
        _id: '',
        title: '',
        category: '',
        maxLevel: '',
        imageUrl: '',
        summary: '',
    }, onGameEditSubmit);

    useEffect(() => {
        gameService.getOne(gameId)
            .then(result => {
                changeValues(result);
            });
    }, [gameId]);

    return (
        <section id="edit-page" className="auth">
            <form id="edit" method="post" onSubmit={onSubmit}>
                <div className="container">

                    <h1>EDIT GAME</h1>
                    <label htmlFor="leg-title">TITLE:</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={values.title}
                        onChange={changeHandler}
                    />

                    <label htmlFor="category">CATEGORY:</label>
                    <input
                        type="text"
                        id="category"
                        name="category"
                        value={values.category}
                        onChange={changeHandler}
                    />

                    <label htmlFor="levels">MAX LEVEL:</label>
                    <input
                        type="number"
                        id="maxLevel"
                        name="maxLevel"
                        min="1"
                        value={values.maxLevel}
                        onChange={changeHandler}
                    />

                    <label htmlFor="game-img">IMAGE:</label>
                    <input
                        type="text"
                        id="imageUrl"
                        name="imageUrl"
                        value={values.imageUrl}
                        onChange={changeHandler}
                    />

                    <label htmlFor="summary">SUMMARY:</label>
                    <textarea name="summary" id="summary" value={values.summary} onChange={changeHandler}></textarea>

                    <input className="btn submit" type="submit" value="EDIT GAME"/>

                </div>
            </form>
        </section>
    );
};