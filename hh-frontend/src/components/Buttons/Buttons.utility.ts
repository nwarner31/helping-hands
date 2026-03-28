import clsx from "clsx";

export type ButtonVariant = "primary-light" | "primary" | "primary-dark" | "secondary" | "danger" | "success" | "accent" | "ghost-primary";

const baseClasses = "font-header font-bold py-2 px-4 rounded transition-colors duration-300 border-2 border-solid flex items-center justify-center focus-visible:outline-3 focus-visible:outline-offset-0";

const variantClasses: Record<ButtonVariant, string> = {
    "primary-light": "bg-primary-300 text-white hover:bg-white hover:text-primary-300 border-primary-300 focus:outline-outline-primary-300",
    primary: "bg-primary-500 text-white hover:bg-white hover:text-primary-500 border-primary-500 focus:outline-outline-primary-500",
    "primary-dark": "bg-primary-700 text-white hover:bg-white hover:text-primary-700 border-primary-700 focus:outline-outline-primary-700",
    secondary: "bg-secondary text-white hover:bg-white hover:text-secondary border-secondary focus:outline-outline-secondary",
    danger: "bg-danger text-white hover:bg-white hover:text-danger border-danger focus:outline-outline-danger",
    success: "bg-success text-white hover:bg-white hover:text-success border-success focus:outline-success",
    accent: "bg-accent text-white hover:bg-white hover:text-accent border-accent focus:outline-outline-accent",
    "ghost-primary": "bg-transparent text-primary-500 hover:bg-primary-300 hover:text-primary-900 border-primary-500 focus:outline-outline-primary-500",
};

export const getButtonClasses = (variant: ButtonVariant, className?: string) => {
    return clsx( baseClasses, variantClasses[variant], className);
}