import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown } from 'lucide-react';
import CountUp from 'react-countup';

export const PremiumMetricCard = ({
    label,
    value,
    change,
    changeType = 'increase',
    icon: Icon,
    variant = 'red',
    className
}) => {
    // Helper to parse numeric part, prefix and suffix from the value string
    const parseValue = (val) => {
        if (typeof val === 'number') return { prefix: '', number: val, suffix: '' };

        const match = val.match(/^([^0-9.]*)([0-9.]+)(.*)$/);
        if (match) {
            return {
                prefix: match[1] || '',
                number: parseFloat(match[2]),
                suffix: match[3] || ''
            };
        }
        return { prefix: '', number: 0, suffix: val };
    };

    const { prefix, number, suffix } = parseValue(value);

    const variants = {
        red: {
            bg: 'bg-[#FFF1F1]',
            iconBg: 'bg-[#FF5A45]',
            textColor: 'text-[#FF5A45]',
            trendColor: 'text-[#22C55E]'
        },
        green: {
            bg: 'bg-[#EBF9F1]',
            iconBg: 'bg-[#22AD5C]',
            textColor: 'text-[#22AD5C]',
            trendColor: 'text-[#22C55E]'
        },
        orange: {
            bg: 'bg-[#FFF8E7]',
            iconBg: 'bg-[#FFA000]',
            textColor: 'text-[#FFA000]',
            trendColor: 'text-[#22C55E]'
        },
        blue: {
            bg: 'bg-[#E7F3FF]',
            iconBg: 'bg-[#0085FF]',
            textColor: 'text-[#0085FF]',
            trendColor: 'text-[#22C55E]'
        }
    };

    const activeVariant = variants[variant] || variants.red;

    return (
        <div className={cn(
            "relative p-3 lg:p-6 rounded-2xl lg:rounded-[2.5rem] flex items-start justify-between shadow-sm transition-all hover:shadow-md animate-in fade-in slide-in-from-bottom-4 duration-500",
            activeVariant.bg,
            className
        )}>
            <div className="space-y-2 lg:space-y-4">
                <p className="text-[10px] lg:text-sm font-semibold text-slate-500/80 tracking-tight">
                    {label}
                </p>

                <div className="space-y-1">
                    <h3 className="text-xl lg:text-4xl font-extrabold text-slate-900 tracking-tighter">
                        <CountUp
                            start={0}
                            end={number}
                            duration={1.5}
                            decimals={number % 1 !== 0 ? 1 : 0}
                            prefix={prefix}
                            suffix={suffix}
                            useEasing={true}
                        />
                    </h3>

                    <div className="flex items-center gap-1.5 pt-1">
                        <span className={cn(
                            "flex items-center gap-0.5 text-[10px] lg:text-sm font-bold",
                            activeVariant.trendColor
                        )}>
                            {changeType === 'increase' ? (
                                <ArrowUp className="w-3.5 h-3.5" />
                            ) : (
                                <ArrowDown className="w-3.5 h-3.5" />
                            )}
                            {change}%
                        </span>
                        <span className="text-[10px] lg:text-sm font-medium text-slate-400">vs last month</span>
                    </div>
                </div>
            </div>

            <div className={cn(
                "p-2 lg:p-4 rounded-xl lg:rounded-3xl shadow-lg ring-2 lg:ring-4 ring-white/50 flex items-center justify-center text-white shrink-0",
                activeVariant.iconBg
            )}>
                <Icon className="w-4 h-4 lg:w-7 lg:h-7" />
            </div>
        </div>
    );
};
