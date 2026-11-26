import { useCallback, useEffect, useRef, useState } from 'react';

// Runs an async function on mount and whenever `deps` change.
// Ignores stale responses (fast filter changes, unmounts). Returns { data, loading, error, reload }.
export default function useAsync(asyncFn, deps = []) {
    const [state, setState] = useState({ data: null, loading: true, error: null });
    const latestCall = useRef(0);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const run = useCallback(async () => {
        const callId = ++latestCall.current;
        setState((s) => ({ ...s, loading: true, error: null }));
        try {
            const data = await asyncFn();
            if (callId === latestCall.current) setState({ data, loading: false, error: null });
        } catch (error) {
            if (callId === latestCall.current) setState({ data: null, loading: false, error });
        }
    }, deps);

    useEffect(() => {
        run();
        return () => {
            latestCall.current += 1; // invalidate in-flight call on unmount/dep change
        };
    }, [run]);

    return { ...state, reload: run };
}