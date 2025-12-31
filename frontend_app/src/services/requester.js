export const requestFactory = (initialToken) => {
    let token = initialToken;

    const getToken = () => {
        if (token) return token;

        try {
            const raw = localStorage.getItem("authKey");
            if (!raw || raw === "undefined" || raw === "null") return "";

            const parsed = JSON.parse(raw);
            return parsed.accessToken || "";
        } catch (err) {
            console.error("requestFactory: Failed to parse authKey", err);
            return "";
        }
    };

    const buildOptions = (method, data) => {
        const isFormData = data instanceof FormData;

        const headers = isFormData
            ? {}
            : {"Content-Type": "application/json"};

        const authToken = getToken();
        if (authToken) {
            headers["Authorization"] = `Bearer ${authToken}`;
        }

        const options = {
            method,
            headers,
            body: isFormData ? data : JSON.stringify(data),
        };

        return options;
    };


    const request = async (method, url, data) => {
        const options = buildOptions(method, data);
        const response = await fetch(url, options);

        const contentType = response.headers.get("Content-Type") || "";
        const result = contentType.includes("application/json")
            ? await response.json()
            : await response.text();

        if (!response.ok) {
            // ✅ Let Django errors (like { email: ["already exists"] }) bubble up
            throw result;
        }

        return result;
    };

    const buildFormHeaders = () => {
        const headers = {};
        const authToken = getToken();
        if (authToken) {
            headers["Authorization"] = `Bearer ${authToken}`;
        }
        return headers;
    };

    const postForm = async (url, formData) => {
        const response = await fetch(url, {
            method: "POST",
            headers: buildFormHeaders(),
            body: formData,
        });

        const contentType = response.headers.get("Content-Type") || "";
        const result = contentType.includes("application/json")
            ? await response.json()
            : await response.text();

        if (!response.ok) {
            throw result;
        }

        return result;
    };

    const patchFormData = async (url, formData) => {
        const response = await fetch(url, {
            method: "PATCH",
            headers: buildFormHeaders(),
            body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
            throw result;
        }

        return result;
    };

    return {
        get: (url) => request("GET", url),
        post: (url, data) => request("POST", url, data),
        put: (url, data) => request("PUT", url, data),
        patch: (url, data) => request("PATCH", url, data),
        delete: (url) => request("DELETE", url),
        postForm,
        patchFormData,
    };
};
