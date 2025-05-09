import { render, screen, fireEvent } from "@testing-library/react";
import ViewHouseListItem from "./ViewHouseListItem";
import { House } from "../../models/House";
import {BrowserRouter} from "react-router-dom";
import {userEvent} from "@testing-library/user-event";

const house: House = {
    houseId: "H001",
    name: "Safe Haven",
    street1: "123 Elm St",
    street2: "Apt 4B",
    city: "Testville",
    state: "TS",
    maxClients: 3,
    femaleEmployeeOnly: true,
    clients: [
        { clientId: "C001", legalName: "Alice Smith", dateOfBirth: "1990-01-01" },
        { clientId: "C002", legalName: "Bob Jones", dateOfBirth: "1985-05-05" }
    ],
    primaryManagerId: "E001",
    secondaryManagerId: undefined
};

describe("ViewHouseListItem Component", () => {
    it("renders collapsed row with key info", () => {
        render(<BrowserRouter><ViewHouseListItem house={house} isOdd={true} canEdit={true} /></BrowserRouter>);
        expect(screen.getByText("House Id")).toBeInTheDocument();
        expect(screen.getByText("H001")).toBeInTheDocument();
        expect(screen.getByText("Safe Haven")).toBeInTheDocument();
        expect(screen.getByText("2/3")).toBeInTheDocument();
        expect(screen.getByText("Yes")).toBeInTheDocument();
        expect(screen.getByText("Edit")).toBeInTheDocument();
        expect(screen.queryByText("Address:")).not.toBeInTheDocument(); // Not expanded yet
    });

    it("expands to show address, managers, and clients", () => {
        render(<BrowserRouter><ViewHouseListItem house={house} isOdd={false} canEdit={true} /></BrowserRouter>);
        fireEvent.click(screen.getByRole("button", { name: /▶/i }));
        expect(screen.getByText("Address:")).toBeInTheDocument();
        expect(screen.getByText("123 Elm St, Apt 4B, Testville, TS")).toBeInTheDocument();
        expect(screen.getByText("Primary Manager:")).toBeInTheDocument();
        expect(screen.getByText("E001")).toBeInTheDocument();
        expect(screen.getByText("Secondary Manager:")).toBeInTheDocument();
        expect(screen.getByText("N/A")).toBeInTheDocument();

        expect(screen.getByText("C001")).toBeInTheDocument();
        expect(screen.getByText("Alice Smith")).toBeInTheDocument();
        expect(screen.getByText("1990-01-01")).toBeInTheDocument();

        expect(screen.getByText("C002")).toBeInTheDocument();
        expect(screen.getByText("Bob Jones")).toBeInTheDocument();
        expect(screen.getByText("1985-05-05")).toBeInTheDocument();

        expect(screen.getByText("Empty")).toBeInTheDocument(); // one client slot left
    });

    it("renders correct number of Add and Remove buttons", () => {
        render(<BrowserRouter><ViewHouseListItem house={house} isOdd={false} canEdit={true} /></BrowserRouter>);
        fireEvent.click(screen.getByRole("button", { name: /▶/i }));

        const addButtons = screen.getAllByRole("button", { name: /Add/i });
        const removeButtons = screen.getAllByRole("button", { name: /Remove/i });

        expect(removeButtons.length).toBe(2); // 2 clients
        expect(addButtons.length).toBe(1);    // 1 empty slot
    });

    it("hides Edit, Add, and Remove buttons when canEdit is false", async () => {
        render(<BrowserRouter><ViewHouseListItem house={house} isOdd={false} canEdit={false} /></BrowserRouter>);
        await userEvent.click(screen.getByRole("button", { name: /▶/i }));

        expect(screen.queryByText("Edit")).not.toBeInTheDocument();
        expect(screen.queryByText("Remove")).not.toBeInTheDocument();
        expect(screen.queryByText("Add")).not.toBeInTheDocument();
    });

    it("applies the 'odd-row' class when isOdd is true", () => {
        const { container } = render(<BrowserRouter><ViewHouseListItem house={house} isOdd={true} canEdit={true} /></BrowserRouter>);
        const rootDiv = container.firstChild as HTMLElement;
        expect(rootDiv.className).toMatch(/odd-row/);
    });

    it("applies the 'even-row' class when isOdd is false", () => {
        const { container } = render(<BrowserRouter><ViewHouseListItem house={house} isOdd={false} canEdit={true} /></BrowserRouter>);
        const rootDiv = container.firstChild as HTMLElement;
        expect(rootDiv.className).toMatch(/even-row/);
    });
});
