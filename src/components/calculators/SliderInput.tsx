'use client';

import React from 'react';

interface SliderInputProps {
    label: string;
    value: number;
    onChange: (val: number) => void;
    min: number;
    max: number;
    step?: number;
    prefix?: string;
    suffix?: string;
}

export const SliderInput: React.FC<SliderInputProps> = ({
    label,
    value,
    onChange,
    min,
    max,
    step = 1,
    prefix = '',
    suffix = ''
}) => {
    return (
        <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-medium text-foreground">{label}</label>

                {/* Value Badge - Groww Style (Soft Green background) */}
                <div className="flex items-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-3 py-1 rounded-sm min-w-[100px] justify-end">
                    <span className="text-sm">{prefix}</span>
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => {
                            const val = Number(e.target.value);
                            if (!isNaN(val) && val >= 0) onChange(val);
                        }}
                        className="w-full bg-transparent border-none text-right text-lg font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none ml-1 appearance-none p-0"
                    />
                    <span className="text-xs ml-1 pt-1 opacity-80">{suffix}</span>
                </div>
            </div>

            <div className="relative h-6 flex items-center group">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="w-full absolute z-20 opacity-0 cursor-pointer h-full"
                />

                {/* Track Background */}
                <div className="w-full h-1 bg-secondary rounded-full overflow-hidden absolute z-10">
                    {/* Active Track - Green */}
                    <div
                        className="h-full bg-emerald-500 transition-all duration-75 ease-out"
                        style={{ width: `${((value - min) / (max - min)) * 100}%` }}
                    />
                </div>

                {/* Thumb Visual - Simple Circle */}
                <div
                    className="h-4 w-4 bg-background border-2 border-emerald-500 rounded-full absolute z-10 shadow-md pointer-events-none transition-all duration-75 ease-out"
                    style={{
                        left: `calc(${((value - min) / (max - min)) * 100}% - 8px)`
                    }}
                />
            </div>
        </div>
    );
};
