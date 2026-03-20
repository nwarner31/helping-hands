import {render, screen, waitFor} from "@testing-library/react";
import {userEvent} from "@testing-library/user-event";
const mockToastSuccess = jest.fn();
jest.mock("react-toastify", () => ({
    __esModule: true,
    toast: {
        success: mockToastSuccess
    },
}));
import EditClientPage from "./EditClientPage";
import { MemoryRouter } from "react-router-dom";
import apiService from "../../../utility/ApiService";
import {AuthProvider} from "../../../context/AuthContext";

jest.mock("../../../utility/ApiService", () => ({
    get: jest.fn(() => Promise.resolve({data: {id: "111", legalName: "John Doe", dateOfBirth: "2000-01-01", sex: "F"}})),
    put: jest.fn(() => Promise.resolve({ message: "client updated successfully", client: { id: "123" }})),
}));

const renderPage = (state?: any) => {
    render(
        <AuthProvider>
            <MemoryRouter initialEntries={[{state: {client: state}}]}>
                <EditClientPage />
            </MemoryRouter>
        </AuthProvider>
        )
}

describe("EditClientPage tests", () => {
    it("should have the client id field disabled", async () => {
        renderPage();
        await waitFor(() => {
            const clientIdInput = screen.getByLabelText("Client ID");
            expect(clientIdInput).toHaveAttribute("disabled");
        })

    });
    it("should prefill form fields with client data", async () => {
        renderPage()
        await waitFor(() => {
            expect(screen.getByLabelText("Client ID")).toHaveValue("111");
            expect(screen.getByLabelText("Legal Name")).toHaveValue("John Doe");
            expect(screen.getByLabelText("Date of Birth")).toHaveValue("2000-01-01");
        })

    });
    it("should fetch the client data if no client data in location state", async () => {
        // mock the get method in ApiService to return a client
        const mockFetch = (apiService.get as jest.Mock);

       renderPage()
        await waitFor(() => expect(mockFetch).toHaveBeenCalled());
       jest.clearAllMocks();

    })
    it("submits update form correctly", async () => {
       renderPage();
        await waitFor(async () => {
            await userEvent.clear(screen.getByLabelText("Legal Name"));
            await userEvent.type(screen.getByLabelText("Legal Name"), "Jane Doe");
            await userEvent.click(screen.getByRole("button", { name: "Update Client" }));

            expect(mockToastSuccess).toHaveBeenCalledWith("Client successfully updated", {autoClose: 1500, position: "top-right"});
        });
    });
    it("should not fetch the data if it is provided by the state", async () => {
        jest.clearAllMocks();
        const mockFetch = (apiService.get as jest.Mock);
        renderPage({id: "111", legalName: "John Doe", dateOfBirth: "2000-01-01", sex: "F"});
        await waitFor(() => {
            expect(mockFetch).not.toHaveBeenCalled();
        });
    });
});