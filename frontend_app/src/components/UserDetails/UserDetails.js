import React, { useEffect, useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useForm } from "../../hooks/useForm";
import { useService } from "../../hooks/useService";
import { userServiceFactory } from "../../services/userService";
import { Link } from "react-router-dom";
import noImage from "../../images/no-image.jpg";

export const UserDetails = () => {
    const {
        userEmail,
        userId,
        token,
        onUserDelete,
        first_name,
        last_name,
        profile_picture,
        games_count,
    } = useContext(AuthContext);

    const userDataService = useService(() => userServiceFactory(token));
    const [showConfirm, setShowConfirm] = useState(false);

    const { values, changeValues } = useForm(
        {
            id: "",
            first_name: "",
            last_name: "",
            email: "",
            money: 0,
            profile_picture: "",
            games_count: 0,
        },
        () => {}
    );

    useEffect(() => {
        if (!token) return;

        userDataService.getUser().then((result) => {
            if (result) {
                changeValues(result);
            }
        });
    }, [token]);

    const fullName = [values.first_name || first_name, values.last_name || last_name]
        .filter(Boolean)
        .join(" ")
        .trim();

    const displayName = fullName || "None";
    const profileImage =
        typeof (values.profile_picture || profile_picture) === "string" &&
        (values.profile_picture || profile_picture).trim() !== ""
            ? values.profile_picture || profile_picture
            : noImage;

    const handleDelete = async () => {
        const targetId = values.id || userId;
        if (!targetId) return;

        await onUserDelete(targetId);
    };

    return (
        <div id="box">
            <p className="no-articles">PROFILE</p>

            <section id="general-app-container">
                <div className="profile-details-wrapper vertical-stack">
                    {/* Profile Picture */}
                    <div className="profile-picture-block">
                        <img
                            className="profile-img"
                            src={profileImage}
                            alt="profile"
                        />
                    </div>

                    {/* Profile Info Table */}
                    <div className="profile-info-block">
                        <table className="profile-info-table">
                            <tbody>
                                <tr>
                                    <th>Name:</th>
                                    <td>{displayName}</td>
                                </tr>
                                <tr>
                                    <th>Email:</th>
                                    <td>{values.email || userEmail}</td>
                                </tr>
                                <tr>
                                    <th>User ID:</th>
                                    <td>{values.id || userId}</td>
                                </tr>
                                <tr>
                                    <th>Money:</th>
                                    <td>${Number(values.money).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <th>Owned games:</th>
                                    <td>{values.games_count || games_count}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Profile Actions */}
                        <div className="profile-actions">
                            <Link
                                to={`/user-details/edit/${userId}`}
                                className="btn btn--details"
                            >
                                Edit
                            </Link>

                            <button
                                className="btn btn--details"
                                onClick={() => setShowConfirm(true)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Delete Confirmation Popup */}
            {showConfirm && (
                <div id="profile-delete-popup" className="popup-overlay">
                    <div className="popup-box">
                        <p>Do you want to delete your profile?</p>
                        <form method="post" onSubmit={(e) => {
                            e.preventDefault();
                            handleDelete();
                        }}>
                            <button type="submit" className="btn btn--submit">Yes</button>
                            <button
                                type="button"
                                className="btn btn--cancel"
                                onClick={() => setShowConfirm(false)}
                            >
                                No
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
