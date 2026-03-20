import {render, screen} from "@testing-library/react";
import {userEvent} from "@testing-library/user-event";
import {BrowserRouter} from "react-router-dom";
const mockToastSuccess = jest.fn();
jest.mock("react-toastify", () => ({
    __esModule: true,
    toast: {
        success: mockToastSuccess
    },
}));
import AddClientPage from "./AddClientPage";
import {AuthProvider} from "../../../context/AuthContext";

jest.mock("../../../utility/ApiService", () => ({
    post: jest.fn(() => Promise.resolve( { message: "Client added", client: { id: "123" }})),
}));

const renderPage = () => {
    render(
        <AuthProvider>
            <BrowserRouter>
                <AddClientPage  />
            </BrowserRouter>
        </AuthProvider>
        );
}
describe("AddClientPage tests", () => {
    it("renders form with empty fields for add client", () => {
        renderPage();
        expect(screen.getByLabelText("Client ID")).toHaveValue("");

        expect(screen.getByRole("heading", {name: "Add Client"})).toBeInTheDocument();
    });
    it("updates client ID on input", async () => {
        renderPage();
        const input = screen.getByLabelText("Client ID");
        await userEvent.type(input, "12345");
        expect(input).toHaveValue("12345");
    });
    it("should have an error for all the empty required fields", async () => {
        renderPage();
        const submitButton = screen.getByRole("button", {name: "Add Client"});
        await userEvent.click(submitButton);
        expect(await screen.findByText("Client ID is required")).toBeInTheDocument();
        expect(await screen.findByText("Legal name is required")).toBeInTheDocument();
        expect(await screen.findByText("Date of Birth is required")).toBeInTheDocument();
    });
    it("should not clear inputs if validation fails", async () => {
        renderPage();
        await userEvent.type(screen.getByLabelText("Client ID"), "TestID");
        await userEvent.click(screen.getByRole("button", {name: "Add Client"}));

        expect(screen.getByLabelText("Client ID")).toHaveValue("TestID");
    });
    it('should have an error if the Legal Name if only 1 name entered', async () => {
        renderPage();
        const legalNameInput = screen.getByLabelText("Legal Name");
        await userEvent.type(legalNameInput, "William");
        const submitButton = screen.getByRole("button", {name: "Add Client"});
        await userEvent.click(submitButton);
        expect(await screen.findByText("Legal name requires a first name and last name")).toBeInTheDocument()
    });
    it("should submit the form if correct data entered", async () => {
        renderPage();
        await userEvent.type(screen.getByLabelText("Client ID"), "C2419");
        await userEvent.type(screen.getByLabelText("Legal Name"), "William Smith");
        await userEvent.type(screen.getByLabelText("Date of Birth"), "2000-07-19");
        await userEvent.click(screen.getByRole("button", {name: "Add Client"}));
        expect(mockToastSuccess).toHaveBeenCalledWith("Client successfully added", {autoClose: 1500, position: "top-right"});
    });
});