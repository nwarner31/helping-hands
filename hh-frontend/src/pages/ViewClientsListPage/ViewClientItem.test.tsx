import { screen, render } from "@testing-library/react";
import {Client} from "../../models/Client";
import ViewClientsItem from "./ViewClientsItem";
import {BrowserRouter} from "react-router-dom";

describe("View Client Item tests", () => {
    const mockClient = {
        id: '123',
        legalName: 'Test Client',
        name: '',
        dateOfBirth: '2000-01-01T00:00:00Z',
        sex: "M"
    } as Client;
    function renderComponent(isAdmin: boolean, isOdd: boolean) {
        return render(<BrowserRouter><ViewClientsItem client={mockClient} isAdmin={isAdmin} isOddRow={isOdd} /></BrowserRouter>);
    }
    it("should render the client correctly", () => {
        renderComponent(false, false);
        expect(screen.getByText(mockClient.id)).toBeInTheDocument();
        expect(screen.getByText(mockClient.legalName)).toBeInTheDocument();
        expect(screen.getByText('None')).toBeInTheDocument(); // if name is missing
        expect(screen.getByText("01/01/2000")).toBeInTheDocument();
    });
    it("should apply the bg-primary if odd is true", () => {
        renderComponent(false, true);
        const row = screen.getByTestId("view-clients-item");
        expect(row).toHaveClass("bg-primary");
    });
    it("should not apply the bg-primary if odd is false", () => {
        renderComponent(false, false);
        const row = screen.getByTestId("view-clients-item");
        expect(row).not.toHaveClass("bg-primary");
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
        expect(screen.queryByRole('button', { name: "Edit" })).toHaveClass("bg-accent");
    });
    it("should have a button type of secondary for even rows (admin only)", () => {
        renderComponent(true, false);
        expect(screen.queryByRole('button', { name: "Edit" })).toHaveClass("bg-secondary");
    });
})