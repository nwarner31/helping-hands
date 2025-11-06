import React, {createContext, useCallback, useContext, useRef, useState} from "react";

interface AccordionGroupContextValue {
    registerButton: (button: HTMLButtonElement) => number;
    focusButton: (index: number) => void;
    singleOpen: boolean;
    openIndex: number | null;
    setOpenIndex: (index: number | null) => void;
    getLastIndex: () => number;
}

const AccordionGroupContext = createContext<AccordionGroupContextValue | null>(null);

export const useAccordionGroup = () => {
    const ctx = useContext(AccordionGroupContext);
    if (!ctx) {
        throw new Error("Accordion must be used within an AccordionGroup");
    }
    return ctx;
};

interface AccordionGroupProps {
    children: React.ReactNode;
    singleOpen?: boolean; // 🔑 optional prop
}

export const AccordionGroup: React.FC<AccordionGroupProps> = ({ children, singleOpen = false }) => {
    const buttonsRef = useRef<(HTMLButtonElement)[]>([]);
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const registerButton = (button: HTMLButtonElement) => {
        if (button && !buttonsRef.current.includes(button)) {
            buttonsRef.current.push(button);
        }
        return buttonsRef.current.indexOf(button);
    };

    const focusButton = useCallback ((index: number) => {
        const btns = buttonsRef.current;
        if (btns.length === 0) return;
        let target = index;
        if (index < 0) target = btns.length - 1; // wrap
        else if (index >= btns.length) target = 0; // wrap


        btns[target]?.focus();
    }, []);

    const getLastIndex = useCallback(() => buttonsRef.current.length - 1, []);

    return (
        <AccordionGroupContext.Provider
            value={{ registerButton, focusButton, singleOpen, openIndex, setOpenIndex, getLastIndex}}
        >
            <div>{children}</div>
        </AccordionGroupContext.Provider>
    );
};
