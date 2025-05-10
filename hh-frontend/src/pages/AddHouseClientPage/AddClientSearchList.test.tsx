import { render, screen, waitFor } from "@testing-library/react";
import AddClientSearchList from "./AddClientSearchList";
import { BrowserRouter } from "react-router-dom";
import apiService from "../../utility/ApiService";
import {userEvent} from "@testing-library/user-event";

// Mock API + useNavigate
jest.mock("../../utility/ApiService", () => ({
    patch: jest.fn(() => Promise.resolve( { message: "client added to house", house: { houseId: "123" }})),
   }));
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => jest.fn(),
}));

const mockClients = [
    {
        clientId: "1",
        legalName: "Alice Johnson",
        dateOfBirth: "1990-01-01",
        sex: "F",
    },
    {
        clientId: "2",
        legalName: "Bob Smith",
        dateOfBirth: "1985-05-05",
        sex: "M",
    },
];

const renderComponent = () =>
    render(
        <BrowserRouter>
            <AddClientSearchList clients={mockClients} houseId="abc123" />
        </BrowserRouter>
    );

describe("AddClientSearchList", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders client list", () => {
        renderComponent();
        expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
        expect(screen.getByText("Bob Smith")).toBeInTheDocument();
    });

    it("filters by search input", async () => {
        renderComponent();
        await userEvent.type(screen.getByPlaceholderText("Search by name..."), "Alice")
        expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
        expect(screen.queryByText("Bob Smith")).not.toBeInTheDocument();
    });

    it("filters by sex", async () => {
        renderComponent();
        await userEvent.selectOptions(screen.getByDisplayValue("Both"),
            "Female"
        );
        expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
        expect(screen.queryByText("Bob Smith")).not.toBeInTheDocument();
    });

    it("shows fallback when no clients match", async () => {
        renderComponent();
        await userEvent.type(screen.getByPlaceholderText("Search by name..."), "Nonexistent")
        expect(screen.getByText("No clients found.")).toBeInTheDocument();
    });

    it("calls API and shows toast on successful add", async () => {
        renderComponent();

        await userEvent.click(screen.getAllByText(/Add|\+/)[0]);

        await waitFor(() => {
            expect(apiService.patch).toHaveBeenCalledWith("house/abc123/clients", {
                clientId: "1",
            });
            expect(screen.getByText("Client added to house successfully")).toBeInTheDocument();
        });
    });
});
