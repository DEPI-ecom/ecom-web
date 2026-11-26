// crypto.randomUUID only exists in secure contexts (https/localhost), so keep a fallback.
export function newIdempotencyKey() {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}