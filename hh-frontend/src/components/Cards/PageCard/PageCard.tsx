import clsx from "clsx";
import {useAuth} from "../../../context/AuthContext";
import Button from "../../Buttons/Button/Button";
import {useNavigate} from "react-router-dom";
import {useLogout} from "../../../hooks/authHook/auth.hook";

const breakpointClasses: Record<string, string> = {
    xs: "rounded-none shadow-none xs:rounded-xl xs:shadow-md max-w-100 xs:min-h-0",
    sm: "rounded-none shadow-none sm:rounded-xl sm:shadow-md sm:max-w-120 sm:min-h-0",
    md: "rounded-none shadow-none md:rounded-xl md:shadow-md md:max-w-144 md:min-h-0",
    "md-lg": "rounded-none shadow-none md-lg:rounded-xl md-lg:shadow-md md-lg:max-w-152 md-lg:min-h-0",
    lg: "rounded-none shadow-none lg:rounded-xl lg:shadow-md lg:max-w-168 lg:min-h-0",
    xl: "rounded-none shadow-none xl:rounded-xl xl:shadow-md",
};

interface PageCardProps {
    children?: React.ReactNode;
    title?: string;
    size?: "xs" | "sm" | "md" | "md-lg" | "lg" | "xl";
    className?: string;
}

const PageCard = ({title, children, className, size = "md"}: PageCardProps) => {
    const {employee} = useAuth();
    const navigate = useNavigate();
    const {logout} = useLogout();
    const logoutHandler = async () => {
        try {
            await logout();
        } catch (error) {

        } finally {
            navigate("/")
        }

    }
    return (
        <div className={clsx("bg-slate-300 w-full min-h-screen flex flex-col justify-center", breakpointClasses[size], className)}>
            <div className="flex justify-around w-full mb-5 items-center">
                {title && <h1 className="font-header text-accent text-2xl font-bold text-center">{title}</h1>}
                {employee && <Button type="button" onClick={logoutHandler} className="px-6">Logout</Button>}
            </div>
            {children}
        </div>
    );

}

export default PageCard;