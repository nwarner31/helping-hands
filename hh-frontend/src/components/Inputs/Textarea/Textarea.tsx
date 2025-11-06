import React from "react";
import clsx from "clsx";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    name: string;
    containerClass?: string;
    error?: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, name, containerClass, error, className, ...props }) => {
    return (
        <div className={ containerClass}>
            <label htmlFor={`textarea-${name}`} className="text-sm">{label}</label>
            <textarea
                id={`textarea-${name}`}
                aria-describedby={error ? `error-${name}` : undefined}
                aria-invalid={!!error}
                data-testid={`textarea-${name}`}
                name={name}
                className={clsx("outline-0 border-1  rounded-lg resize-y disabled:bg-gray-200 disabled:cursor-not-allowed read-only:bg-gray-100", error ? "border-red-500" : "border-gray-800 focus:border-primary", className)}
                {...props}
            />
            {error && <p id={`error-${name}`} data-testid={`error-${name}`} className="text-xs text-red-500">{error}</p>}
        </div>
    );
};

export default Textarea;
