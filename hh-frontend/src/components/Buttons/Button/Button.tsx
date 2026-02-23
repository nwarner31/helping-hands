import React from "react";
import {ButtonVariant, getButtonClasses} from "../Buttons.utility";
import {clsx} from "clsx";


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
            className={clsx(getButtonClasses(variant, className), "cursor-pointer disabled:bg-gray-500 disabled:border-gray-500 disabled:hover:bg-white disabled:cursor-not-allowed  disabled:opacity-70 disabled:hover:text-gray-500")}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
