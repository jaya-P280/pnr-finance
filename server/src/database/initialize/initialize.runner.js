import initializeService from "./initialize.service.js";

export async function initializeDatabase() {
    try {
        await initializeService.initialize();
    } catch (error) {
        console.warn("Database initialization skipped or failed:", error.message || error);
    }
}