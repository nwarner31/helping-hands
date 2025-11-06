import React, {useEffect, useRef} from "react";
import ReactDOM from "react-dom";
import {ButtonVariant} from "../Buttons/Buttons.utility";
import clsx from "clsx";

type ModalProps = {
    id?: string;
    title?: string;
    description?: string;
    headerVariant?: ButtonVariant;
    showCloseButton?: boolean;
    onClose: () => void;
    children: React.ReactNode;
};

const headerVariants: Record<ButtonVariant, string> = {
    primary: "bg-primary text-white",
    secondary: "bg-secondary text-white",
    danger: "bg-danger text-white",
    accent: "bg-accent text-white",
};

const Modal: React.FC<ModalProps> = ({ title, showCloseButton = true, headerVariant = "primary", onClose, id, description, children }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const lastFocusedElementRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        // Save focus before modal opens
        lastFocusedElementRef.current = document.activeElement as HTMLElement;

        const modal = modalRef.current;
        if (!modal) return;

        const focusableEls = modal.querySelectorAll<HTMLElement>(
            'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        const firstEl = focusableEls[0];
        const lastEl = focusableEls[focusableEls.length - 1];

        // Focus the first element when the modal opens
        if (firstEl) {
            firstEl.focus();
        } else {
            modal.setAttribute("tabindex", "-1"); // ✅ ensure it's focusable
            modal.focus();
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Tab") {
                if (e.shiftKey) {
                    // Shift + Tab → back
                    if (document.activeElement === firstEl) {
                        e.preventDefault();
                        lastEl?.focus();
                    }
                } else {
                    // Tab → forward
                    if (document.activeElement === lastEl) {
                        e.preventDefault();
                        firstEl?.focus();
                    }
                }
            }

            if (e.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
            // Restore focus to the trigger element
            lastFocusedElementRef.current?.focus();
        };
    }, [onClose]);

    const modalId = id ? `modal-${id}` : "modal";
    const titleId = title ? `${modalId}-title` : undefined;
    const descriptionId = description ? `${modalId}-description` : undefined;
    const backdropId = `${modalId}-backdrop`;

    return ReactDOM.createPortal(
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 flex justify-center items-center z-50"
             aria-modal="true"
             role="dialog"
             aria-labelledby={title ? titleId : undefined}
                aria-describedby={description ? descriptionId : undefined}
             id={backdropId}
             data-testid={backdropId}
             onClick={onClose}>
            <div className="bg-white rounded-lg shadow-md max-w-125 w-9/10 relative" id={modalId} data-testid={modalId} ref={modalRef} onClick={(e) => e.stopPropagation()}>
                {title && (
                    <h2 id={titleId} data-testid={titleId} className={clsx("text-lg font-semibold mb-2", headerVariants[headerVariant])} >
                        {title}
                    </h2>
                )}
                {description && (
                    <p id={descriptionId} data-testid={descriptionId} className="text-sm text-gray-600 mb-4">
                        {description}
                    </p>
                )}
                {showCloseButton && <button id={`${modalId}-close`} data-testid={`${modalId}-close`} type="button" className="absolute right-2 top-1 text-red-500 font-bold bg-white/50 rounded-full p-2 hover:bg-white" onClick={onClose}>
                    <span aria-hidden="true">X</span>
                    <span className="sr-only">Close dialog</span>
                </button>}
                {children}
            </div>
        </div>,
        document.body
    );
};

export default Modal;
