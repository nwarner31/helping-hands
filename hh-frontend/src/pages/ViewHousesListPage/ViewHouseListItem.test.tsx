import { render, screen, fireEvent } from "@testing-library/react";
import ViewHouseListItem from "./ViewHouseListItem";
import { House } from "../../models/House";

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
        render(<ViewHouseListItem house={house} isOdd={true} />);
        expect(screen.getByText("House Id")).toBeInTheDocument();
        expect(screen.getByText("H001")).toBeInTheDocument();
        expect(screen.getByText("Safe Haven")).toBeInTheDocument();
        expect(screen.getByText("2/3")).toBeInTheDocument();
        expect(screen.getByText("Yes")).toBeInTheDocument();
        expect(screen.getByText("Edit")).toBeInTheDocument();
        expect(screen.queryByText("Address:")).not.toBeInTheDocument(); // Not expanded yet
    });

    it("expands to show address, managers, and clients", () => {
        render(<ViewHouseListItem house={house} isOdd={false} />);
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
        render(<ViewHouseListItem house={house} isOdd={false} />);
        fireEvent.click(screen.getByRole("button", { name: /▶/i }));

        const addButtons = screen.getAllByRole("button", { name: /Add/i });
        const removeButtons = screen.getAllByRole("button", { name: /Remove/i });

        expect(removeButtons.length).toBe(2); // 2 clients
        expect(addButtons.length).toBe(1);    // 1 empty slot
    });

    it("applies the 'odd-row' class when isOdd is true", () => {
        const { container } = render(<ViewHouseListItem house={house} isOdd={true} />);
        const rootDiv = container.firstChild as HTMLElement;
        expect(rootDiv.className).toMatch(/odd-row/);
    });

    it("applies the 'even-row' class when isOdd is false", () => {
        const { container } = render(<ViewHouseListItem house={house} isOdd={false} />);
        const rootDiv = container.firstChild as HTMLElement;
        expect(rootDiv.className).toMatch(/even-row/);
    });
});
