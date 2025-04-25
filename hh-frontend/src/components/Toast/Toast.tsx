import React, { ReactNode } from "react";
import styles from "./Toast.module.css";

type ToastProps = {
    type?: "success" | "error" | "info";
    vertical?: "top" | "center" | "bottom";
    horizontal?: "left" | "center" | "right";
    header?: string;
    children: ReactNode;
};

const Toast: React.FC<ToastProps> = ({
                                         type = "info",
                                         vertical = "top",
                                         horizontal = "right",
                                         header,
                                         children}) => {
    const typeClass = `toast-${type}`;

    return (
        <div className={`${styles['toast-container']}  ${styles[`hor-${horizontal}`]} ${styles[`vert-${vertical}`]} `}>
            <div className={`${styles.toast} ${styles[typeClass]}`}>
                {header && <div className="toast-header">{header}</div>}
                <div className="toast-body">{children}</div>
            </div>
        </div>
    );
};

export default Toast;
