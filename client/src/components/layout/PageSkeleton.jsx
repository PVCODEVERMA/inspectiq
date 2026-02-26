import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export const PageSkeleton = () => {
    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white/40 backdrop-blur-sm p-4 rounded-[2rem] border-2 border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <Skeleton className="h-6 w-32 rounded-lg" />
                </div>
                <Skeleton className="h-10 w-24 rounded-xl" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="p-6 rounded-3xl border-none shadow-premium h-32 flex flex-col justify-between">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-24" />
                    </Card>
                ))}
            </div>

            <Card className="rounded-[2.5rem] border-none shadow-premium h-96 p-8">
                <div className="space-y-4">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <div className="pt-8 space-y-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <Skeleton key={i} className="h-12 w-full rounded-xl" />
                        ))}
                    </div>
                </div>
            </Card>
        </div>
    );
};
