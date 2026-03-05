import {createContext} from "react";


interface ListContextType {
    dividerColor?: string;
    dividerInset?: string;
    // setDividerInfo: (color: string, inset: string) => void;
}

export const ListContext = createContext<ListContextType | null>(null);

interface ListProps {
    borderVariant?: "primary" | "secondary" | "accent";
    inset?: "none" | "small" | "medium" | "large";
    children?: React.ReactNode;
}
const List = ({children, borderVariant = "primary", inset = "medium"}: ListProps) => {
    const dividerColors = {
        primary: "after:bg-primary",
        secondary: "after:bg-secondary",
        accent: "after:bg-accent",
    }
    const dividerInsets = {
        none: "after:left-0 after:right-0",
        small: "after:left-4 after:right-4",
        medium: "after:left-8 after:right-8",
        large: "after:left-12 after:right-12",
    }

    const dividerColor = dividerColors[borderVariant];
    const dividerInset = dividerInsets[inset];

    return (
        <ListContext.Provider value={{dividerColor, dividerInset}}>
            <ul>
                {children}
            </ul>
        </ListContext.Provider>
    );
}

export default List;