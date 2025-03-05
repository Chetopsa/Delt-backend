import React from 'react';

export const Card = React.forwardRef(({ 
  className = '',
  children,
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={`rounded-lg border bg-white shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export const CardHeader = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`flex flex-col space-y-1.5 p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle = React.forwardRef(({ 
  className = '',
  children,
  ...props 
}, ref) => {
  return (
    <h3
      ref={ref}
      className={`font-semibold leading-none tracking-tight text-xl ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
});

CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef(({ 
  className = '',
  children,
  ...props 
}, ref) => {
  return (
    <p
      ref={ref}
      className={`text-sm text-gray-500 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
});

CardDescription.displayName = "CardDescription";

export const CardContent = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`flex items-center p-6 pt-0 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
