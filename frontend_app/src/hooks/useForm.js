import { useState } from "react";

export const useForm = (initialValues, onSubmitHandler) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});

    const changeHandler = (e) => {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        // Clear old errors before new submit
        setErrors({});

        try {
            const result = await onSubmitHandler(values);

            // ⭐ If backend or AuthContext returns errors → show them
            if (result && typeof result === "object") {
                setErrors(result);
            }
        } catch (err) {
            console.error("useForm error:", err);

            // Fallback general error
            setErrors({
                general: "Something went wrong. Please try again.",
            });
        }
    };

    const changeValues = (newValues) => {
        setValues(newValues);
    };

    return {
        values,
        errors,
        changeHandler,
        onSubmit,
        changeValues,
    };
};
