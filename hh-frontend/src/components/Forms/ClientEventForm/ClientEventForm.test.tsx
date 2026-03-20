import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ClientEventForm, { ClientEvent } from "./ClientEventForm";

jest.mock("react-router-dom", () => {
    const actual = jest.requireActual("react-router-dom");
    return {
        ...actual,
        useNavigate: jest.fn(),
    };
});

import { useNavigate } from "react-router-dom";

const mockedUseNavigate = useNavigate as jest.Mock;

const createEvent = (overrides: Partial<ClientEvent> = {}): ClientEvent => ({
    id: "EVT100",
    beginDate: "2028-04-01",
    beginTime: "09:00",
    endDate: "2028-04-01",
    endTime: "10:30",
    numberStaffRequired: "2",
    type: "WORK",
    description: "Morning shift",
    medical: {
        recordNumber: "",
        doctor: "",
        doctorType: "",
        appointmentForCondition: "",
    },
    ...overrides,
});

describe("ClientEventForm", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedUseNavigate.mockReturnValue(jest.fn());
    });

    it("renders default values and keeps Event ID enabled in add mode", () => {
        render(
            <ClientEventForm
                errors={{}}
                submitButtonText="Add Event"
                onSubmit={jest.fn()}
            />
        );

        expect(screen.getByLabelText("Event ID")).toHaveValue("");
        expect(screen.getByLabelText("Event ID")).toBeEnabled();
        expect(screen.getByLabelText("Begin Date")).toHaveValue("");
        expect(screen.getByLabelText("Begin Time")).toHaveValue("");
        expect(screen.getByLabelText("End Date")).toHaveValue("");
        expect(screen.getByLabelText("End Time")).toHaveValue("");
        expect(screen.getByLabelText("Staff Required")).toHaveValue(0);
        expect(screen.getByLabelText("Event Type")).toHaveValue("OTHER");
        expect(screen.getByLabelText("Description")).toHaveValue("");
        expect(screen.getByRole("button", { name: "Add Event" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
        expect(screen.getByLabelText("Record Number")).toHaveAttribute("tabindex", "-1");
        expect(screen.getByLabelText("Doctor Name")).toHaveAttribute("tabindex", "-1");
    });

    it("renders initial data and disables the Event ID field in edit mode", () => {
        const initialData = createEvent({
            type: "MEDICAL",
            description: "Checkup",
            medical: {
                recordNumber: "REC-77",
                doctor: "Dr. Brown",
                doctorType: "Primary",
                appointmentForCondition: "Annual review",
            },
        });

        render(
            <ClientEventForm
                initialData={initialData}
                errors={{}}
                submitButtonText="Update Event"
                onSubmit={jest.fn()}
            />
        );

        expect(screen.getByLabelText("Event ID")).toHaveValue(initialData.id);
        expect(screen.getByLabelText("Event ID")).toBeDisabled();
        expect(screen.getByLabelText("Begin Date")).toHaveValue(initialData.beginDate);
        expect(screen.getByLabelText("Begin Time")).toHaveValue(initialData.beginTime);
        expect(screen.getByLabelText("End Date")).toHaveValue(initialData.endDate);
        expect(screen.getByLabelText("End Time")).toHaveValue(initialData.endTime);
        expect(screen.getByLabelText("Staff Required")).toHaveValue(Number(initialData.numberStaffRequired));
        expect(screen.getByLabelText("Event Type")).toHaveValue("MEDICAL");
        expect(screen.getByLabelText("Event Type")).toBeDisabled();
        expect(screen.getByLabelText("Description")).toHaveValue("Checkup");
        expect(screen.getByLabelText("Record Number")).toHaveValue("REC-77");
        expect(screen.getByLabelText("Doctor Name")).toHaveValue("Dr. Brown");
        expect(screen.getByLabelText("Doctor Type")).toHaveValue("Primary");
        expect(screen.getByLabelText("Condition")).toHaveValue("Annual review");
        expect(screen.getByLabelText("Record Number")).toHaveAttribute("tabindex", "0");
    });

    it("renders all event type options", () => {
        render(
            <ClientEventForm
                errors={{}}
                submitButtonText="Add Event"
                onSubmit={jest.fn()}
            />
        );

        const eventType = screen.getByLabelText("Event Type");
        expect(screen.getByRole("option", { name: "Work" })).toBeInTheDocument();
        expect(screen.getByRole("option", { name: "Medical" })).toBeInTheDocument();
        expect(screen.getByRole("option", { name: "Social" })).toBeInTheDocument();
        expect(screen.getByRole("option", { name: "Other" })).toBeInTheDocument();
        expect(eventType).toHaveValue("OTHER");
    });

    it("updates event fields and reveals medical fields when MEDICAL is selected", async () => {
        render(
            <ClientEventForm
                errors={{}}
                submitButtonText="Add Event"
                onSubmit={jest.fn()}
            />
        );

        await userEvent.type(screen.getByLabelText("Event ID"), "EVT200");
        await userEvent.type(screen.getByLabelText("Begin Date"), "2028-06-10");
        await userEvent.type(screen.getByLabelText("Begin Time"), "08:30");
        await userEvent.type(screen.getByLabelText("End Date"), "2028-06-10");
        await userEvent.type(screen.getByLabelText("End Time"), "10:00");
        await userEvent.clear(screen.getByLabelText("Staff Required"));
        await userEvent.type(screen.getByLabelText("Staff Required"), "3");
        await userEvent.selectOptions(screen.getByLabelText("Event Type"), "MEDICAL");
        await userEvent.type(screen.getByLabelText("Description"), "Medical trip");
        await userEvent.type(screen.getByLabelText("Record Number"), "REC-200");
        await userEvent.type(screen.getByLabelText("Doctor Name"), "Dr. Stone");
        await userEvent.type(screen.getByLabelText("Doctor Type"), "Specialist");
        await userEvent.type(screen.getByLabelText("Condition"), "Follow-up");

        expect(screen.getByLabelText("Event ID")).toHaveValue("EVT200");
        expect(screen.getByLabelText("Begin Date")).toHaveValue("2028-06-10");
        expect(screen.getByLabelText("Begin Time")).toHaveValue("08:30");
        expect(screen.getByLabelText("End Date")).toHaveValue("2028-06-10");
        expect(screen.getByLabelText("End Time")).toHaveValue("10:00");
        expect(screen.getByLabelText("Staff Required")).toHaveValue(3);
        expect(screen.getByLabelText("Event Type")).toHaveValue("MEDICAL");
        expect(screen.getByLabelText("Description")).toHaveValue("Medical trip");
        expect(screen.getByLabelText("Record Number")).toHaveValue("REC-200");
        expect(screen.getByLabelText("Doctor Name")).toHaveValue("Dr. Stone");
        expect(screen.getByLabelText("Doctor Type")).toHaveValue("Specialist");
        expect(screen.getByLabelText("Condition")).toHaveValue("Follow-up");
        expect(screen.getByLabelText("Record Number")).toHaveAttribute("tabindex", "0");
    });

    it("submits the current event data including nested medical fields", async () => {
        const onSubmit = jest.fn();

        render(
            <ClientEventForm
                errors={{}}
                submitButtonText="Add Event"
                onSubmit={onSubmit}
            />
        );

        await userEvent.type(screen.getByLabelText("Event ID"), "EVT300");
        await userEvent.type(screen.getByLabelText("Begin Date"), "2028-07-01");
        await userEvent.type(screen.getByLabelText("Begin Time"), "11:00");
        await userEvent.type(screen.getByLabelText("End Date"), "2028-07-01");
        await userEvent.type(screen.getByLabelText("End Time"), "12:15");
        await userEvent.clear(screen.getByLabelText("Staff Required"));
        await userEvent.type(screen.getByLabelText("Staff Required"), "1");
        await userEvent.selectOptions(screen.getByLabelText("Event Type"), "MEDICAL");
        await userEvent.type(screen.getByLabelText("Description"), "Doctor appointment");
        await userEvent.type(screen.getByLabelText("Record Number"), "REC-300");
        await userEvent.type(screen.getByLabelText("Doctor Name"), "Dr. Green");
        await userEvent.type(screen.getByLabelText("Doctor Type"), "General Practice");
        await userEvent.type(screen.getByLabelText("Condition"), "Checkup");

        await userEvent.click(screen.getByRole("button", { name: "Add Event" }));

        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith({
            id: "EVT300",
            beginDate: "2028-07-01",
            beginTime: "11:00",
            endDate: "2028-07-01",
            endTime: "12:15",
            numberStaffRequired: "1",
            type: "MEDICAL",
            description: "Doctor appointment",
            medical: {
                recordNumber: "REC-300",
                doctor: "Dr. Green",
                doctorType: "General Practice",
                appointmentForCondition: "Checkup",
            },
        });
    });

    it("navigates back when cancel is clicked", async () => {
        const navigate = jest.fn();
        mockedUseNavigate.mockReturnValue(navigate);

        render(
            <ClientEventForm
                errors={{}}
                submitButtonText="Add Event"
                onSubmit={jest.fn()}
            />
        );

        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(navigate).toHaveBeenCalledWith(-1);
    });

    it("renders validation errors for base and medical fields", async () => {
        render(
            <ClientEventForm
                initialData={createEvent({ type: "MEDICAL" })}
                errors={{
                    id: "Event id is required",
                    beginDate: "Begin date is required",
                    description: "Description is required",
                    "medical.recordNumber": "Record number is required",
                    "medical.doctor": "Doctor is required",
                }}
                submitButtonText="Update Event"
                onSubmit={jest.fn()}
            />
        );

        expect(screen.getByText("Event id is required")).toBeInTheDocument();
        expect(screen.getByText("Begin date is required")).toBeInTheDocument();
        expect(screen.getByText("Description is required")).toBeInTheDocument();
        expect(screen.getByText("Record number is required")).toBeInTheDocument();
        expect(screen.getByText("Doctor is required")).toBeInTheDocument();
        expect(screen.getByLabelText("Event ID")).toHaveAttribute("aria-invalid", "true");
        expect(screen.getByLabelText("Begin Date")).toHaveAttribute("aria-invalid", "true");
        expect(screen.getByLabelText("Description")).toHaveAttribute("aria-invalid", "true");
        expect(screen.getByLabelText("Record Number")).toHaveAttribute("aria-invalid", "true");
        expect(screen.getByLabelText("Doctor Name")).toHaveAttribute("aria-invalid", "true");
    });
});

