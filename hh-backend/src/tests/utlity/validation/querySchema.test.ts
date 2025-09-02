import {eventQuerySchema} from "../../../validation/event.validation";



describe("querySchema refine", () => {
    it("accepts month only", () => {
        const result = eventQuerySchema.safeParse({ month: "2025-08" });
        expect(result.success).toBe(true);
    });
    it("accepts no data", () => {
        const result = eventQuerySchema.safeParse({ });
        expect(result.success).toBe(true);
    });
    it("accepts from/to only", () => {
        const result = eventQuerySchema.safeParse({ fromDate: "2025-08-01", toDate: "2025-08-10" });
        expect(result.success).toBe(true);
    });

    it("rejects month + from", () => {
        const result = eventQuerySchema.safeParse({ month: "2025-08", fromDate: "2025-08-01" });
        expect(result.success).toBe(false);
        if(!result.success)
            expect(result.error.format().month?._errors).toContain("Provide either month OR from/to, not both");
    });

    it("rejects from without to", () => {
        const result = eventQuerySchema.safeParse({ fromDate: "2025-08-01" });
        expect(result.success).toBe(false);
        if(!result.success)
            expect(result.error.format().toDate?._errors).toContain("To date is required if From date is included");
    });

    it("rejects to without from", () => {
        const result = eventQuerySchema.safeParse({ toDate: "2025-08-10" });
        expect(result.success).toBe(false);
        if(!result.success)
            expect(result.error.format().fromDate?._errors).toContain("From date is required if To date is included");
    });

    it("rejects empty strings", () => {
        const result = eventQuerySchema.safeParse({ month: "   " });
        expect(result.success).toBe(false); // fails stringIsDefined
    });

    it("rejects whitespace-only strings", () => {
        const result = eventQuerySchema.safeParse({
            month: "   ",
            fromDate: "  ",
            toDate: "\t",
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.format().month?._errors).toContain(
                "Month must not be an empty string"
            );
            expect(result.error.format().fromDate?._errors).toContain(
                "From date must not be an empty string"
            );
            expect(result.error.format().toDate?._errors).toContain(
                "To date must not be an empty string"
            );
        }
    });

    it("rejects invalid month format", () => {
        const result = eventQuerySchema.safeParse({ month: "2025-13" });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.format().month?._errors).toContain(
                "Invalid month format (YYYY-MM)"
            );
        }
    });

    it("rejects invalid from/to date format", () => {
        const result = eventQuerySchema.safeParse({
            fromDate: "2025-08-32",
            toDate: "2025-08-10",
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.format().fromDate?._errors).toContain(
                "Invalid From date format (YYYY-MM-DD)"
            );
        }
    });
});