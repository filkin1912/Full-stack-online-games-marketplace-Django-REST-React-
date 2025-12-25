import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { userServiceFactory } from "../../services/userService";

export const UserDetailsEdit = () => {
    const { token, userId, refreshUser } = useContext(AuthContext);

    const userService = useMemo(() => userServiceFactory(token), [token]);
    const navigate = useNavigate();

    const [formValues, setFormValues] = useState({
        first_name: "",
        last_name: "",
        email: "",
        money: 0,
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [loading, setLoading] = useState(true);

    // ✅ Load user details on mount
    useEffect(() => {
        if (!userId) return;

        let isMounted = true;

        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await userService.getUser();
                if (!result || !isMounted) return;

                setFormValues({
                    first_name: result.first_name || "",
                    last_name: result.last_name || "",
                    email: result.email || "",
                    money: Number(result.money || 0),
                });

                setPreviewUrl(result.profile_picture || "");
            } catch (err) {
                console.error("Failed to fetch user details:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [userId, userService]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormValues((prev) => ({
            ...prev,
            [name]: type === "number" ? Number(value) : value,
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("first_name", formValues.first_name);
        formData.append("last_name", formValues.last_name);
        formData.append("email", formValues.email);
        formData.append("money", formValues.money);

        if (selectedFile instanceof File) {
            formData.append("profile_picture", selectedFile);
        }

        try {
            const result = await userService.updateFormData(userId, formData);

            if (result && result.id) {
                // ✅ Update AuthContext immediately
                await refreshUser();

                navigate("/user-details");
            } else {
                console.error("Update failed:", result);
            }
        } catch (err) {
            console.error("Update error:", err);
        }
    };

    if (loading) {
        return <p>Loading user details...</p>;
    }

    return (
        <div id="box">
            <p className="no-articles">Edit Profile</p>

            <section id="general-app-container">
                <form
                    id="edit-profile"
                    method="POST"
                    onSubmit={handleSubmit}
                    encType="multipart/form-data"
                >
                    <div className="container">
                        <div className="form-group">
                            <input
                                type="text"
                                name="first_name"
                                placeholder="First Name"
                                className="form-control"
                                value={formValues.first_name}
                                onChange={handleChange}
                                autoComplete="given-name"
                            />
                        </div>

                        <div className="form-group">
                            <input
                                type="text"
                                name="last_name"
                                placeholder="Last Name"
                                className="form-control"
                                value={formValues.last_name}
                                onChange={handleChange}
                                autoComplete="family-name"
                            />
                        </div>

                        <div className="form-group">
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                className="form-control"
                                value={formValues.email}
                                onChange={handleChange}
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <input
                                type="number"
                                name="money"
                                placeholder="Money"
                                className="form-control"
                                value={formValues.money}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>

                        {previewUrl && (
                            <div className="profile-picture-wrapper">
                                <img
                                    src={previewUrl}
                                    alt="Profile"
                                    className="profile-img"
                                />
                            </div>
                        )}

                        <input
                            type="file"
                            name="profile_picture"
                            id="id_profile_picture"
                            accept="image/*"
                            className="form-control"
                            onChange={handleFileChange}
                        />

                        <button type="submit" className="btn submit">
                            Save
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
};
