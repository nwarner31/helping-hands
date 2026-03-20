import { screen, render } from "@testing-library/react";
import {Client} from "../../../models/Client";
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
    function renderComponent(isOdd: boolean) {
        return render(<BrowserRouter><ViewClientsItem client={mockClient} isOddRow={isOdd} /></BrowserRouter>);
    }
    it("should render the client correctly", () => {
        renderComponent(false);
        expect(screen.getByText(mockClient.id)).toBeInTheDocument();
        expect(screen.getByText(mockClient.legalName)).toBeInTheDocument();
        expect(screen.getByText('None')).toBeInTheDocument(); // if name is missing
        expect(screen.getByText("01/01/2000")).toBeInTheDocument();
    });

    it("should have a button type of accent for odd rows (admin only)", () => {
        renderComponent(true);
        expect(screen.queryByRole('link', { name: "123" })).toHaveClass("bg-accent");
    });
    it("should have a button type of secondary for even rows (admin only)", () => {
        renderComponent(false);
        expect(screen.queryByRole('link', { name: "123" })).toHaveClass("bg-secondary");
    });
})