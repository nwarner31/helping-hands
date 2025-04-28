import { screen, render } from "@testing-library/react";
import {Client} from "../../models/Client";
import ViewClientsItem from "./ViewClientsItem";
import {BrowserRouter} from "react-router-dom";

describe("View Client Item tests", () => {
    const mockClient = {
        clientId: '123',
        legalName: 'Test Client LLC',
        name: '',
        dateOfBirth: '2000-01-01T00:00:00Z',
    } as Client;
    function renderComponent(isAdmin: boolean, isOdd: boolean) {
        return render(<BrowserRouter><table><tbody><ViewClientsItem client={mockClient} isAdmin={isAdmin} isOddRow={isOdd} /></tbody></table></BrowserRouter>);
    }
    it("should render the client correctly", () => {
        renderComponent(false, false);
        expect(screen.getByText(mockClient.clientId)).toBeInTheDocument();
        expect(screen.getByText(mockClient.legalName)).toBeInTheDocument();
        expect(screen.getByText('None')).toBeInTheDocument(); // if name is missing
        expect(screen.getByText("01/01/2000")).toBeInTheDocument();
    });
    it("should apply the odd row if odd is true", () => {
        const {container} = renderComponent(false, true);
        const row = container.querySelector("tr");
        expect(row).toHaveClass("odd-row");
    });
    it("should apply the even row if odd is false", () => {
        const {container} = renderComponent(false, false);
        const row = container.querySelector("tr");
        expect(row).toHaveClass("even-row");
    });
    it("should have the hideable class if an admin", () => {
        const {container} = renderComponent(true, false);
        const hideable = container.querySelector(".hideable");
        expect(hideable).toBeInTheDocument();
    });
    it("should not have the hideable class if not an admin", () => {
        const {container} = renderComponent(false, false);
        const hideable = container.querySelector(".hideable");
        expect(hideable).not.toBeInTheDocument();
    });
    it('shows Edit button for admin', () => {
        renderComponent(true, false);
        expect(screen.getByRole('button', { name: "Edit" })).toBeInTheDocument();
    });

    it('does not show Edit button for non-admin', () => {
        renderComponent(false, false);
        expect(screen.queryByRole('button', { name: "Edit" })).not.toBeInTheDocument();
    });
    it("should have a button type of accent for odd rows (admin only)", () => {
        renderComponent(true, true);
        expect(screen.queryByRole('button', { name: "Edit" })).toHaveClass("accent");
    });
    it("should have a button type of secondary for even rows (admin only)", () => {
        renderComponent(true, false);
        expect(screen.queryByRole('button', { name: "Edit" })).toHaveClass("secondary");
    });
})