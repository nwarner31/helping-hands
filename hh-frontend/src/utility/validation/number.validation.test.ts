import {validateNumber} from "./number.validation";


describe("Number Validation Utility", () => {
    it("validates the number correctly", () => {
        const validate = validateNumber("2", "Test field");
        expect(validate).toBeUndefined();
    });
    it("should send the correct error for empty string", () => {
        const validate = validateNumber("", "Test field");
        expect(validate).toBe("Test field is required");
    });
    it("should send the correct error for non-numeric input", () => {
        const validate = validateNumber("abc", "Test field");
        expect(validate).toBe("Test field must be a valid number");
    });
    it("should send the correct error for non-integer input when isInteger is true", () => {
        const validate = validateNumber("2.5", "Test field", { isInteger: true });
        expect(validate).toBe("Test field must be an integer");
    });
    it("should send the correct error for number below min", () => {
        const validate = validateNumber("1", "Test field", { min: 2 });
        expect(validate).toBe("Test field must be at least 2");
    });
    it("should send the correct error for number above max", () => {
        const validate = validateNumber("5", "Test field", { max: 4 });
        expect(validate).toBe("Test field must be at most 4");
    });
})