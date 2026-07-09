import initializeService from "./initialize.service.js";

export async function initializeDatabase() {
    await initializeService.initialize();
    
}