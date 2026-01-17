import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '',
  onClick,
  ...props 
}) => {
  console.log('[Button] Rendering button:', {
    variant,
    fullWidth,
    disabled: props.disabled,
    hasOnClick: !!onClick
  });

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('[Button] ===== BUTTON CLICKED =====');
    console.log('[Button] Button clicked:', {
      variant,
      children: typeof children === 'string' ? children : 'Component',
      disabled: props.disabled
    });
    
    if (props.disabled) {
      console.warn('[Button] Button is disabled, onClick will not fire');
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    if (onClick) {
      console.log('[Button] Calling onClick handler...');
      try {
        onClick(e);
        console.log('[Button] onClick handler executed successfully');
      } catch (error) {
        console.error('[Button] ERROR in onClick handler:', error);
      }
    } else {
      console.warn('[Button] No onClick handler provided!');
    }
  };

  const baseStyles = "py-3 px-6 rounded-2xl font-bold transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md";
  
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200",
    secondary: "bg-teal-500 text-white hover:bg-teal-600 shadow-teal-200",
    outline: "border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50",
    danger: "bg-red-500 text-white hover:bg-red-600"
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthStyle} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};