import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

/**
 * Standard hook for fetching inspections with caching
 * @param {string} serviceId - Optional service ID filter
 */
export const useInspectionsQuery = (serviceId = null) => {
    return useQuery({
        queryKey: ['inspections', serviceId],
        queryFn: async () => {
            // Parallel fetch from all industrial endpoints if serviceId is provided
            if (serviceId) {
                const endpoints = [
                    '/ndt/liquid-penetrant',
                    '/inspections',
                    '/ndt/ultrasonic',
                    '/ndt/magnetic-particle',
                    '/ndt/summary'
                ];

                const results = await Promise.all(
                    endpoints.map(ep =>
                        api.get(`${ep}?serviceId=${serviceId}`)
                            .then(res => res.data.map(item => ({ ...item, _endpoint: ep })))
                            .catch(() => [])
                    )
                );

                return results.flat().sort((a, b) =>
                    new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
                );
            }

            // General inspections fetch
            const response = await api.get('/inspections');
            return response.data;
        },
        // Prevent layout shift by keeping previous data while refetching
        placeholderData: (previousData) => previousData,
    });
};

/**
 * Helper hook to prefetch data for "instant" feel
 */
export const usePrefetch = () => {
    const queryClient = useQueryClient();

    const prefetchInspections = (serviceId = null) => {
        queryClient.prefetchQuery({
            queryKey: ['inspections', serviceId],
            queryFn: async () => {
                // (Same logic as in hook above - simplified for example)
                if (serviceId) {
                    const response = await api.get(`/inspections?serviceId=${serviceId}`);
                    return response.data;
                }
                const response = await api.get('/inspections');
                return response.data;
            },
            staleTime: 5 * 60 * 1000,
        });
    };

    return { prefetchInspections };
};
