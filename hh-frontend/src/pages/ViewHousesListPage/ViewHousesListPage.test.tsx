import { render, screen } from "@testing-library/react";
import ViewHousesListPage from "./ViewHousesListPage";
import { useAuth } from "../../context/AuthContext";
import { useLoaderData } from "react-router-dom";
import { MemoryRouter } from "react-router-dom";
import {userEvent} from "@testing-library/user-event";
import {Client} from "../../models/Client";
import apiService from "../../utility/ApiService";

jest.mock("../../context/AuthContext", () => ({
    useAuth: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useLoaderData: jest.fn(),
}));

jest.mock("../../utility/ApiService", () => ({
    get: jest.fn(() => Promise.resolve( { message: "Nothing special", employee: {}, accessToken: "hello" })),
    delete: jest.fn(() => Promise.resolve({message: "deleted"}))
}));

jest.mock("./ViewHouseListItem", () => (props: any) => (
    <div key={props.house.id}>
        <div data-testid="house-item">{props.house.name}</div>
        <div>Manager:
            {props.house.primaryHouseManager ?
                <button onClick={() => props.onRemoveManager(props.house, props.house.primaryHouseManager)}>{props.house.primaryHouseManager.name}</button>
                : "N/A"}</div>
        {props.house.clients.map((client: Client) => <button key={client.id} onClick={() => props.onRemoveClient(props.house, client)}>{client.legalName}</button> )}
    </div>
));

const sampleHouses = [
    { id: "H1", name: "Test House 1", maxClients: 2, clients: [], femaleEmployeeOnly: false, primaryHouseManager:{id: "E1", name: "Alice Williams"} },
    { id: "H2", name: "Test House 2", maxClients: 3, clients: [{id: "C1", legalName: "Bob Smith"}], femaleEmployeeOnly: true },
];

// Inside each test
const renderPage = (role: "DIRECTOR" | "ADMIN" | "MANAGER") => {
    (useAuth as jest.Mock).mockReturnValue({ employee: { position: role } });
    (useLoaderData as jest.Mock).mockReturnValue({ houses: sampleHouses, message: "houses successfully retrieved" });

    render(
        <MemoryRouter>
            <ViewHousesListPage />
        </MemoryRouter>
    );
}

describe("ViewHousesListPage", () => {


    it('renders header', () => {
        renderPage("ADMIN");
        expect(screen.getByRole('heading', { name: "Houses" })).toBeInTheDocument();
    });

    it("renders the list of houses", () => {
        renderPage("DIRECTOR");

        const houseItems = screen.getAllByTestId("house-item");
        expect(houseItems).toHaveLength(2);
        expect(houseItems[0]).toHaveTextContent("Test House 1");
        expect(houseItems[1]).toHaveTextContent("Test House 2");
    });

    it("shows the 'Add House' button for DIRECTOR or ADMIN", () => {
        renderPage("ADMIN");
        expect(screen.getByText("Add House")).toBeInTheDocument();
    });

    it("does NOT show the 'Add House' button for MANAGER", () => {
        renderPage("MANAGER");
        expect(screen.queryByText("Add House")).not.toBeInTheDocument();
    });
    it("displays modal when a client is being removed", async () => {
        renderPage("DIRECTOR");
        await userEvent.click(screen.getByText("Bob Smith"));
        expect(screen.getByText("Remove Client from House")).toBeInTheDocument();
        expect(screen.getByText(/House: H2/)).toBeInTheDocument();
        expect(screen.getByText(/Client: C1/)).toBeInTheDocument();
    });
    it("calls the delete api when the remove modal button clicked", async () => {
        renderPage("DIRECTOR");
        await userEvent.click(screen.getByText("Bob Smith"));
        await userEvent.click(screen.getByText("Remove"));
        expect(apiService.delete).toHaveBeenCalled();
    });

    it("displays modal when a manager is being removed", async () => {
        renderPage("DIRECTOR");

        await userEvent.click(screen.getByText("Alice Williams"));
        expect(screen.getByText("Remove Manager from House")).toBeInTheDocument(); // modal heading stays same
        expect(screen.getByText(/Manager: E1/)).toBeInTheDocument();
    });

    it("calls the delete API when remove manager modal button clicked", async () => {

        renderPage("ADMIN");

        await userEvent.click(screen.getByText("Alice Williams"));
        await userEvent.click(screen.getByText("Remove"));

        expect(apiService.delete).toHaveBeenCalledWith("house/H1/manager/E1");
    });

});
