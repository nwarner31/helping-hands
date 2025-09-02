import React from "react";
import styles from "./StaticLabelInput.module.css";
import clsx from "clsx";

interface StaticLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    containerClass?: string,
    error?: string
    type: "date" | "month" | "time" | "number",
    errorOnBaseline?: boolean
}

const StaticLabelInput: React.FC<StaticLabelInputProps> = ({ label, containerClass, error, type, errorOnBaseline = true, ...props }) => {
    return (
        <div className={`${styles.inputContainer} ${containerClass}`}>
            <label htmlFor={`input-${props.name}`} className={styles.label}>{label}</label>
            <input id={`input-${props.name}`} type={type} className={`${styles.input}  ${error ? styles.inputError : ""}`} {...props} />
            {error && <p className={clsx("text-red-600 text-sm mt-1", errorOnBaseline ? "absolute top-2 right-10" : "text-right" )}>{error}</p>}
        </div>
    );
};

export default StaticLabelInput;
