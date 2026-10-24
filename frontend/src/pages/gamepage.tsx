
function GamePage() {
  return (
    <div>
      <h1>NFL Game Details</h1>

      <div style={{ width: "100%", maxWidth: "540px" }}>
        <iframe
          id="sofa-live-result-embed-16183735"
          title="Chicago Bears vs New England Patriots live score"
          width="100%"
          height="460"
          src="https://widgets.sofascore.com/en/embed/liveResult?id=16183735&widgetTheme=light"
          frameBorder="0"
          scrolling="no"
          style={{ maxWidth: "540px" }}
        />

        <div style={{ fontSize: "12px", fontFamily: "Arial, sans-serif" }}>
          <a
            href="https://www.sofascore.com/american-football/match/new-england-patriots-chicago-bears/QMbszNb#id:16183735"
            target="_blank"
            rel="noreferrer"
          >
            Chicago Bears - New England Patriots Live Score
          </a>
        </div>
      </div>
    </div>
  );
}

export default GamePage;
