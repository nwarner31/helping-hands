import React from "react";
import clsx from "clsx";

interface RadioInputProps {
    className?: string;
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    variant?: "primary" | "secondary" | "accent";
    isChecked: boolean;
    error?: string;
}
const RadioInput = ({label, onChange, value, name, isChecked, className, variant="primary", error}: RadioInputProps) => {
    const variantClasses: Record<NonNullable<RadioInputProps["variant"]>, string> = {
        primary: "peer-checked:border-primary text-primary peer-focus:ring-primary",
        secondary: "peer-checked:border-secondary text-secondary peer-focus:ring-secondary",
        accent: "peer-checked:border-accent text-accent peer-focus:ring-accent",
    };
    return (
        <div className={clsx("flex flex-col", className)}>
            <label className="inline-flex items-center justify-center cursor-pointer gap-x-1">
                <input
                    type="radio"
                    name={name}
                    value={value}
                    checked={isChecked}
                    onChange={onChange}
                    aria-invalid={!!error}
                    aria-describedby={error ? `error-${name}` : undefined}
                    className="peer absolute opacity-0 w-0 h-0" />
                <span data-testid={`radio-${name}`} className={clsx("w-5 h-5 rounded-full bg-white border-2 flex items-center justify-center peer-focus:ring-2 peer-focus:ring-offset-2", variantClasses[variant])}>
                 <span className={clsx("w-2.5 h-2.5 rounded-full ", isChecked ? "bg-current" : "bg-transparent" )}></span>
            </span>
                {label}
            </label>
            {error && <p className="text-red-500 text-sm mt-1" role="alert" id={`error-${name}`}>{error}</p>}
        </div>

    );
}

export default RadioInput;