import {render, screen, waitFor} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AddHouseManagerPage } from "./AddHouseManagerPage";
import * as reactRouterDom from "react-router-dom";
import apiService from "../../../utility/ApiService";
import {AuthProvider} from "../../../context/AuthContext";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

jest.mock("../../../utility/ApiService", () => ({
    get: jest.fn(() => Promise.resolve( { message: "Employee registered successfully", employee: {}, accessToken: "hello" })),
}));
const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useParams: jest.fn(),
    useLocation: jest.fn(),
    useNavigate: () => mockedNavigate,
}));

const renderPage = () => {
    const testQuery = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false
            }
        }
    });

    render(
        <QueryClientProvider client={testQuery}>
        <AuthProvider>
            <MemoryRouter>
                <AddHouseManagerPage />
            </MemoryRouter>
        </AuthProvider>
        </QueryClientProvider>
       );
}

describe("AddHouseManagePage tests", () => {
    it("renders house data from location state and manager list", async () => {
        const house = { id: "H1", name: "Sample House" };
        const managers = [
            { id: "E1", employeeId: "EMP1", name: "Alice", position: "MANAGER" },
            { id: "E2", employeeId: "EMP2", name: "Bob", position: "MANAGER" }
        ];
        (apiService.get as jest.Mock).mockResolvedValueOnce({ data: house  });
        (apiService.get as jest.Mock).mockResolvedValue( { message: "Event found", data:  managers });

        (reactRouterDom.useParams as jest.Mock).mockReturnValue({ houseId: "H1" });

        renderPage();
        await waitFor(() => {
            expect(screen.getByText("Add House Manager")).toBeInTheDocument();
            expect(screen.getByText("H1")).toBeInTheDocument();
            expect(screen.getByText("Sample House")).toBeInTheDocument();
            expect(screen.getByText("Alice")).toBeInTheDocument();
            expect(screen.getByText("Bob")).toBeInTheDocument();
        })

    });

    it("fetches house data if not in location state", async () => {
        const house = { houseId: "H2", name: "Fetched House" };
        const managers = [{ id: "E1", employeeId: "EMP1", name: "Charlie", position: "MANAGER" }];

        (reactRouterDom.useParams as jest.Mock).mockReturnValue({ houseId: "H2" });

        (apiService.get as jest.Mock).mockImplementation(async (url: string) => {
            if(url.includes("available-managers")) {
                return ({ message: "Event found", data:  managers });
            }
            if(url.includes("house/H2")) {
                return ({ message: "House found", data: house });
            }
            throw new Error("Not found");
        });

        renderPage();

        await waitFor(() => {
            expect(screen.getByText("Fetched House")).toBeInTheDocument();
        });

        expect(screen.getByText("Charlie")).toBeInTheDocument();
    });

    it("displays message when no managers are available", async () => {
        const house = { houseId: "H3", name: "Empty House" };

        (reactRouterDom.useLocation as jest.Mock).mockReturnValue({ state: { house } });
        (reactRouterDom.useParams as jest.Mock).mockReturnValue({ houseId: "H3" });
        (apiService.get as jest.Mock).mockResolvedValue({ data: [] });

        renderPage();
        await waitFor(() => {
            expect(screen.getByText("Add House Manager")).toBeInTheDocument();
            expect(screen.queryByText(/Alice|Bob|Charlie/)).not.toBeInTheDocument();
        })
    });
    it("should navigate back when cancel is clicked", async () => {
        (apiService.get as jest.Mock).mockResolvedValue({ data: [] });
        (reactRouterDom.useParams as jest.Mock).mockReturnValue({ houseId: "H3" });
        renderPage();
        await waitFor(() => {
            const cancelButton = screen.getByRole("button", {name: /cancel/i});
            expect(cancelButton).toBeInTheDocument();
            cancelButton.click();
            expect(mockedNavigate).toHaveBeenCalledWith(-1);
        });
    });
})