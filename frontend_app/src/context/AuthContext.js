import { createContext, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { authServiceFactory } from "../services/authService";
import { userServiceFactory } from "../services/userService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [auth, setAuth] = useLocalStorage("authKey", {});
    const authService = authServiceFactory(auth.accessToken);

    // =====================================================
    // Fetch full user profile from backend
    // =====================================================
    const fetchUserDetails = async (token, fallbackEmail) => {
        const userService = userServiceFactory(token);
        const user = await userService.getUser();

        return {
            id: user?.id,
            email: user?.email || fallbackEmail,
            first_name: user?.first_name || "",
            last_name: user?.last_name || "",
            money: typeof user?.money === "number" ? user.money : 0,
            profile_picture: user?.profile_picture || "",
            games_count: typeof user?.games_count === "number" ? user.games_count : 0,
        };
    };

    // =====================================================
    // Refresh user data (used after buying games, editing profile, etc.)
    // =====================================================
    const refreshUser = async () => {
        if (!auth.accessToken) return;
        const userDetails = await fetchUserDetails(auth.accessToken, auth.email);
        setAuth((prev) => ({ ...prev, ...userDetails }));
    };

    // =====================================================
    // Login
    // =====================================================
    const onLoginSubmit = async (data) => {
        try {
            const result = await authService.login(data);

            const authData = {
                accessToken: result.access,
                refreshToken: result.refresh,
                email: data.email,
            };
            setAuth(authData);

            const userDetails = await fetchUserDetails(result.access, data.email);
            setAuth({ ...authData, ...userDetails });

            navigate("/");
            return {};
        } catch (err) {
            return {
                general: err?.detail || err?.message || "Login failed",
            };
        }
    };

    // =====================================================
    // Register
    // =====================================================
    const onRegisterSubmit = async (values) => {
        const { confirmPassword, password, email } = values;
        const errors = {};

        if (!email?.trim()) errors.email = "Email is required";
        if (!password?.trim()) errors.password = "Password is required";
        if (!confirmPassword?.trim()) errors.confirmPassword = "Please confirm your password";
        if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match";

        if (Object.keys(errors).length > 0) return errors;

        try {
            await authService.register({ email, password });
            const loginResult = await authService.login({ email, password });

            const authData = {
                accessToken: loginResult.access,
                refreshToken: loginResult.refresh,
                email,
            };
            setAuth(authData);

            const userDetails = await fetchUserDetails(loginResult.access, email);
            setAuth({ ...authData, ...userDetails });

            navigate("/");
            return {};
        } catch (err) {
            return { general: err?.message || "Registration failed" };
        }
    };

    // =====================================================
    // Logout
    // =====================================================
    const onLogout = () => {
        localStorage.removeItem("authKey");
        setAuth({});
        navigate("/");
    };

    // =====================================================
    // Update user profile
    // =====================================================
    const onUserEditSubmit = async (values) => {
        try {
            const userService = userServiceFactory(auth.accessToken);
            const result = await userService.update(values.id, values);

            if (result?.id) {
                await refreshUser();
                alert("Details updated");
                navigate("/catalog");
            }
        } catch (err) {
            console.error("Update error:", err);
        }
    };

    // =====================================================
    // Delete user
    // =====================================================
    const onUserDelete = async (userId) => {
        try {
            const userService = userServiceFactory(auth.accessToken);
            await userService.deleteUser(userId);
            setAuth({});
            navigate("/");
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    // =====================================================
    // Local-only helpers (UI updates)
    // =====================================================
    const incrementGamesCount = () => {
        setAuth((prev) => ({
            ...prev,
            games_count: (prev.games_count || 0) + 1,
        }));
    };

    const deductMoney = (amount) => {
        setAuth((prev) => ({
            ...prev,
            money: prev.money - amount,
        }));
    };

    // Debug log
    useEffect(() => {
        console.log("🔍 AuthContext updated:", auth);
    }, [auth]);

    // =====================================================
    // Context Values
    // =====================================================
    const contextValues = {
        onLoginSubmit,
        onRegisterSubmit,
        onLogout,
        onUserEditSubmit,
        onUserDelete,
        refreshUser,
        incrementGamesCount,
        deductMoney,

        userId: auth.id,
        token: auth.accessToken,
        userEmail: auth.email,
        first_name: auth.first_name,
        last_name: auth.last_name,
        money: auth.money,
        profile_picture: auth.profile_picture,
        games_count: auth.games_count,

        isAuthenticated: !!auth.accessToken,
    };

    return (
        <AuthContext.Provider value={contextValues}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => useContext(AuthContext);
