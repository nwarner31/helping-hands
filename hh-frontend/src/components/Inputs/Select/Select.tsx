import React from "react";
import styles from "./Select.module.css";

interface SelectOption {
    label: string;
    value: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    name: string;
    label: string;
    options: SelectOption[];
    value: string;
    error?: string;
    containerClass?: string
}

const Select: React.FC<SelectProps> = ({ name, label, options, value, error, className, containerClass, ...props }) => {
    return (
        <div className={containerClass}>
            <label htmlFor={name} className={styles.label}>{label}</label>
            <select id={name} name={name} value={value} {...props} className={`${styles.select} ${className ?? ""}`}>
                {options.map(({ value, label }) => (
                    <option key={value} value={value}>
                        {label}
                    </option>
                ))}
            </select>
            {error && <span className="error-text">{error}</span>}
        </div>
    );
};

export default Select;
