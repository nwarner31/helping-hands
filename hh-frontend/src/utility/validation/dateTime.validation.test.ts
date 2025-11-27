import {validateMonth, validateDate, validateTime} from "./dateTime.validation";



describe("DateTime Validation Utility", () => {
    describe("validateMonth", () => {
        it("validates correct month format", () => {
            const validate = validateMonth("2023-05", "Test Month");
            expect(validate).toBeUndefined();
        });
        it("should send the correct error for empty string", () => {
            const validate = validateMonth("", "Test Month");
            expect(validate).toBe("Test Month is required");
        });
        it("should send the correct error for invalid format", () => {
            const validate = validateMonth("2023/05", "Test Month");
            expect(validate).toBe("Month must be in YYYY-MM format");
        });
        it("should send the correct error for invalid month", () => {
            const validate = validateMonth("2523-12", "Test Month");
            expect(validate).toBe("Invalid month");
        });
    });

    describe("validateDate", () => {
        it("validates correct date format", () => {
            const validate = validateDate("2023-05-15", "Test Date");
            expect(validate).toBeUndefined();
        });
        it("should send the correct error for empty string", () => {
            const validate = validateDate("", "Test Date");
            expect(validate).toBe("Test Date is required");
        });
        it("should send the correct error for invalid date", () => {
            const validate = validateDate("2023-15-05", "Test Date");
            expect(validate).toBe("Test Date must be a valid date");
        });
        it("should send the correct error for past date when comparison is future", () => {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 1);
            const validate = validateDate(pastDate.toISOString().split('T')[0], "Test Date", "future");
            expect(validate).toBe("Test Date must be today or later");
        });
        it("should send the correct error for future date when comparison is past", () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 1);
            const validate = validateDate(futureDate.toISOString().split('T')[0], "Test Date", "past");
            expect(validate).toBe("Test Date must be today or earlier");
        });
    });

    describe("validateTime", () => {
        it("validates correct time format", () => {
            const validate = validateTime("14:30", "Test Time");
            expect(validate).toBeUndefined();
        });
        it("should send the correct error for empty string", () => {
            const validate = validateTime("", "Test Time");
            expect(validate).toBe("Test Time is required");
        });
        it("should send the correct error for invalid time", () => {
            const validate = validateTime("25:00", "Test Time");
            expect(validate).toBe("Test Time must be a valid time");
        });
    });
})