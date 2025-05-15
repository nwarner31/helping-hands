import {render, screen, waitFor} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AddHouseManagerPage } from "./AddHouseManagerPage";
import * as reactRouterDom from "react-router-dom";
import apiService from "../../utility/ApiService";

jest.mock("../../utility/ApiService", () => ({
    get: jest.fn(() => Promise.resolve( { message: "Employee registered successfully", employee: {}, accessToken: "hello" })),
}));
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useLoaderData: jest.fn(),
    useParams: jest.fn(),
    useLocation: jest.fn()
}));

describe("AddHouseManagePage tests", () => {
    it("renders house data from location state and manager list", () => {
        const house = { houseId: "H1", name: "Sample House" };
        const managers = [
            { id: "E1", employeeId: "EMP1", name: "Alice", position: "MANAGER" },
            { id: "E2", employeeId: "EMP2", name: "Bob", position: "MANAGER" }
        ];

        (reactRouterDom.useLocation as jest.Mock).mockReturnValue({ state: { house } });
        (reactRouterDom.useParams as jest.Mock).mockReturnValue({ houseId: "H1" });
        (reactRouterDom.useLoaderData as jest.Mock).mockReturnValue({ managers });

        render(<MemoryRouter><AddHouseManagerPage /></MemoryRouter>);

        expect(screen.getByText("Add House Manager")).toBeInTheDocument();
        expect(screen.getByText("H1")).toBeInTheDocument();
        expect(screen.getByText("Sample House")).toBeInTheDocument();
        expect(screen.getByText("Alice")).toBeInTheDocument();
        expect(screen.getByText("Bob")).toBeInTheDocument();
    });

    it("fetches house data if not in location state", async () => {
        const house = { houseId: "H2", name: "Fetched House" };
        const managers = [{ id: "E1", employeeId: "EMP1", name: "Charlie", position: "MANAGER" }];

        (reactRouterDom.useLocation as jest.Mock).mockReturnValue({ state: null });
        (reactRouterDom.useParams as jest.Mock).mockReturnValue({ houseId: "H2" });
        (reactRouterDom.useLoaderData as jest.Mock).mockReturnValue({ managers });
        (apiService.get as jest.Mock).mockResolvedValue({ house });

        render(<MemoryRouter><AddHouseManagerPage /></MemoryRouter>);

        await waitFor(() => {
            expect(screen.getByText("Fetched House")).toBeInTheDocument();
        });

        expect(screen.getByText("Charlie")).toBeInTheDocument();
    });

    it("displays message when no managers are available", () => {
        const house = { houseId: "H3", name: "Empty House" };

        (reactRouterDom.useLocation as jest.Mock).mockReturnValue({ state: { house } });
        (reactRouterDom.useParams as jest.Mock).mockReturnValue({ houseId: "H3" });
        (reactRouterDom.useLoaderData as jest.Mock).mockReturnValue({ managers: [] });

        render(<MemoryRouter><AddHouseManagerPage /></MemoryRouter>);

        expect(screen.getByText("Add House Manager")).toBeInTheDocument();
        expect(screen.queryByText(/Alice|Bob|Charlie/)).not.toBeInTheDocument();
    });

})