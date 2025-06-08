import styles from "./RadioInput.module.css";
import React from "react";

interface RadioInputProps {
    className?: string;
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    variant?: "primary" | "secondary" | "accent";
    isChecked: boolean;
}
const RadioInput = ({label, onChange, value, name, isChecked, className, variant="primary"}: RadioInputProps) => {
    return (
        <label className={`${styles["radio-label"]} ${className ?? ""}`}><input type="radio" name={name} value={value} checked={isChecked} onChange={onChange} className={styles["radio-input"]} /><span className={`${styles.checkmark} ${styles[`checkmark-${variant}`]}`}></span>{label}</label>
    );
}

export default RadioInput;