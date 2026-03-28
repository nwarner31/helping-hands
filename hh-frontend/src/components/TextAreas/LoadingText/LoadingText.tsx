import {clsx} from "clsx";

interface LoadingTextProps {
    bgColorType?: "gray" | "primary",
    className?: string,
    id?: string
}

const LoadingTextTypes = {
    gray: "from-gray-300 via-gray-200 to-gray-300",
    primary: "from-primary-300 to-primary-300 via-primary-500",
}
const LoadingText = ({className, bgColorType = "gray", id}: LoadingTextProps) => {
    const loadingId = id ? `loading-${id}` : "loading-skeleton"
    return (
        <div id={loadingId} data-testid={loadingId} className={clsx("rounded-lg justify-center items-center font-bold flex bg-gradient-to-r  bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]", className ? className : "w-full   h-25  text-3xl font-header rounded ", LoadingTextTypes[bgColorType])} >

        </div>
    );
}

export default LoadingText;