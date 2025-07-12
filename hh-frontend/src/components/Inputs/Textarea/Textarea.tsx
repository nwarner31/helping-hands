import React from "react";
import styles from "./Textarea.module.css";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    containerClass?: string;
    error?: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, containerClass, error, ...props }) => {
    return (
        <div className={`${styles.textareaContainer} ${containerClass || ""}`}>
            <label htmlFor={`textarea-${props.name}`} className={styles.label}>{label}</label>
            <textarea
                id={`textarea-${props.name}`}
                className={`${styles.textarea} ${error ? styles.textareaError : ""}`}
                {...props}
            />
            {error && <p className={styles.errorText}>{error}</p>}
        </div>
    );
};

export default Textarea;
