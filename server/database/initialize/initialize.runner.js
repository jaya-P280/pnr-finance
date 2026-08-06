import initializeService from "./initialize.service.js";

export async function initializeDatabase() {
    try {
        await initializeService.initialize();
    } catch (error) {
        console.warn("Database initialization failed, attempting automatic retry:", error?.message || error);
        try {
            await initializeService.initialize();
            console.log("Database initialized successfully on retry.");
        } catch (retryError) {
            console.error("Database initialization failed after retry:", retryError?.message || retryError);
        }
    }
}