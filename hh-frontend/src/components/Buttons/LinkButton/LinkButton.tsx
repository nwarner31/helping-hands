import {Link, LinkProps} from "react-router-dom";
import {ButtonVariant, getButtonClasses} from "../Buttons.utility";
import clsx from "clsx";

type LinkButtonProps = LinkProps & {
    id?: string;
    className?: string;
    children?: React.ReactNode;
    variant?: ButtonVariant;
}

const LinkButton = ({variant = "primary", className, children, id, ...props}: LinkButtonProps) => {
    const linkId = id ? `link-button-${id}` : "link-button";
    const classes = clsx("text-decoration-none", className);
    return (
        <Link data-testid={linkId} className={getButtonClasses(variant, classes)} {...props}>
            {children}
        </Link>
    )
}

export default LinkButton;