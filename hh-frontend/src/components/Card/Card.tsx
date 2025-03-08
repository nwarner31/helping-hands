import React from "react";
import styles from "./Card.module.css";

interface CardProps extends React.HTMLAttributes<HTMLDivElement>  {
    header?: string;
    headerBgColor?: string;
    headerTextColor?: string;
    children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
                                       header,
                                       headerBgColor = "#2c3e50", // Default header background
                                       headerTextColor = "white",  // Default text color
                                       children,
                                        className,
                                        ...props
                                   }) => {
    return (
        <div className={`${styles.card} ${className || ""}`} {...props}>
            {header && (
                <div
                    className={styles.header}
                    style={{ backgroundColor: headerBgColor, color: headerTextColor }}
                >
                    {header}
                </div>
            )}
            {children}
        </div>
    );
};

export default Card;
