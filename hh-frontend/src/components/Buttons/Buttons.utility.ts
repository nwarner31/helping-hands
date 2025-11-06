import clsx from "clsx";

export type ButtonVariant = "primary" | "secondary" | "danger" | "accent";

const baseClasses = "font-header font-bold py-2 px-4 rounded transition-colors duration-300 border-2 border-solid flex items-center justify-center focus-visible:outline-3 focus-visible:outline-offset-0";

const variantClasses: Record<ButtonVariant, string> = {
    primary: "bg-primary text-white hover:bg-white hover:text-primary border-primary focus:outline-outline-primary",
    secondary: "bg-secondary text-white hover:bg-white hover:text-secondary border-secondary focus:outline-outline-secondary",
    danger: "bg-danger text-white hover:bg-white hover:text-danger border-danger focus:outline-outline-danger",
    accent: "bg-accent text-white hover:bg-white hover:text-accent border-accent focus:outline-outline-accent",
};

export const getButtonClasses = (variant: ButtonVariant, className?: string) => {
    return clsx(baseClasses, variantClasses[variant], className);
}