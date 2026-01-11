import React from 'react';

interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    variant?: 'text' | 'circular' | 'rectangular';
}

const Skeleton = ({ className = '', width, height, variant = 'rectangular' }: SkeletonProps) => {
    const baseClasses = "animate-pulse bg-gray-200";

    let variantClasses = "";
    if (variant === 'circular') {
        variantClasses = "rounded-full";
    } else if (variant === 'text') {
        variantClasses = "h-4 rounded w-full"; // Default text height
    } else {
        variantClasses = "rounded-md";
    }

    const style: React.CSSProperties = {};
    if (width) style.width = width;
    if (height) style.height = height;

    return (
        <div
            className={`${baseClasses} ${variantClasses} ${className}`}
            style={style}
        />
    );
};

export default Skeleton;
