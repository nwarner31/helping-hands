import React, {useEffect, useRef, useState} from "react";
import clsx from "clsx";
import {ButtonVariant} from "../Buttons/Buttons.utility";
import {useAccordionGroup} from "./AccordionGroup";

interface AccordionProps {
    id: string;
    header: string;
    className?: string;
    variant?: keyof typeof variantClasses;
    children?: React.ReactNode;
    childrenClassName?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
    primary: "bg-primary text-white",
    secondary: "bg-secondary text-white",
    danger: "bg-danger text-white",
    accent: "bg-accent text-white",
};
const focusVariant: Record<ButtonVariant, string> = {
    primary: "focus:outline-cyan-200",
    secondary: "focus:outline-emerald-900",
    danger: "focus:outline-red-900",
    accent: "focus:outline-orange-800",
};

const Accordion: React.FC<AccordionProps> = ({ id, header, variant = "primary", children, className, childrenClassName }) => {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const headerId = `accordion-header-${id}`;
    const panelId = `accordion-panel-${id}`;
    // Safe group context
    let group: ReturnType<typeof useAccordionGroup> | null = null;
    try {
        group = useAccordionGroup();
    } catch {
        group = null; // no group, fall back to local state
    }

    const [index, setIndex] = useState<number>(-1);


    // register button with group if in a group
    useEffect(() => {
        if (group  && buttonRef.current) {
            const idx = group.registerButton(buttonRef.current);
            setIndex(idx);
        }
    }, [group]);

    // sync with group if in singleOpen mode
    useEffect(() => {
        if (group?.singleOpen) {
            setIsOpen(group.openIndex === index);
        }
    }, [group?.openIndex, group?.singleOpen, index]);

    const toggle = () => {
        if (group?.singleOpen) {
            group.setOpenIndex(isOpen ? null : index);
        } else {
            setIsOpen((prev) => !prev);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (!group) return;
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                group.focusButton(index + 1);
                break;
            case "ArrowUp":
                e.preventDefault();
                group.focusButton(index - 1);
                break;
            case "Home":
                e.preventDefault();
                group.focusButton(0);
                break;
            case "End":
                e.preventDefault();
                group.focusButton(group.getLastIndex());
                break;
        }
    };


    return (
        <div className={clsx("rounded-xl ", variantClasses[variant], isOpen && "pb-2", className)} data-testid={`accordion-${id}`}>
            <button
                id={headerId}
                aria-expanded={isOpen}
                ref={buttonRef}
                aria-controls={panelId}
                className={clsx("w-full p-3 text-xl font-bold cursor-pointer text-left text-white border-0 bg-transparent font-header rounded-xl focus-visible:outline-3 z-50", focusVariant[variant])}
                onClick={toggle}
                onKeyDown={handleKeyDown}
                type="button"
                data-testid={`accordion-button-${id}`}>
                {header}
            </button>

                <div
                    id={panelId}
                    role="region"
                    aria-hidden={!isOpen}
                    aria-labelledby={headerId}
                    data-testid={`accordion-panel-${id}`}
                    className={clsx("transition-max-h duration-500 rounded-xl bg-neutral-50 mx-2 px-3 text-black overflow-hidden font-body font-normal motion-reduce:transition-none",
                        isOpen ? "max-h-200 mb-3 mt-1 py-3": "max-h-0 mb-0",
                        childrenClassName)}>
                    {children}
                </div>
        </div>
    );
};

export default Accordion;
