import React from "react";
import clsx from "clsx";

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
    const errorId = error ? `error-${name}` : undefined;
    return (
        <div className={clsx("flex flex-col", containerClass)}>
            <label htmlFor={name} className="text-sm mb-2">{label}</label>
            <select
                id={name}
                name={name}
                value={value}
                {...props}
                aria-invalid={!!error}
                aria-describedby={errorId}
                className={clsx( "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
                    error && "border-red-500 focus:ring-red-500 focus:border-red-500", className)}>
                {options.map(({ value, label }) => (
                    <option key={value} value={value}>
                        {label}
                    </option>
                ))}
            </select>
            {error && <span id={errorId} role="alert" className="text-red-500 text-sm mt-1">{error}</span>}
        </div>
    );
};

export default Select;