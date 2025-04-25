import { render, screen } from "@testing-library/react";
import {userEvent} from "@testing-library/user-event";
import AddEditClientPage from "./AddEditClientPage";
import {BrowserRouter} from "react-router-dom";

jest.mock("../../utility/ApiService", () => ({
    post: jest.fn(() => Promise.resolve( { message: "Client added", client: { clientId: "123" }})),
}));

const renderPage = () => render(<BrowserRouter><AddEditClientPage /></BrowserRouter>)
describe("Add Edit Client Page tests", () => {
    it("renders form with empty fields for add client", () => {
        renderPage();
        expect(screen.getByLabelText("Client ID")).toHaveValue("");

        expect(screen.getByRole("heading", {name: "Add Client"})).toBeInTheDocument();
        });
    it("updates client ID on input", async () => {
        renderPage();
        const input = screen.getByLabelText("Client ID");
        await userEvent.type(input, "12345");
        //fireEvent.change(input, { target: { value: "12345" } });
        expect(input).toHaveValue("12345");
    });
    it("should have an error for all the empty required fields", async () => {
        renderPage();
        const submitButton = screen.getByRole("button", {name: "Add Client"});
        await userEvent.click(submitButton);
        expect(await screen.findByText("Client ID is required")).toBeInTheDocument();
        expect(await screen.findByText("Legal Name is required")).toBeInTheDocument();
        expect(await screen.findByText("Date of Birth is required")).toBeInTheDocument();
    });
    it('should have an error if the Legal Name if only 1 name entered', async () => {
        renderPage();
        const legalNameInput = screen.getByLabelText("Legal Name");
        await userEvent.type(legalNameInput, "William");
        const submitButton = screen.getByRole("button", {name: "Add Client"});
        await userEvent.click(submitButton);
        expect(await screen.findByText("Legal Name requires a first name and last name")).toBeInTheDocument()
    });
    it("should submit the form if correct data entered", async () => {
        renderPage();
        await userEvent.type(screen.getByLabelText("Client ID"), "C2419");
        await userEvent.type(screen.getByLabelText("Legal Name"), "William Smith");
        await userEvent.type(screen.getByLabelText("Date of Birth"), "2000-07-19");
        await userEvent.click(screen.getByRole("button", {name: "Add Client"}));
        expect(await screen.findByText("Client successfully added")).toBeInTheDocument();
    })
});