import {AuthProvider} from "../../../context/AuthContext";


jest.mock("../../../utility/ApiService", () => ({
    get: jest.fn(),
    post: jest.fn()
}));
jest.mock("react-router-dom", () => {
    const actual = jest.requireActual("react-router-dom");
    return {
        ...actual,
        useParams: jest.fn(() => ({ clientId: "client123" })),
    };
});

jest.mock("./ViewClientEventConflictsItem", () => (props: any) => (
    <div data-testid={`conflict-${props.conflict.event.id}`}>{props.conflict.event.id}</div>
));

import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ViewClientEventConflictsPage from "./ViewClientEventConflictsPage";
import {BrowserRouter} from "react-router-dom";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import apiService from "../../../utility/ApiService";


function renderPage() {
    const testQuery = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false
            }
        }
    });
    return render(
        <QueryClientProvider client={testQuery}>
        <AuthProvider>
            <BrowserRouter><ViewClientEventConflictsPage /></BrowserRouter>
        </AuthProvider>
        </QueryClientProvider>);
}

describe("ViewClientEventConflictsPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders the date inputs and search button", async () => {
        (apiService.get as jest.Mock).mockResolvedValue({ data: [] });
        renderPage();

        expect(screen.getByLabelText("Begin Date")).toBeInTheDocument();
        expect(screen.getByLabelText("End Date")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
    });

    it("calls get on mount with empty dates", async () => {
        const mockGet = (apiService.get as jest.Mock).mockResolvedValue({ data: [] });
        renderPage();

        expect(mockGet).toHaveBeenCalledTimes(1);
        expect(mockGet).toHaveBeenCalledWith("client/client123/event/get-conflicts", {"params": {}});
    });

    it("submits the search form with selected dates", async () => {
        const mockGet = (apiService.get as jest.Mock).mockResolvedValue({ data: [] });

        const user = userEvent.setup();
        renderPage();

        const beginInput = screen.getByLabelText("Begin Date") as HTMLInputElement;
        const endInput = screen.getByLabelText("End Date") as HTMLInputElement;
        const button = screen.getByRole("button", { name: /search/i });

        await user.type(beginInput, "2025-08-01");
        await user.type(endInput, "2025-08-31");
        await user.click(button);

        expect(mockGet).toHaveBeenCalled();
        // last call should include the provided dates
        expect(mockGet).toHaveBeenLastCalledWith("client/client123/event/get-conflicts", {"params": {"beginDate": "2025-08-01", "endDate": "2025-08-31"}});
    });

    it("shows Loading... when status is isLoading is true", async () => {
        // according to component logic Loading... is shown when status !== "loading"
        (apiService.get as jest.Mock).mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve({ data: [] }), 100)));
        renderPage();
        expect(screen.queryByText("Loading...")).toBeInTheDocument();
    });
    it("does not show Loading when isLoading is false", async () => {
        (apiService.get as jest.Mock).mockResolvedValue({ data: [] });

        renderPage();
        expect(screen.queryByText("Loading...")).toBeInTheDocument();
    })

    it("renders a list of conflicts when data is provided", async () => {
        const conflictData = [
            { event: { id: "e1", description: "One" }, conflictingEvents: [] },
            { event: { id: "e2", description: "Two" }, conflictingEvents: [] },
        ];
        (apiService.get as jest.Mock).mockResolvedValue({ data: conflictData });
        renderPage();

        expect(await screen.findByTestId("conflict-e1")).toBeInTheDocument();
        expect(screen.getByTestId("conflict-e2")).toBeInTheDocument();
    });
    it("should display pages properly", async () => {
       const conflictData = [];
       for (let i = 0; i < 10; i++) {
           conflictData.push({event: {id: `e${i}`, description: "event"}, conflictingEvents: []});
       }
        (apiService.get as jest.Mock).mockResolvedValueOnce({data: conflictData});
       renderPage();

       await waitFor(async () => {
           const pageInput = screen.getByTestId("pagination-input");
          expect(screen.getByTestId("pagination-buttons")).toBeInTheDocument();
          expect(pageInput).toHaveValue(1);
          await userEvent.click(screen.getByTestId("pagination-next"));
          expect(pageInput).toHaveValue(2);
       });
    });
});
