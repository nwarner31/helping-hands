import React from "react";
import {ButtonVariant} from "../../Buttons/Buttons.utility";
import clsx from "clsx";

interface CardProps extends React.HTMLAttributes<HTMLDivElement>  {
    header?: string;
    headerVariant?: keyof typeof variantClasses;
    breakpoint?: "xs" | "sm" | "md" | "md-lg" | "lg" | "xl";
    isRounded?: boolean;
    isAriaHeader?: boolean;
    ariaLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
    primary: "bg-primary text-white",
    secondary: "bg-secondary text-white",
    danger: "bg-danger text-white",
    success: "bg-success text-white",
    accent: "bg-accent text-white",
};

const breakpointClasses: Record<string, string> = {
    xs: "rounded-none shadow-none xs:rounded-xl xs:shadow-md",
    sm: "rounded-none shadow-none sm:rounded-xl sm:shadow-md",
    md: "rounded-none shadow-none md:rounded-xl md:shadow-md",
    "md-lg": "rounded-none shadow-none md-lg:rounded-xl md-lg:shadow-md",
    lg: "rounded-none shadow-none lg:rounded-xl lg:shadow-md",
    xl: "rounded-none shadow-none xl:rounded-xl xl:shadow-md",
};

const Card: React.FC<CardProps> = ({
                                       header,
                                       headerVariant = "primary",
                                        isRounded = true,
                                        breakpoint,
    isAriaHeader = false,
                                        ariaLevel = 2,
                                       children,
                                        className,
    id,
                                        ...props
                                   }) => {
    return (
        <div className={clsx("bg-slate-100 overflow-hidden", breakpoint ? breakpointClasses[breakpoint]: "rounded-xl shadow-md", className)}
             data-testid={id ? `card-${id}` : "card-container"} {...props}>
            {header && (
                <div
                    className={clsx("px-3 py-4 font-header font-bold text-lg", variantClasses[headerVariant], )}
                    {...(isAriaHeader ? { role: "heading", "aria-level": ariaLevel } : {})}
                data-testid={id ? `card-header-${id}` : "card-header"}>
                    {header}
                </div>
            )}
            {children}
        </div>
    );
};

export default Card;
