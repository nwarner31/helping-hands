import { act, renderHook } from "@testing-library/react";
import { useDelete } from "./delete.hook";

jest.mock("../../utility/ApiService", () => ({
    delete: jest.fn(),
}));

import apiService from "../../utility/ApiService";

const mockedDelete = apiService.delete as jest.Mock;

describe("useDelete hook", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns idle status initially", () => {
        const { result } = renderHook(() => useDelete());

        expect(result.current.status).toBe("idle");
    });

    it("calls apiService.delete, returns response data, and sets success status", async () => {
        const payload = { id: "house-1", deleted: true };
        mockedDelete.mockResolvedValue({ data: payload });

        const { result } = renderHook(() => useDelete());

        let response: any;
        await act(async () => {
            response = await result.current.remove("/houses/house-1");
        });

        expect(mockedDelete).toHaveBeenCalledWith("/houses/house-1");
        expect(response).toEqual(payload);
        expect(result.current.status).toBe("success");
    });

    it("sets error status and returns undefined when apiService.delete throws", async () => {
        mockedDelete.mockRejectedValue(new Error("delete failed"));

        const { result } = renderHook(() => useDelete());

        let response: any;
        await act(async () => {
            response = await result.current.remove("/houses/house-1");
        });

        expect(mockedDelete).toHaveBeenCalledWith("/houses/house-1");
        expect(response).toBeUndefined();
        expect(result.current.status).toBe("error");
    });
});

