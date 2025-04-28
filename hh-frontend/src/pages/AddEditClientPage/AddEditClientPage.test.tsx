import { render, screen } from "@testing-library/react";
import {userEvent} from "@testing-library/user-event";
import AddEditClientPage from "./AddEditClientPage";
import {BrowserRouter, MemoryRouter, Route, Routes} from "react-router-dom";

jest.mock("../../utility/ApiService", () => ({
    post: jest.fn(() => Promise.resolve( { message: "Client added", client: { clientId: "123" }})),
    put: jest.fn(() => Promise.resolve({ message: "client updated successfully", client: { clientId: "123" }})),
}));

const renderPage = (isEdit: boolean) => render(<BrowserRouter><AddEditClientPage isEdit={isEdit} /></BrowserRouter>)
describe("Add Edit Client Page tests", () => {
    it("renders form with empty fields for add client", () => {
        renderPage(false);
        expect(screen.getByLabelText("Client ID")).toHaveValue("");

        expect(screen.getByRole("heading", {name: "Add Client"})).toBeInTheDocument();
        });
    it("updates client ID on input", async () => {
        renderPage(false);
        const input = screen.getByLabelText("Client ID");
        await userEvent.type(input, "12345");
        expect(input).toHaveValue("12345");
    });
    it("should have an error for all the empty required fields", async () => {
        renderPage(false);
        const submitButton = screen.getByRole("button", {name: "Add Client"});
        await userEvent.click(submitButton);
        expect(await screen.findByText("Client ID is required")).toBeInTheDocument();
        expect(await screen.findByText("Legal Name is required")).toBeInTheDocument();
        expect(await screen.findByText("Date of Birth is required")).toBeInTheDocument();
    });
    it("should not clear inputs if validation fails", async () => {
        renderPage(false);
        await userEvent.type(screen.getByLabelText("Client ID"), "TestID");
        await userEvent.click(screen.getByRole("button", { name: "Add Client" }));

        expect(screen.getByLabelText("Client ID")).toHaveValue("TestID");
    });
    it('should have an error if the Legal Name if only 1 name entered', async () => {
        renderPage(false);
        const legalNameInput = screen.getByLabelText("Legal Name");
        await userEvent.type(legalNameInput, "William");
        const submitButton = screen.getByRole("button", {name: "Add Client"});
        await userEvent.click(submitButton);
        expect(await screen.findByText("Legal Name requires a first name and last name")).toBeInTheDocument()
    });
    it("should submit the form if correct data entered", async () => {
        renderPage(false);
        await userEvent.type(screen.getByLabelText("Client ID"), "C2419");
        await userEvent.type(screen.getByLabelText("Legal Name"), "William Smith");
        await userEvent.type(screen.getByLabelText("Date of Birth"), "2000-07-19");
        await userEvent.click(screen.getByRole("button", {name: "Add Client"}));
        expect(await screen.findByText("Client successfully added")).toBeInTheDocument();
    });

    it("should have the client id field disabled if is edit is true", () => {
        render(
            <MemoryRouter initialEntries={[{ pathname: '/test', state: { client: {clientId: "111", legalName: "A A", dateOfBirth: "2000-01-01"} } }]}>
                <Routes>
                    <Route path="/test" element={<AddEditClientPage isEdit={true}/>} />
                </Routes>
            </MemoryRouter>
        );
        const clientIdInput = screen.getByLabelText("Client ID");
        expect(clientIdInput).toHaveAttribute("disabled");
    });
    it("should prefill form fields with client data on edit", () => {
        render(
            <MemoryRouter initialEntries={[{ pathname: '/test', state: { client: {clientId: "111", legalName: "John Doe", dateOfBirth: "2000-01-01"} } }]}>
                <Routes>
                    <Route path="/test" element={<AddEditClientPage isEdit={true} />} />
                </Routes>
            </MemoryRouter>
        );
        expect(screen.getByLabelText("Client ID")).toHaveValue("111");
        expect(screen.getByLabelText("Legal Name")).toHaveValue("John Doe");
        expect(screen.getByLabelText("Date of Birth")).toHaveValue("2000-01-01");
    });
    it("submits update form correctly", async () => {
        render(
            <MemoryRouter initialEntries={[{ pathname: '/test', state: { client: {clientId: "111", legalName: "John Doe", dateOfBirth: "2000-01-01"} } }]}>
                <Routes>
                    <Route path="/test" element={<AddEditClientPage isEdit={true} />} />
                </Routes>
            </MemoryRouter>
        );
        await userEvent.clear(screen.getByLabelText("Legal Name"));
        await userEvent.type(screen.getByLabelText("Legal Name"), "Jane Doe");
        await userEvent.click(screen.getByRole("button", { name: "Update Client" }));

        expect(await screen.findByText("Client successfully updated")).toBeInTheDocument();
    });
});