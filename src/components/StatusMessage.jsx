import { getErrorDetails, getErrorMessage } from '../utils/errors';

// type: 'info' | 'success' | 'error'
export default function StatusMessage({ type = 'info', children, details = [] }) {
    return (
        <div className={`status status-${type}`} role={type === 'error' ? 'alert' : 'status'}>
            <p>{children}</p>
            {details.length > 0 && (
                <ul>
                    {details.map((detail, index) => (
                        <li key={index}>{detail}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}

// Renders nothing when there is no error.
export function ErrorMessage({ error, fallback }) {
    if (!error) return null;
    return (
        <StatusMessage type="error" details={getErrorDetails(error)}>
            {getErrorMessage(error, fallback)}
        </StatusMessage>
    );
}