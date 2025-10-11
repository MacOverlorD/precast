import { Router } from "express";
import fs from "fs";
import path from "path";

const r = Router();

// Get work types with estimated times
r.get("/", async (_req, res) => {
  try {
    // work-types.json is in the root directory (parent of API directory)
    const workTypesPath = path.join(process.cwd(), '..', 'work-types.json');
    const workTypesData = fs.readFileSync(workTypesPath, 'utf8');
    const workTypes = JSON.parse(workTypesData);
    res.json(workTypes);
  } catch (error) {
    console.error('Error reading work types:', error);
    res.status(500).json({ error: 'Failed to load work types' });
  }
});

export default r;
