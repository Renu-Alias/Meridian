// src/components/Skeleton.tsx
import React from "react";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  rounded?: "none" | "sm" | "md" | "lg" | "full";
}

export const Skeleton: React.FC<SkeletonProps> = ({ width = "100%", height = "1rem", className = "", rounded = "md" }) => {
  const roundedClass = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  }[rounded];
  return (
    <div
      className={`bg-surface animate-shimmer ${roundedClass} ${className}`}
      style={{ width, height }}
    ></div>
  );
};
