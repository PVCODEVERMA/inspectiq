import { useState, useEffect } from 'react';

/**
 * Custom hook to delay the loading state (e.g., for skeletons)
 * This prevents "flickering" when data returns quickly (e.g., < 300ms)
 * 
 * @param {boolean} isLoading - The actual loading state from React Query or API
 * @param {number} delay - Delay in ms before showing the loading UI (default 300ms)
 * @returns {boolean} - Returns true only if isLoading is true AND the delay has passed
 */
export const useLoadingDelay = (isLoading, delay = 300) => {
    const [shouldShow, setShouldShow] = useState(false);

    useEffect(() => {
        let timer;

        if (isLoading) {
            // If loading starts, wait for the delay before showing skeleton
            timer = setTimeout(() => {
                setShouldShow(true);
            }, delay);
        } else {
            // If loading stops, hide skeleton immediately
            setShouldShow(false);
            if (timer) clearTimeout(timer);
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [isLoading, delay]);

    return shouldShow;
};
