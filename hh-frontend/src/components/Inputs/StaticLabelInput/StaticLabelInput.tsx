import React from "react";
import styles from "./StaticLabelInput.module.css";

interface StaticLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    containerClass?: string,
    error?: string
    type: "date" | "time" | "number"
}

const StaticLabelInput: React.FC<StaticLabelInputProps> = ({ label, containerClass, error, type, ...props }) => {
    return (
        <div className={`${styles.inputContainer} ${containerClass}`}>
            <label htmlFor={`input-${props.name}`} className={styles.label}>{label}</label>
            <input id={`input-${props.name}`} type={type} className={`${styles.input}  ${error ? styles.inputError : ""}`} {...props} />
            {error && <p className={styles.errorText}>{error}</p>}
        </div>
    );
};

export default StaticLabelInput;
