import { useState } from "react";
import PlayerPage from "./playerpage";
import TeamPage from "./teampage";

function ProfilePagePreview() {
  const [page, setPage] = useState<"player" | "team">("player");
  return (
    <>
      <nav style={{ display: "flex", gap: "12px", padding: "16px" }}>
        <button onClick={() => setPage("player")}>Player Page</button>
        <button onClick={() => setPage("team")}>Team Page</button>
      </nav>

      {page === "player" ? <PlayerPage /> : <TeamPage />}
    </>
  );
}

export default ProfilePageTest;
