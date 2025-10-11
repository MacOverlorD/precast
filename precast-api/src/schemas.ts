import { z } from "zod";

export const bookingCreate = z.object({
  crane: z.string().min(1),
  item: z.string().min(1),
  requester: z.string().min(1),
  phone: z.string().regex(/^0\d{9}$/, "เบอร์โทรต้อง 10 หลักและขึ้นต้น 0"),
  purpose: z.string().min(1),
  start: z.number().int(), // timestamp ms
  end: z.number().int(),
  note: z.string().optional(),
});
export type BookingCreate = z.infer<typeof bookingCreate>;

export const bookingStatus = z.enum(["รอการอนุมัติ","อนุมัติ","ปฏิเสธ"]);
