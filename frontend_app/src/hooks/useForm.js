import { useState } from 'react';

export const useForm = (initialValues, onSubmitHandler) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});

    const changeHandler = (e) => {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        setErrors({}); // ✅ Clear previous errors

        try {
            const result = await onSubmitHandler(values);

            // ✅ Ensure result is an object
            if (result && typeof result === "object" && !Array.isArray(result)) {
                setErrors(result);
            } else {
                setErrors({});
            }
        } catch (err) {
            console.error("useForm: submit handler threw an error", err);
            setErrors({ general: "Something went wrong. Please try again." });
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
