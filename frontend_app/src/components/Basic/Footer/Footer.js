import { useAuthContext } from "../../../context/AuthContext";

export const Footer = () => {
    const {
        isAuthenticated,
        userEmail,
        first_name,
        last_name,
        money,
    } = useAuthContext();

    const fullName = [first_name, last_name].filter(Boolean).join(" ").trim();
    const displayName = fullName || userEmail || "User";
    const balance = typeof money === "number" ? money.toFixed(2) : "0.00";

    return (
        <footer>
            {isAuthenticated ? (
                <>
                    <p>
                        Welcome,&nbsp;
                        {displayName}
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    </p>
                    <p className="profile-balance-box">
                        Balance:&nbsp;${balance}
                    </p>
                </>
            ) : (
                <p>©Vasil Filkin 2025</p>
            )}
        </footer>
    );
};
