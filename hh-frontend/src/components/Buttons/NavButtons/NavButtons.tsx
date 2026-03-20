import Button from "../Button/Button";
import LinkButton from "../LinkButton/LinkButton";
import {useNavigate} from "react-router-dom";
import {clsx} from "clsx";


interface NavButtonsProps {
    showBackButton?: boolean;
    className?: string;
}

const NavButtons = ({showBackButton = true, className}: NavButtonsProps) => {
    const navigate = useNavigate();
    return (
        <nav aria-label="Primary navigation" className={clsx("mb-4", className)}>
            <ul className="list-none flex gap-2">
                {showBackButton && <li className="grow"><Button onClick={() => navigate(-1)} className="w-full">Go Back</Button></li>}
                <li className="grow"><LinkButton to="/dashboard" className="w-full h-full" variant="secondary">Dashboard</LinkButton></li>
            </ul>
        </nav>
    );
}

export default NavButtons