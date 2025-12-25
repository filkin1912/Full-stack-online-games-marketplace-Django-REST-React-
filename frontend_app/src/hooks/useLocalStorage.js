import { useState } from "react";

export const useLocalStorage = (key, initialValue) => {
    const readValue = () => {
        try {
            const item = localStorage.getItem(key);

            // ✅ Handle missing or corrupted values
            if (!item || item === "undefined" || item === "null") {
                return initialValue;
            }

            return JSON.parse(item);
        } catch (err) {
            console.error(`useLocalStorage: Failed to parse key "${key}"`, err);
            return initialValue;
        }
    };

    const [state, setState] = useState(readValue);

    const setLocalStorageState = (value) => {
        try {
            const valueToStore =
                value instanceof Function ? value(state) : value;

            setState(valueToStore);
            localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (err) {
            console.error(`useLocalStorage: Failed to set key "${key}"`, err);
        }
    };

    return [state, setLocalStorageState];
};
