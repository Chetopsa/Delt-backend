import React, { useState } from 'react';

export const Button = React.forwardRef(({ 
  className = '',
  variant = 'default',
  size = 'default',
  loading = false,
  disabled = false,
  children,
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-500 disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    default: "bg-green-500 text-white shadow hover:bg-green-600",
    outline: "border border-green-500 bg-transparent hover:bg-green-50 text-green-500",
    ghost: "hover:bg-green-50 text-green-500",
    link: "text-green-500 underline-offset-4 hover:underline"
  };

  const sizes = {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-sm",
    lg: "h-10 rounded-md px-8",
    icon: "h-9 w-9"
  };

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <span className="mr-2 animate-spin">⌛</span>
      )}
      {children}
    </button>
  );
});
