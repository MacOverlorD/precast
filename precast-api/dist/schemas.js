"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingStatus = exports.bookingCreate = void 0;
const zod_1 = require("zod");
exports.bookingCreate = zod_1.z.object({
    crane: zod_1.z.string().min(1),
    item: zod_1.z.string().min(1),
    requester: zod_1.z.string().min(1),
    phone: zod_1.z.string().regex(/^0\d{9}$/, "เบอร์โทรต้อง 10 หลักและขึ้นต้น 0"),
    purpose: zod_1.z.string().min(1),
    start: zod_1.z.number().int(), // timestamp ms
    end: zod_1.z.number().int(),
    note: zod_1.z.string().optional(),
});
exports.bookingStatus = zod_1.z.enum(["รอการอนุมัติ", "อนุมัติ", "ปฏิเสธ"]);
