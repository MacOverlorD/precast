"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const r = (0, express_1.Router)();
r.get("/", async (req, res) => {
    const { crane } = req.query;
    let sql = `SELECT * FROM history`;
    const p = [];
    if (crane) {
        sql += ` WHERE crane=?`;
        p.push(String(crane));
    }
    sql += ` ORDER BY end_ts DESC LIMIT 500`;
    const result = db_1.default.query(sql, p);
    res.json(result);
});
exports.default = r;
