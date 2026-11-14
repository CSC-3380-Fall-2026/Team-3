export type FeatureStatus =
    | "Not Started"
    | "In Progress"
    | "Implemented"
    | "Working"
    | "Error";

export type Feature = {
    name: string;
    status: FeatureStatus;
    description: string;
};

export const featureStatus: Feature[] = [
    {
        name: "NFL Team and Player Lookup",
        status: "Implemented",
        description: "Team and player search endpoints exist."
    },
    {
        name: "Historical Game Lookup",
        status: "Implemented",
        description: "Historical team game endpoint exists."
    },
    {
        name: "Live NFL Data",
        status: "Implemented",
        description: "ESPN live game and player statistics endpoints exist."
    },
    {
        name: "Start-Sit",
        status: "In Progress",
        description: "Real NFL player search is connected. Real projection data is not yet available."
    },
    {
        name: "Predictions",
        status: "Implemented",
        description: "Retrieves live NFL game and player data through the backend. Runtime verification is still needed."
    },
    {
        name: "Game Details",
        status: "In Progress",
        description: "Game details integration needs further verification."
    },
    {
        name: "Sportsbook Integration",
        status: "Not Started",
        description: "Integration is not currently implemented."
    }
];
