import { API_BASE_URL, globalHeaders } from '@/utils/apiFetchLoon';

const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
        return { error: { code: response.status, message: data.message || 'An error occurred' } };
    }
    return { data };
};

export const loginUser = async (identifier, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/oauth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...globalHeaders,
            },
            body: JSON.stringify({
                "grant_type": "password",
                "credentials": {
                  "identifier": identifier,
                  "password":password
                },
                "refresh_token": "string"
              }),
        });
        return handleResponse(response);
    } catch (error) {
        return { error: { code: 500, message: 'Network error' } };
    }
};

export const refreshToken = async (refresh_token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...globalHeaders,
            },
            body: JSON.stringify({ refresh_token }),
        });
        return handleResponse(response);
    } catch (error) {
        return { error: { code: 500, message: 'Network error' } };
    }
};
