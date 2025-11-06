import React from "react";
import {ButtonVariant, getButtonClasses} from "../Buttons.utility";


interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
}

const Button: React.FC<ButtonProps> = ({
                                           variant = "primary",
                                           children,
                                            className,
                                           ...props
                                       }) => {
    return (
        <button
            className={getButtonClasses(variant, className)}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
