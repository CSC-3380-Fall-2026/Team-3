import { Router } from "express";
import db from "../database";

const router = Router();

type CheckResult = {
    name: string;
    status: "Working" | "Error" | "Not Available";
    message?: string;
    httpStatus?: number;
};

async function checkEndpoint(
    name: string,
    endpoint: string
): Promise<CheckResult> {
    try {
        const response = await fetch(
            `http://localhost:3000${endpoint}`
        );

        if (!response.ok) {
            return {
                name,
                status: "Error",
                httpStatus: response.status,
                message: `Endpoint returned HTTP ${response.status}.`
            };
        }

        const data: any = await response.json();

        if (Array.isArray(data) && data.length === 0) {
            return {
                name,
                status: "Working",
                httpStatus: response.status,
                message: "Endpoint is responding, but no records are currently available."
            };
        }

        return {
            name,
            status: "Working",
            httpStatus: response.status
        };
    } catch {
        return {
            name,
            status: "Error",
            message: "Endpoint could not be reached."
        };
    }
}

router.get("/health", async (_req, res) => {
    const checks: CheckResult[] = [];

    try {
        db.prepare("SELECT 1").get();

        checks.push({
            name: "Database",
            status: "Working"
        });
    } catch {
        checks.push({
            name: "Database",
            status: "Error",
            message: "Database connection failed."
        });
    }

    checks.push(
        await checkEndpoint("NFL Team Lookup", "/api/teams")
    );

    checks.push(
        await checkEndpoint(
            "Player Lookup",
            "/api/players/search?name=Patrick"
        )
    );

    checks.push(
        await checkEndpoint(
            "Historical Game Lookup",
            "/api/games"
        )
    );

    checks.push(
        await checkEndpoint(
            "Game Details",
            "/api/games?gameId=health-check"
        )
    );

    checks.push(
        await checkEndpoint(
            "Live NFL Games",
            "/api/games/live"
        )
    );

    const overallError = checks.some(
        (check) => check.status === "Error"
    );

    res.status(overallError ? 503 : 200).json({
        status: overallError ? "Error" : "Working",
        checks
    });
});

export default router;
