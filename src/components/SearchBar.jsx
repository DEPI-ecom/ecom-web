import { useEffect, useState } from 'react';

export default function SearchBar({ value = '', onSearch, placeholder = 'Search products…' }) {
    const [text, setText] = useState(value);

    // Keep in sync when the URL changes (e.g. filters cleared).
    useEffect(() => {
        setText(value);
    }, [value]);

    function handleSubmit(event) {
        event.preventDefault();
        onSearch(text.trim());
    }

    return (
        <form role="search" className="search-form" onSubmit={handleSubmit}>
            <input
                type="search"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={placeholder}
                aria-label="Search products"
            />
            <button type="submit">Search</button>
        </form>
    );
}