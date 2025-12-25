import React, {useState, useRef} from 'react';
import {useGameContext} from "../../../context/GameContext";

export const SearchForm = () => {

    const {handleSearch, setFilteredGames} = useGameContext();
    const [searchTerm, setSearchTerm] = useState('');
    const searchInputRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSearch(searchTerm);
    };

    const handleBlur = () => {
        // Clear the search term when the input loses focus (blur event)
        setSearchTerm('');
        setFilteredGames([]);
    };


    return (
        <div>

            <form className="form-inline" onSubmit={handleSubmit}>
                <input
                    ref={searchInputRef} // Reference to the input element
                    type="search"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onBlur={handleBlur} // Trigger the blur event to clear the search field
                />
                <button className="btn my-2 my-sm-0 nav_search-btn" type="submit"></button>
            </form>

        </div>
    )
}