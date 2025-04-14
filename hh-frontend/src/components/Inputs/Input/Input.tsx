import React, { useState } from "react";
import styles from "./Input.module.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string
}

const Input: React.FC<InputProps> = ({ label, error, name, ...props }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasText, setHasText] = useState(false);

    const handleFocus = () => setIsFocused(true);


    const handleBlur = () => setIsFocused(false);

    const updateValue = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHasText(!!e.target.value); // Update internal state
        if (props.onChange) {
            props.onChange(e); // Forward event to parent component
        }
    }

    return (
        <div className={`${styles.inputContainer} ${isFocused || hasText ? styles.active : ""}  ${error ? styles.inputError : ""}`}>
            <label className={styles.label} htmlFor={`input-${name}`}>{label}</label>
            <input
                {...props}
                id={`input-${name}`}
                className={`${styles.input} ${props.className ? props.className : ''} `}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={updateValue}
                name={name}
            />
            {error && <p className={styles.errorText}>{error}</p>}
        </div>
    );
};

export default Input;
