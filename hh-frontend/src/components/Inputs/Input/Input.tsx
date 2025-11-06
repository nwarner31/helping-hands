import React, {useEffect, useState} from "react";
import clsx from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    name: string;
    error?: string;
    containerClassName?: string;
}

const Input: React.FC<InputProps> = ({ label, error, name, containerClassName, ...props }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasText, setHasText] = useState(!!(props.value ?? props.defaultValue));

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        if(props.onFocus) {
            props.onFocus(e);
        }
    }
    useEffect(() => {
        setHasText(!!(props.value ?? props.defaultValue));
    }, [props.value, props.defaultValue]);

    const handleBlur = () => setIsFocused(false);

    const updateValue = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHasText(!!e.target.value); // Update internal state
        if (props.onChange) {
            props.onChange(e); // Forward event to parent component
        }
    }

    return (
        <div className={clsx("relative", containerClassName)}>
            <label data-testid={`label-${name}`} className={clsx("absolute transition-all duration-300 cursor-text", (isFocused || hasText) ? "text-sm text-primary -translate-y-5" : "translate-y-0")} htmlFor={`input-${name}`} >{label}</label>
            <input
                {...props}
                id={`input-${name}`}
                data-testid={`input-${name}`}
                className={clsx("w-full bg-transparent outline-0 border-b-2", error && "border-red-500", props.className)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={updateValue}
                aria-invalid={!!error}
                aria-describedby={error ? `error-${name}` : undefined}
                name={name}
            />
            {error && <p id={`error-${name}`} data-testid={`error-${name}`} role="alert" className="text-red-500 text-sm absolute right-0 top-0.5">{error}</p>}
        </div>
    );
};

export default Input;