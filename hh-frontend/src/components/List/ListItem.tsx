import {ReactNode, useContext} from "react";
import {ListContext} from "./List";
import {clsx} from "clsx";

interface ListItemProps {
    id: string;
    children?: ReactNode;
}
const ListItem = ({id, children}: ListItemProps) => {
    const listContext = useContext(ListContext);
    const dividerColor = listContext?.dividerColor ?? "";
    const dividerInset = listContext?.dividerInset ?? "";
    return (
        <li key={id} className={clsx(dividerColor, dividerInset,
            "relative last:after:hidden after:absolute after:bottom-0 after:h-1 after:rounded-lg pb-1 last:pb-0")}>
            {children}
        </li>
    );
}

export default ListItem;