import React from "react";
import styles from "./DateInput.module.css";

interface DateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    containerClass?: string,
    error?: string
}

const DateInput: React.FC<DateInputProps> = ({ label, containerClass, error, ...props }) => {
    return (
        <div className={`${styles.inputContainer} ${containerClass}`}>
            <label htmlFor={`input-${props.name}`} className={styles.label}>{label}</label>
            <input id={`input-${props.name}`} type="date" className={`${styles.input}  ${error ? styles.inputError : ""}`} {...props} />
            {error && <p className={styles.errorText}>{error}</p>}
        </div>
    );
};

export default DateInput;
