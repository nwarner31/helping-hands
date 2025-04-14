import React, { useState } from "react";
import styles from "./PasswordInput.module.css";

interface PasswordInputProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string
}

const PasswordInput: React.FC<PasswordInputProps> = ({ label, name, value, onChange, error }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className={styles.inputContainer}>
            <div className={`${styles.inputWrapper} ${isFocused || value ? styles.active : ""}`}>
                <label htmlFor={`input-${name}`} className={styles.label}>{label}</label>
                <input
                    id={`input-${name}`}
                    type={showPassword ? "text" : "password"}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={styles.input}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.toggleButton}
                >
                    {showPassword ? "🙈" : "👁️"}
                </button>
            </div>
            {error && <p className={styles.errorText}>{error}</p>}
        </div>
    );
};

export default PasswordInput;
