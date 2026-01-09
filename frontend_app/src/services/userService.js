import { requestFactory } from "./requester";

const baseUrl = `${process.env.REACT_APP_API_URL}/api/accounts`;

export const userServiceFactory = (token) => {
    const request = requestFactory(token);

    // =====================================================
    // Get current logged-in user
    // =====================================================
    const getUser = async () => {
        try {
            return await request.get(`${baseUrl}/me/`);
        } catch (err) {
            console.error("❌ Cannot fetch current user:", err);
            return null;
        }
    };

    // =====================================================
    // Admin: get all users
    // =====================================================
    const getAllUsers = async () => {
        try {
            return await request.get(`${baseUrl}/users/`);
        } catch (err) {
            console.error("❌ Cannot fetch users list:", err);
            return [];
        }
    };

    // =====================================================
    // Update user (PATCH with FormData)
    // =====================================================
    const updateFormData = async (userId, formData) => {
        try {
            return await request.patchFormData(`${baseUrl}/users/${userId}/`, formData);
        } catch (err) {
            console.error(`❌ Cannot update user ${userId}:`, err);
            return null;
        }
    };

    // =====================================================
    // Delete user account
    // =====================================================
    const deleteUser = async (userId) => {
        try {
            return await request.delete(`${baseUrl}/delete/${userId}/`);
        } catch (err) {
            console.error(`❌ Cannot delete user ${userId}:`, err);
            return null;
        }
    };

    return {
        getUser,
        getAllUsers,
        updateFormData,
        deleteUser,
    };
};
