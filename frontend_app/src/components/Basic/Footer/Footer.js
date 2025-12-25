import {useAuthContext} from "../../../context/AuthContext";

export const Footer = () => {
    const context = useAuthContext();

    console.log("AuthContext values:", context);

    const {
        isAuthenticated,
        userEmail,
        first_name,
        last_name,
        money,
    } = context;
    console.log("MONEY",money);
    console.log("FIRST",first_name);
    console.log("LAST",last_name);

    // ✅ Build full name safely
    const fullName = [first_name, last_name].filter(Boolean).join(" ").trim();

    // ✅ Fallback to email if no name
    const displayName = fullName || userEmail || "User";

    // ✅ Format money safely
    const balance = typeof money === "number" ? money.toFixed(2) : "0.00";

    return (
        <footer>
            {isAuthenticated ? (
                <>
                    <p>Welcome, {displayName}</p>
                    <p className="profile-balance-box">Balance: ${balance}</p>
                </>
            ) : (
                <p>©Vasil Filkin 2025</p>
            )}
        </footer>
    );
};


// import { useAuthContext } from "../../../context/AuthContext";
//
// export const Footer = () => {
//     const context = useAuthContext();
//
//     console.log("AuthContext values:", context); // 👀 see everything
//
//     const { isAuthenticated, userEmail } = context;
//
//     return (
//         <footer>
//             {isAuthenticated ? (
//                 <>
//                     <p>Welcome, {userEmail}</p>
//                     <p className="profile-balance-box">Balance: $0.00</p>
//                 </>
//             ) : (
//                 <p>©Vasil Filkin 2025</p>
//             )}
//         </footer>
//     );
// };
