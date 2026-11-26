// Backend error format: { error: { code, message, details } }
export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
    if (error?.response) {
        const apiMessage = error.response.data?.error?.message;
        if (apiMessage) return apiMessage;
        if (error.response.status === 503) {
            return 'A required service is temporarily unavailable. Please try again shortly.';
        }
    } else if (error?.request) {
        return 'Cannot reach the server. Check your connection and try again.';
    }
    return fallback;
}

export const getErrorCode = (error) => error?.response?.data?.error?.code ?? null;

export function getErrorDetails(error) {
    const details = error?.response?.data?.error?.details;
    if (!Array.isArray(details)) return [];
    return details.map((d) => (typeof d === 'string' ? d : d?.message)).filter(Boolean);
}