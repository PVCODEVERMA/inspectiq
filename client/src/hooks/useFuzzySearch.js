import { useState, useMemo, useEffect } from 'react';
import Fuse from 'fuse.js';

/**
 * optimized custom hook for fuzzy search using Fuse.js
 * @param {Array} data - The source array to search through
 * @param {Object} options - Fuse.js configuration options
 * @param {number} debounceMs - Debounce delay in milliseconds
 */
export const useFuzzySearch = (data, options = {}, debounceMs = 300) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState(data);
    const [isLoading, setIsLoading] = useState(false);

    // 1. MEMOIZE FUSE INSTANCE
    // Re-indexing large datasets is expensive. We only recreate the index 
    // if the raw data or the search keys change.
    const fuse = useMemo(() => {
        return new Fuse(data, {
            threshold: 0.3,
            location: 0,
            distance: 100,
            minMatchCharLength: 2,
            ...options,
        });
    }, [data, JSON.stringify(options.keys)]);

    useEffect(() => {
        // 2. ONLY SEARCH IF LENGTH >= 2
        if (!searchTerm || searchTerm.length < 2) {
            setResults(data);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        // 3. DEBOUNCE SEARCH LOGIC
        // Prevents searching on every single keystroke, which causes UI lag (jank).
        const timer = setTimeout(() => {
            const searchResults = fuse.search(searchTerm).map(result => result.item);
            setResults(searchResults);
            setIsLoading(false);
        }, debounceMs);

        // Cleanup timer if searchTerm changes before delay completes
        return () => clearTimeout(timer);
    }, [searchTerm, fuse, data, debounceMs]);

    return {
        searchTerm,
        setSearchTerm,
        results,
        isLoading,
    };
};
