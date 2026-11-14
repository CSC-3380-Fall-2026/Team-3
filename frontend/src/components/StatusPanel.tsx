import { useEffect, useState } from "react";

type HealthCheck = {
    name: string;
    status: "Working" | "Error" | "Not Available";
    httpStatus?: number;
    message?: string;
};

type HealthResponse = {
    status: "Working" | "Error";
    checks: HealthCheck[];
};

function StatusPanel() {
    const [health, setHealth] = useState<HealthResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function checkHealth() {
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/health");
            const data: HealthResponse = await response.json();

            setHealth(data);

            if (!response.ok) {
                setError("One or more backend services reported an error.");
            }
        } catch {
            setError("Unable to connect to the backend health endpoint.");
            setHealth(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        checkHealth();
    }, []);

    function getStatus(name: string) {
        return health?.checks.find(
            (check) => check.name === name
        );
    }

    const features = [
        {
            name: "NFL Team Lookup",
            check: "NFL Team Lookup",
            description: "Checks whether NFL team data can be retrieved."
        },
        {
            name: "Player Lookup",
            check: "Player Lookup",
            description: "Checks whether the player search endpoint responds."
        },
        {
            name: "Historical Game Lookup",
            check: "Historical Game Lookup",
            description: "Checks whether historical game data can be retrieved."
        },
        {
            name: "Game Details",
            check: "Game Details",
            description: "Checks whether the game lookup endpoint responds. Individual game searches use the gameId parameter."
        },
        {
            name: "Live NFL Data",
            check: "Live NFL Games",
            description: "Checks whether live NFL game data can be retrieved."
        }
    ];

    const predictionDependencies = [
        getStatus("Live NFL Games"),
        getStatus("Player Lookup")
    ];

    const predictionDataStatus =
        predictionDependencies.some(
            (check) => check?.status === "Error"
        )
            ? "Error"
            : predictionDependencies.every(
                (check) => check?.status === "Working"
            )
                ? "Working"
                : "Not Available";

    return (
        <div>
            <h1>System Status</h1>

            <button
                type="button"
                onClick={checkHealth}
                disabled={loading}
            >
                {loading ? "Checking..." : "Refresh Status"}
            </button>

            <h2>Feature Status</h2>

            {loading && <p>Checking feature status...</p>}

            {error && <p role="alert">{error}</p>}

            {health && features.map((feature) => {
                const check = getStatus(feature.check);

                return (
                    <div key={feature.name}>
                        <h3>{feature.name}</h3>

                        <p>
                            Status: {check?.status ?? "Not Available"}
                        </p>

                        <p>{feature.description}</p>

                        {check?.httpStatus !== undefined && (
                            <p>HTTP Status: {check.httpStatus}</p>
                        )}

                        {check?.message && (
                            <p>{check.message}</p>
                        )}
                    </div>
                );
            })}

            <h2>Other Feature Development</h2>

            <h3>Start-Sit</h3>

            <p>
                Player Search:{" "}
                {getStatus("Player Lookup")?.status ?? "Not Available"}
            </p>

            <p>Player Projections: Not Available</p>

            <p>
                Real player search is connected. Real projection data is not
                yet available.
            </p>

            <h3>Predictions</h3>

            <p>NFL Data Dependencies: {predictionDataStatus}</p>

            <p>
                Live game and player lookup endpoints are checked automatically.
                This does not independently verify the prediction page itself.
            </p>

            <h2>Backend Health</h2>

            {loading && <p>Checking backend services...</p>}

            {health && (
                <div>
                    <p>Overall Status: {health.status}</p>

                    {health.checks.map((check) => (
                        <div key={check.name}>
                            <strong>
                                {check.name}: {check.status}
                            </strong>

                            {check.httpStatus !== undefined && (
                                <p>HTTP Status: {check.httpStatus}</p>
                            )}

                            {check.message && (
                                <p>{check.message}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default StatusPanel;
