import {AuthProvider} from "../../../context/AuthContext";

jest.mock("../../../hooks/getHook/get.hook", () => ({
    useGet: jest.fn(),
}));
jest.mock("../../../utility/ApiService", () => ({
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

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useGet } from "../../../hooks/getHook/get.hook";
import ViewClientEventConflictsPage from "./ViewClientEventConflictsPage";
import {BrowserRouter} from "react-router-dom";

const mockedUseGet = useGet as jest.MockedFunction<typeof useGet> | jest.Mock;

function renderPage() {
    return render(
        <AuthProvider><BrowserRouter><ViewClientEventConflictsPage /></BrowserRouter></AuthProvider>);
}

describe("ViewClientEventConflictsPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders the date inputs and search button", async () => {
        mockedUseGet.mockReturnValue({ get: jest.fn(), data: [], status: "idle", errors: null, clearErrors: jest.fn() });

        renderPage();

        expect(screen.getByLabelText("Begin Date")).toBeInTheDocument();
        expect(screen.getByLabelText("End Date")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
    });

    it("calls get on mount with empty dates", async () => {
        const mockGet = jest.fn();
        mockedUseGet.mockReturnValue({ get: mockGet, data: [], status: "idle", errors: null, clearErrors: jest.fn() });

        renderPage();

        expect(mockGet).toHaveBeenCalledTimes(1);
        expect(mockGet).toHaveBeenCalledWith({ beginDate: "", endDate: "" });
    });

    it("submits the search form with selected dates", async () => {
        const mockGet = jest.fn();
        mockedUseGet.mockReturnValue({ get: mockGet, data: [], status: "idle", errors: null, clearErrors: jest.fn() });

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
        expect(mockGet).toHaveBeenLastCalledWith({ beginDate: "2025-08-01", endDate: "2025-08-31" });
    });

    it("shows Loading... when status is 'loading' and hides it when status is not 'loading'", async () => {
        // according to component logic Loading... is shown when status !== "loading"
        mockedUseGet.mockReturnValue({ get: jest.fn(), data: [], status: "idle", errors: null, clearErrors: jest.fn() });
        renderPage();
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();

        // when status is "loading" the Loading... should not be present
        jest.clearAllMocks();
        mockedUseGet.mockReturnValue({ get: jest.fn(), data: [], status: "loading", errors: null, clearErrors: jest.fn() });
        renderPage();
        expect(screen.queryByText("Loading...")).toBeInTheDocument();
    });

    it("renders a list of conflicts when data is provided", async () => {
        const conflictData = [
            { event: { id: "e1", description: "One" }, conflictingEvents: [] },
            { event: { id: "e2", description: "Two" }, conflictingEvents: [] },
        ];
        mockedUseGet.mockReturnValue({ get: jest.fn(), data: conflictData, status: "success", errors: null, clearErrors: jest.fn() });

        renderPage();

        expect(await screen.findByTestId("conflict-e1")).toBeInTheDocument();
        expect(screen.getByTestId("conflict-e2")).toBeInTheDocument();
    });
});
