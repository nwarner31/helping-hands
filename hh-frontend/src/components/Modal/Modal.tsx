import React, {useEffect, useRef} from "react";
import {ButtonVariant} from "../Buttons/Buttons.utility";
import * as Dialog from "@radix-ui/react-dialog";
import Card from "../Cards/Card/Card";
import {clsx} from "clsx";

type ModalProps = {
    id?: string;
    title: string;
    description: string;
    headerVariant?: ButtonVariant;
    showCloseButton?: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
};

const headerVariants: Record<ButtonVariant, string> = {
    primary: "bg-primary text-white",
    secondary: "bg-secondary text-white",
    danger: "bg-danger text-white",
    accent: "bg-accent text-white",
    success: "bg-success text-white",
};

const Modal: React.FC<ModalProps> = ({ title, showCloseButton = true, headerVariant = "primary", onOpenChange, id, description, children }) => {
    const lastFocusedElementRef = useRef<HTMLElement | null>(null);

    const modalId = id ? `modal-${id}` : "modal"; // moved above effect so it can be referenced
    const titleId = title ? `${modalId}-title` : undefined;
    const descriptionId = description ? `${modalId}-description` : undefined;
    const backdropId = `${modalId}-backdrop`;

    useEffect(() => {
        lastFocusedElementRef.current = document.activeElement as HTMLElement;
        return () => {
            try { lastFocusedElementRef.current?.focus(); } catch {}
        };
    }, []);

return (
    <Dialog.Root open onOpenChange={onOpenChange}>
        <Dialog.Portal>
           <Dialog.Overlay className="fixed top-0 left-0 w-full h-full bg-black/50 flex justify-center items-center z-50" aria-modal="true" role="dialog" aria-labelledby={title ? titleId : undefined} aria-describedby={description ? descriptionId : undefined} id={backdropId} data-testid={backdropId} />
           <Dialog.Content asChild>
                <Card data-testid={modalId} className="z-100 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Dialog.Title className={clsx(headerVariants[headerVariant], "text-2xl font-header px-2 py-1")} data-testid={titleId}>{title}</Dialog.Title>
                    <Dialog.Description data-testid={descriptionId} className="mx-2">{description}</Dialog.Description>
                {showCloseButton &&
                    <Dialog.Close asChild>
                         <button className="text-gray-500 hover:text-gray-800 text-xl absolute right-2 top-1 bg-white/50 rounded-full px-1" aria-label="Close" data-testid={`${modalId}-close`}>
                            ✕
                         </button>
                    </Dialog.Close>}
                    {children}
                </Card>
           </Dialog.Content>
        </Dialog.Portal>
    </Dialog.Root>);
};

export default Modal;
