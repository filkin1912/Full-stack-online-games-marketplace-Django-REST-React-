import React, {useEffect, useContext, useState} from "react";
import {AuthContext} from "../../context/AuthContext";
import {useForm} from "../../hooks/useForm";
import {useService} from "../../hooks/useService";
import {userServiceFactory} from "../../services/userService";
import {Link} from "react-router-dom";

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

    const {values, changeValues} = useForm(
        {
            id: "",
            first_name: "",
            last_name: "",
            email: "",
            money: 0,
            profile_picture: "",
            games_count: 0,
        },
        () => {
        }
    );

    useEffect(() => {
        if (!token) return;

        userDataService.getUser().then((result) => {
            if (result) {
                changeValues(result);
            }
        });
    }, [token]);


    const fullName =
        [
            values.first_name || first_name,
            values.last_name || last_name,
        ]
            .filter(Boolean)
            .join(" ")
            .trim() || "No name";

    const mergedProfilePicture = values.profile_picture || profile_picture || "";

    const profileImage =
        typeof mergedProfilePicture === "string" &&
        mergedProfilePicture.trim() !== ""
            ? mergedProfilePicture
            : "/images/no-image.jpg";

    const handleDelete = async () => {
        const targetId = values.id || userId;
        if (!targetId) return;

        await onUserDelete(targetId);
    };

    return (
        <div id="box">
            <p className="no-articles">Profile Details</p>

            <section id="general-app-container">
                <div className="profile-details-wrapper">
                    <div className="profile-picture-block">
                        <img
                            className="profile-img"
                            src={profileImage}
                            alt="profile"
                        />
                    </div>

                    <div className="profile-info-block">
                        <h2>{fullName}</h2>
                        <p>Email: {values.email || userEmail}</p>
                        <p>User ID: {values.id || userId}</p>
                        <p>Money: ${values.money}</p>
                        <p>Owned games: {values.games_count || games_count}</p>

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

            {showConfirm && (
                <div className="modal-overlay">
                    <div className="modal">
                        <p>Are you sure you want to delete your account?</p>
                        <button className="btn btn--submit" onClick={handleDelete}>
                            Yes, delete
                        </button>
                        <button
                            className="btn btn--details"
                            onClick={() => setShowConfirm(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
