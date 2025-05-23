import React from "react";
import styles from "./Button.module.css";

type ButtonVariant = "primary" | "secondary" | "danger" | "accent";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    borderWidth?: string;
}

const Button: React.FC<ButtonProps> = ({
                                           variant = "primary",
                                           borderWidth = "3px",
                                           children,
                                            className,
                                           ...props
                                       }) => {
    return (
        <button
            className={`${styles.button} ${styles[variant]} ${className}`}
            style={{ borderWidth }}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
