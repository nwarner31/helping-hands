import {clsx} from "clsx";

interface ErrorTextProps {
    className?: string;
    id?: string;
    text: string;
}
const ErrorText = ({text, id, className}: ErrorTextProps) => {
    const myId = id ?? "error-text";
    return (
        <div id={myId} className={clsx("text-red-600 border-red-600 border-2 py-2 rounded-md bg-red-200 text-center", className)} data-testid={myId}>
            {text}
        </div>
    );
}

export default ErrorText;