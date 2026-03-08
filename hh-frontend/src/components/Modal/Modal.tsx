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
    success: "bg-success text-white",
};

const Modal: React.FC<ModalProps> = ({ title, showCloseButton = true, headerVariant = "primary", onClose, id, description, children }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const lastFocusedElementRef = useRef<HTMLElement | null>(null);
    const currentFocusedInsideRef = useRef<HTMLElement | null>(null);

    const modalId = id ? `modal-${id}` : "modal"; // moved above effect so it can be referenced
    const titleId = title ? `${modalId}-title` : undefined;
    const descriptionId = description ? `${modalId}-description` : undefined;
    const backdropId = `${modalId}-backdrop`;

    useEffect(() => {
        // Save focus before modal opens
        lastFocusedElementRef.current = document.activeElement as HTMLElement;

        const modal = modalRef.current;
        if (!modal) return;

        // Helper to get focusable elements inside modal (includes the close button if present)
        const getFocusableEls = () => {
            const nodeList = modal.querySelectorAll<HTMLElement>(
                'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
            );
            // filter out disabled/hidden
            return Array.from(nodeList).filter(el => {
                if (!el) return false;
                if ((el as HTMLButtonElement).disabled) return false;
                if (el.getAttribute("aria-hidden") === "true") return false;
                // visible check
                if (el instanceof HTMLElement) {
                    const rect = el.getBoundingClientRect();
                    if (rect.width === 0 && rect.height === 0) return false;
                }
                return true;
            });
        };

        // If something inside the modal already has focus, don't override it
        const active = document.activeElement as HTMLElement | null;
        if (active && modal.contains(active)) {
            currentFocusedInsideRef.current = active;
        } else {
            // Prefer an input-like element on initial focus, otherwise fallback to the first focusable (which may be the close button)
            const focusableEls = getFocusableEls();
            const firstInputLike = focusableEls.find(el => {
                const t = el.tagName.toLowerCase();
                if (t === 'input' || t === 'textarea' || t === 'select') return true;
                // also match common input types
                try {
                    return el.matches && el.matches('input[type="text"], input[type="email"], input[type="password"], input[type="search"], input[type="tel"], input[type="url"]');
                } catch {
                    return false;
                }
            });
            const firstEl = firstInputLike ?? focusableEls[0];

            if (firstEl) {
                try { firstEl.focus(); } catch { /* ignore focus errors */ }
                currentFocusedInsideRef.current = firstEl;
            } else {
                // make modal focusable and focus it
                modal.setAttribute("tabindex", "-1");
                try { modal.focus(); } catch {}
            }
        }

        // Update the ref whenever focus moves inside the modal
        const onFocusIn = (e: FocusEvent) => {
            const target = e.target as HTMLElement | null;
            if (target && modal.contains(target)) {
                currentFocusedInsideRef.current = target;
            }
        };

        // When focus leaves the modal (briefly during remounts), restore the last focused element inside the modal
        const onFocusOut = () => {
            setTimeout(() => {
                const nowActive = document.activeElement as HTMLElement | null;
                if (!nowActive || !modal.contains(nowActive)) {
                    const restore = currentFocusedInsideRef.current;
                    if (restore && document.contains(restore) && modal.contains(restore)) {
                        try { restore.focus(); } catch {}
                    } else {
                        // fallback to first input-like or first focusable
                        const focusableEls = getFocusableEls();
                        const firstInputLike = focusableEls.find(el => {
                            const t = el.tagName.toLowerCase();
                            if (t === 'input' || t === 'textarea' || t === 'select') return true;
                            try {
                                return el.matches && el.matches('input[type="text"], input[type="email"], input[type="password"]');
                            } catch {
                                return false;
                            }
                        });
                        const firstEl = firstInputLike ?? focusableEls[0];
                        if (firstEl) {
                            try { firstEl.focus(); } catch {}
                            currentFocusedInsideRef.current = firstEl;
                        } else {
                            try { modal.setAttribute("tabindex", "-1"); modal.focus(); } catch {}
                        }
                    }
                }
            }, 0);
        };

        // Defer initial focus to the next tick so children finish mounting (fixes JSDOM/test race)
        const initFocusTimer = setTimeout(() => {
            if (modal.contains(document.activeElement as HTMLElement)) {
                currentFocusedInsideRef.current = document.activeElement as HTMLElement;
                return;
            }
            const focusableEls = getFocusableEls();
            const firstInputLike = focusableEls.find((el) => {
                const t = el.tagName.toLowerCase();
                if (t === "input" || t === "textarea" || t === "select") return true;
                if (el.matches && el.matches('input[type="text"], input[type="email"], input[type="password"], input[type="search"], input[type="tel"], input[type="url"]')) return true;
                return false;
            });
            const firstEl = firstInputLike ?? focusableEls[0];
            if (firstEl) {
                try {
                    firstEl.focus();
                    currentFocusedInsideRef.current = firstEl;
                } catch {}
            } else {
                try {
                    modal.setAttribute("tabindex", "-1");
                    modal.focus();
                } catch {}
            }
        }, 0);

        // Trap Tab/Shift+Tab within the modal. We calculate focusable elements fresh on each Tab press
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Tab") {
                const focusableEls = getFocusableEls();
                if (focusableEls.length === 0) {
                    e.preventDefault();
                    return;
                }

                const first = focusableEls[0];
                const last = focusableEls[focusableEls.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === first || !modal.contains(document.activeElement as HTMLElement)) {
                        e.preventDefault();
                        last.focus();
                    }
                } else {
                    if (document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            }

            if (e.key === "Escape") {
                onClose();
            }
        };

        modal.addEventListener('focusin', onFocusIn);
        modal.addEventListener('focusout', onFocusOut);
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            clearTimeout(initFocusTimer);
            modal.removeEventListener('focusin', onFocusIn);
            modal.removeEventListener('focusout', onFocusOut);
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = "";
            // Restore focus to the trigger element
            try { lastFocusedElementRef.current?.focus(); } catch {}
        };
    }, [onClose, modalId]);

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
