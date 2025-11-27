export const AUTH_KEY = "wa_bulk_sender_auth";

export const login = () => {
    if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_KEY, "true");
    }
};

export const logout = () => {
    if (typeof window !== "undefined") {
        localStorage.removeItem(AUTH_KEY);
    }
};

export const isAuthenticated = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem(AUTH_KEY) === "true";
    }
    return false;
};
