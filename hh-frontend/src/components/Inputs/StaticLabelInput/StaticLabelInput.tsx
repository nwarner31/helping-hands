import React from "react";
import clsx from "clsx";

interface StaticLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    containerClass?: string,
    name: string;
    error?: string
    type: "date" | "month" | "time" | "number",
    errorOnBaseline?: boolean
}

const StaticLabelInput: React.FC<StaticLabelInputProps> = ({ label, containerClass, error, type, errorOnBaseline = true, name, ...props }) => {
    const errorId = error ? `error-${name}` : undefined;
    return (
        <div data-testid={`input-container-${name}`} className={clsx("flex flex-col relative", containerClass)}>
            <label htmlFor={`input-${name}`} className="text-sm">{label}</label>
            <input
                id={`input-${name}`}
                type={type}
                aria-invalid={!!error}
                aria-describedby={errorId}
                data-testid={`input-${name}`}
                name={name}
                className={clsx("w-full border-0 border-b-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary", error && "border-red-500 focus:border-red-500 focus:ring-red-500", props.className)}
                {...props} />
            {error &&
                <p id={errorId}
                         role="alert"
                         className={clsx("text-red-600 text-sm mt-1", errorOnBaseline ? "absolute bottom-0.5 right-5" : "text-right" )}>
                {error}
            </p>}
        </div>
    );
};

export default StaticLabelInput;
