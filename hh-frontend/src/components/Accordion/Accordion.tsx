import React, { useState } from "react";
import styles from "./Accordion.module.css";

interface AccordionProps {
    header: string;
    className?: string;
    variant?: "primary" | "secondary" | "accent";
    children?: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({ header, variant = "primary", children, className }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`${styles.accordion} ${styles[variant]} ${className}`}>
            <button className={styles.header} onClick={() => setIsOpen(prevState => !prevState)}>
                {header}
            </button>
            <div
                className={`${styles.body} ${isOpen ? styles.bodyOpen : ''}`}

            >
                <div className={styles.bodyContent}>{children}</div>
            </div>
        </div>
    );
};

export default Accordion;
