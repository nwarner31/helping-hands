import { z } from "zod";

const EventTypeEnum = z.enum(["WORK", "MEDICAL", "SOCIAL", "OTHER"]);
const TimeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const MedicalEventSchema = z.object({
    recordNumber: z.string().max(10),
    recordPrintedDate: z.coerce.date().optional(),
    recordPrintedEmpId: z.string().max(40).optional(),
    recordTakenToHouseDate: z.coerce.date().optional(),
    recordTakenEmpId: z.string().max(40).optional(),
    appointmentCompletedByEmpId: z.string().max(40).optional(),
    recordFiledDate: z.coerce.date().optional(),
    recordFiledEmpId: z.string().max(40).optional(),
    doctor: z.string().max(60),
    doctorType: z.string().max(30),
    appointmentForCondition: z.string().max(50),
    appointmentResults: z.string().optional(),
});

export const EventSchema = z.object({
    id: z.string(),
    type: EventTypeEnum,
    description: z.string(),
    beginDate: z.coerce.date(),
    endDate: z.coerce.date(),
    beginTime: z.string().regex(TimeRegex, "Invalid time format (expected HH:mm)"),
    endTime: z.string().regex(TimeRegex, "Invalid time format (expected HH:mm)"),
    numberStaffRequired: z.number().int().nonnegative(),
    clientId: z.string().max(40),
    medical: MedicalEventSchema.optional(),
});

export const FullEventSchema = EventSchema.superRefine((data, ctx) => {
    if (data.type === "MEDICAL") {
        if (!data.medical) {
            ctx.addIssue({
                path: ["medical"],
                code: z.ZodIssueCode.custom,
                message: "Medical event data is required when type is MEDICAL",
            });
        } else {
            const result = MedicalEventSchema.safeParse(data.medical);
            if (!result.success) {
                result.error.issues.forEach((issue) =>
                    ctx.addIssue({ ...issue, path: ["medical", ...(issue.path || [])] })
                );
            }
        }
    }
});

export type EventInput = z.infer<typeof FullEventSchema>;
