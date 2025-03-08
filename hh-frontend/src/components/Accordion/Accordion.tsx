import React, { useState, useRef, useEffect } from "react";
import styles from "./Accordion.module.css";

interface AccordionProps {
    header: string;
    variant: "primary" | "secondary" | "accent";
    children: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({ header, variant, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [height, setHeight] = useState("0px");
    const contentRef = useRef<HTMLDivElement>(null);
    const [marginBottom, setMarginBottom] = useState("0px");

    useEffect(() => {
        if (isOpen) {
            setHeight(`${contentRef.current?.scrollHeight}px`);
            setMarginBottom("10px");
        } else {
            setHeight("0px");
            setMarginBottom("0px");
        }
    }, [isOpen]);

    return (
        <div className={`${styles.accordion} ${styles[variant]}`}>
            <button className={styles.header} onClick={() => setIsOpen(!isOpen)}>
                {header}
            </button>
            <div
                ref={contentRef}
                className={styles.body}
                style={{ height, marginBottom }}
            >
                <div className={styles.bodyContent}>{children}</div>
            </div>
        </div>
    );
};

export default Accordion;
