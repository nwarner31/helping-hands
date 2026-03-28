import { render, screen, fireEvent } from "@testing-library/react";
import ViewHouseListItem from "./ViewHouseListItem";
import { House } from "../../../models/House";
import {BrowserRouter, MemoryRouter, Route, Routes} from "react-router-dom";
import {userEvent} from "@testing-library/user-event";

const house: House = {
    id: "H001",
    name: "Safe Haven",
    street1: "123 Elm St",
    street2: "Apt 4B",
    city: "Testville",
    state: "TS",
    maxClients: 3,
    femaleEmployeeOnly: true,
    clients: [
        { id: "C001", legalName: "Alice Smith", dateOfBirth: "1990-01-01", sex: "F" },
        { id: "C002", legalName: "Bob Jones", dateOfBirth: "1985-05-05", sex: "M" }
    ],
    primaryHouseManager: {name: "Bob Smith"} as any,
    primaryManagerId: "E001",
    secondaryManagerId: undefined
};

describe("ViewHouseListItem Component", () => {
    const mockRemoveClient = jest.fn();
    const mockRemoveManager = jest.fn();

    it("renders collapsed row with key info", () => {
        render(<BrowserRouter><ViewHouseListItem house={house} canEdit={true} onRemoveClient={mockRemoveClient} onRemoveManager={mockRemoveManager} /></BrowserRouter>);
        expect(screen.getByText("House Id")).toBeInTheDocument();
        expect(screen.getByText("H001")).toBeInTheDocument();
        expect(screen.getByText("Safe Haven")).toBeInTheDocument();
        expect(screen.getByText("2/3")).toBeInTheDocument();
        expect(screen.getByText("Yes")).toBeInTheDocument();
        expect(screen.getByText("Edit")).toBeInTheDocument();
        expect(screen.queryByText("Address:")).not.toBeInTheDocument(); // Not expanded yet
    });

    it("expands to show address, managers, and clients", () => {
        render(<BrowserRouter><ViewHouseListItem house={house} canEdit={true} onRemoveClient={mockRemoveClient} onRemoveManager={mockRemoveManager} /></BrowserRouter>);
        fireEvent.click(screen.getByRole("button", { name: /▶/i }));
        expect(screen.getByText("Address:")).toBeInTheDocument();
        expect(screen.getByText("123 Elm St, Apt 4B, Testville, TS")).toBeInTheDocument();
        expect(screen.getByText("Primary Manager:")).toBeInTheDocument();
        expect(screen.getByText("Bob Smith")).toBeInTheDocument();
        expect(screen.getByText("Secondary Manager:")).toBeInTheDocument();
        expect(screen.getByText("N/A")).toBeInTheDocument();
        expect(screen.getAllByText("Yes")).toHaveLength(2);

        expect(screen.getByText("C001")).toBeInTheDocument();
        expect(screen.getByText("Alice Smith")).toBeInTheDocument();
        expect(screen.getByText("01/01/1990")).toBeInTheDocument();

        expect(screen.getByText("C002")).toBeInTheDocument();
        expect(screen.getByText("Bob Jones")).toBeInTheDocument();
        expect(screen.getByText("05/05/1985")).toBeInTheDocument();

        expect(screen.getByText("Empty")).toBeInTheDocument(); // one client slot left
    });
    it("shows no for houses that are not female only", () => {
        render(<BrowserRouter><ViewHouseListItem house={{...house, femaleEmployeeOnly: false}} canEdit={true} onRemoveClient={mockRemoveClient} onRemoveManager={mockRemoveManager} /></BrowserRouter>);
        fireEvent.click(screen.getByRole("button", { name: /▶/i }));
        expect(screen.getAllByText("No")).toHaveLength(2);
    });
    it("shows N/A for houses that have no primary manager", () => {
        const noManagerHouse = {...house, primaryHouseManager: undefined, primaryManagerId: undefined};
        render(<BrowserRouter><ViewHouseListItem house={noManagerHouse} canEdit={true} onRemoveClient={mockRemoveClient} onRemoveManager={mockRemoveManager} /></BrowserRouter>);
        fireEvent.click(screen.getByRole("button", { name: /▶/i }));
        expect(screen.getByTestId("primary-add")).toBeInTheDocument();
        expect(screen.queryByTestId("primary-remove")).not.toBeInTheDocument();
        expect(screen.getAllByText("N/A")).toHaveLength(2); // primary and secondary manager both show N/A
    });

    it("renders correct number of Add and Remove buttons", () => {

        render(<BrowserRouter><ViewHouseListItem house={house} canEdit={true} onRemoveClient={mockRemoveClient} onRemoveManager={mockRemoveManager} /></BrowserRouter>);
        fireEvent.click(screen.getByRole("button", { name: /▶/i }));

        const addButtons =  screen.getAllByTestId("client-add-button");
        const removeButtons = screen.getAllByTestId("client-remove-button");

        expect(removeButtons?.length).toBe(2); // 2 clients
        expect(addButtons?.length).toBe(1);    // 1 empty slot
        expect(screen.getByTestId("primary-remove")).toBeInTheDocument();
        expect(screen.getByTestId("secondary-add")).toBeInTheDocument();
    });
    it("displays the proper manager buttons (reverse of above test)", async () => {
        const houseData = {...house, primaryHouseManager: undefined, secondaryHouseManager: {name: "Mario Mario"} as any};
        render(<BrowserRouter><ViewHouseListItem house={houseData} canEdit={true} onRemoveClient={mockRemoveClient} onRemoveManager={mockRemoveManager} /></BrowserRouter>);
        fireEvent.click(screen.getByRole("button", { name: /▶/i }));

        expect(screen.getByTestId("primary-add")).toBeInTheDocument();
        expect(screen.getByTestId("secondary-remove")).toBeInTheDocument();
    })

    it("hides Edit, Add, and Remove buttons when canEdit is false", async () => {
        render(<BrowserRouter><ViewHouseListItem house={{...house, secondaryHouseManager: {name: "Ann Manager"} as any}} canEdit={false} onRemoveClient={mockRemoveClient} onRemoveManager={mockRemoveManager} /></BrowserRouter>);
        await userEvent.click(screen.getByRole("button", { name: /▶/i }));
        expect(screen.queryByText("Edit")).not.toBeInTheDocument();
        expect(screen.queryByText("Remove")).not.toBeInTheDocument();
        expect(screen.queryByText("Add")).not.toBeInTheDocument();
    });

    it("calls onRemoveClicked when a Remove button is clicked", async () => {
        render(
            <BrowserRouter>
                <ViewHouseListItem house={house} canEdit={true} onRemoveClient={mockRemoveClient} onRemoveManager={mockRemoveManager} />
            </BrowserRouter>
        );
        await userEvent.click(screen.getByRole("button", { name: /▶/i }));

        const removeButtons = screen.getAllByTestId("client-remove-button");

        await userEvent.click(removeButtons[0]);

        expect(mockRemoveClient).toHaveBeenCalledWith(house, house.clients![0]); // or however you pass clientId
    });
    it("navigates to the edit page when Edit button is clicked", async () => {
        render(
            <BrowserRouter>
                <ViewHouseListItem house={house} canEdit={true} onRemoveClient={mockRemoveClient} onRemoveManager={mockRemoveManager} />
            </BrowserRouter>
        );

        const editLink = screen.getByRole("link", { name: /edit/i });
        expect(editLink).toBeInTheDocument();
        expect(editLink).toHaveAttribute("href", `/edit-house/${house.id}`);
    });
    it("navigates to the edit page when Edit link is clicked", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={["/"]}>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <ViewHouseListItem
                                house={house}
                                canEdit={true}
                                onRemoveClient={mockRemoveClient}
                                onRemoveManager={mockRemoveManager}
                            />
                        }
                    />
                    <Route
                        path={`/edit-house/${house.id}`}
                        element={<div>Edit Page for {house.id}</div>}
                    />
                </Routes>
            </MemoryRouter>
        );

        const editLink = screen.getByRole("link", { name: /edit/i });
        expect(editLink).toBeInTheDocument();

        await user.click(editLink);
        expect(screen.getByText(`Edit Page for ${house.id}`)).toBeInTheDocument();
    });
    it("navigates to add-client page when Add link is clicked", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={["/"]}>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <ViewHouseListItem
                                house={house}
                                canEdit={true}
                                onRemoveClient={mockRemoveClient}
                                onRemoveManager={mockRemoveManager}
                            />
                        }
                    />
                    <Route
                        path="/house/:houseId/add-client"
                        element={<div>Add Client Page</div>}
                    />
                </Routes>
            </MemoryRouter>
        );

        // Expand the row to reveal Add links
        await user.click(screen.getByRole("button", { name: /▶/i }));

        const addButtons =  screen.getAllByTestId("client-add-button");

        await user.click(addButtons[0]);

        expect(screen.getByText("Add Client Page")).toBeInTheDocument();
    });
    const partialEmployee = { id: "t100", email: "test@mail.com", position: "MANAGER", hireDate: "2024-01-01", sex: "M" }
    const houseWithManagers = {
        ...house,
        primaryHouseManager: { name: "Jane Doe", ...partialEmployee },
        secondaryHouseManager: { name: "John Doe", ...partialEmployee }
    };

    it("displays manager names when present", () => {
        render(<BrowserRouter>
            <ViewHouseListItem house={houseWithManagers} canEdit={true} onRemoveClient={mockRemoveClient} onRemoveManager={mockRemoveManager} />
        </BrowserRouter>);

        fireEvent.click(screen.getByRole("button", { name: /▶/i }));
        expect(screen.getByText("Jane Doe")).toBeInTheDocument();
        expect(screen.getByText("John Doe")).toBeInTheDocument();
    });
    it("displays remove buttons when house has managers", () => {
        const houseNoClients = {...houseWithManagers, clients: []};
        render(<BrowserRouter>
            <ViewHouseListItem house={houseNoClients} canEdit={true} onRemoveClient={mockRemoveClient} onRemoveManager={mockRemoveManager} />
        </BrowserRouter>);

        fireEvent.click(screen.getByRole("button", { name: /▶/i }));
        expect(screen.getAllByRole("button", {name: "Remove"})).toHaveLength(2);
    });


    it("renders correctly when there are no clients", () => {
        const houseNoClients = { ...house, clients: [] };
        render(<BrowserRouter>
            <ViewHouseListItem house={houseNoClients} canEdit={true} onRemoveClient={mockRemoveClient} onRemoveManager={mockRemoveManager} />
        </BrowserRouter>);

        fireEvent.click(screen.getByRole("button", { name: /▶/i }));

        expect(screen.getAllByText("Empty").length).toBe(3); // maxClients = 3
    });

    it("renders incomplete address when some fields are missing", () => {
        const houseWithMissingAddress = {
            ...house,
            street1: "123 Main St",
            street2: "",
            city: undefined,
            state: undefined,
        } as any;

         render(
             <BrowserRouter>
            <ViewHouseListItem
                house={houseWithMissingAddress}
                canEdit={false}
                onRemoveClient={mockRemoveClient}
                onRemoveManager={mockRemoveManager}
            />
             </BrowserRouter>
        );
        fireEvent.click(screen.getByRole("button", { name: "▶" }));

        expect(screen.getByText(/Address:/).parentElement).toHaveTextContent("Address: 123 Main St");
    });

    it("calls onRemoveManager when a manager's Remove button is clicked", async () => {
        const houseWithManagers = {
            ...house,
            primaryHouseManager: { name: "Jane Doe", employeeId: "P001" },
            secondaryHouseManager: { name: "John Smith", employeeId: "S001" }
        } as any;

        render(
            <BrowserRouter>
                <ViewHouseListItem
                    house={houseWithManagers}
                    canEdit={true}
                    onRemoveClient={mockRemoveClient}
                    onRemoveManager={mockRemoveManager}
                />
            </BrowserRouter>
        );

        await userEvent.click(screen.getByRole("button", { name: /▶/i }));
        const managerRemoveButtons = screen.getAllByRole("button", { name: "Remove" });
        // click primary manager remove
        await userEvent.click(managerRemoveButtons[0]);
        expect(mockRemoveManager).toHaveBeenCalledWith(houseWithManagers, houseWithManagers.primaryHouseManager);
        await userEvent.click(managerRemoveButtons[1]);
        expect(mockRemoveManager).toHaveBeenCalledWith(houseWithManagers, houseWithManagers.secondaryHouseManager);
    });

});
