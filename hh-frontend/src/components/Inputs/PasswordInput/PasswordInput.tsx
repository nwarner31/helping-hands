import React, {useEffect, useState} from "react";
import clsx from "clsx";

interface PasswordInputProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
    containerClassName?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ label, name, value, onChange, error, onFocus, containerClassName }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasText, setHasText] = useState(!!(value));
    const [showPassword, setShowPassword] = useState(false);

    const focusHandler = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        if (onFocus) {
            onFocus(e);
        }
    }
    useEffect(() => {
        setHasText(!!(value));
    }, [value]);
    const updateValue = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHasText(!!e.target.value); // Update internal state
        if (onChange) {
            onChange(e); // Forward event to parent component
        }
    }
    return (
        <div className={clsx("relative", containerClassName)}>

                <label data-testid={`label-${name}`} htmlFor={`input-${name}`} className={clsx("absolute transition-all duration-300 cursor-text left-0", (isFocused || hasText) ? "text-sm text-primary -translate-y-1" : "translate-y-4")}>{label}</label>
            <div className={clsx("flex relative border-b-2", error ? "border-red-500" : "border-slate-800 focus-within:border-primary")}>
                <input
                    id={`input-${name}`}
                    data-testid={`input-${name}`}
                    type={showPassword ? "text" : "password"}
                    name={name}
                    value={value}
                    onChange={updateValue}
                    onFocus={focusHandler}
                    onBlur={() => setIsFocused(false)}
                    className="flex-grow bg-transparent outline-0 text-lg -mb-4"
                    aria-invalid={!!error}
                    aria-describedby={error ? `error-${name}` : undefined}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="border-0 bg-transparent p-2 text-lg focus:outline-2 focus:outline-primary rounded"
                >
                    {showPassword ? "🙈" : "👁️"}
                </button>
            </div>
            {error && <p id={`error-${name}`} data-testid={`error-${name}`} role="alert" className="text-right text-sm text-red-500">{error}</p>}
        </div>
    );
};

export default PasswordInput;
