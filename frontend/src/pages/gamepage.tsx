type gameValues = {
    sofascoreGameID: string;
    homeTeam: string;
    awayTeam: string;
};

function GamePage(gameValues: gameValues) {
  return (
    <div>
      <h1>NFL Game Details</h1>

      <div style={{ width: "100%", maxWidth: "540px" }}>
        <iframe
          id={`sofa-live-result-embed-${gameValues.sofascoreGameID}`}
          title={`${gameValues.homeTeam} vs ${gameValues.awayTeam}  live score`}
          width="100%"
          height="460"
          src={`https://widgets.sofascore.com/en/embed/liveResult?id=${gameValues.sofascoreGameID}&widgetTheme=light`}
          frameBorder="0"
          scrolling="no"
          style={{ maxWidth: "540px" }}
        />
      </div>
    </div>
  );
}

export default GamePage;
