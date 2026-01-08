import {requestFactory} from "./requester";

const baseUrl = `${process.env.REACT_APP_API_URL}/api/common/comments`;

const request = requestFactory();

// Fetch all comments for a specific game
export const getAll = async (gameId) => {
    const result = await request.get(`${baseUrl}/${gameId}/`);

    // Normalize backend response
    if (Array.isArray(result)) return result;
    if (result && Array.isArray(result.results)) return result.results;
    if (result && Array.isArray(result.comments)) return result.comments;

    return [];
};

// Create a new comment for a game
export const create = async (gameId, data) => {
    const result = await request.post(`${baseUrl}/${gameId}/`, data);
    return result;
};

// Delete a comment by ID
export const remove = async (commentId) => {
    const result = await request.delete(`${baseUrl}/delete/${commentId}/`);
    return result;
};
