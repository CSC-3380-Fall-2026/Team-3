PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS teams
(
    team_abbr     TEXT PRIMARY KEY NOT NULL,
    team_name     TEXT             NOT NULL,
    team_conf     TEXT,
    team_division TEXT
);

CREATE TABLE IF NOT EXISTS players
(
    player_id   TEXT PRIMARY KEY NOT NULL,
    player_name TEXT             NOT NULL,
    position    TEXT,
    team_abbr   TEXT,
    FOREIGN KEY (team_abbr) REFERENCES teams (team_abbr)
);

CREATE TABLE IF NOT EXISTS games
(
    game_id     TEXT PRIMARY KEY NOT NULL,
    season      INTEGER          NOT NULL,
    week        INTEGER          NOT NULL,
    game_type   TEXT,
    game_date   TEXT,
    home_team   TEXT             NOT NULL,
    away_team   TEXT             NOT NULL,
    home_score  INTEGER,
    away_score  INTEGER,
    game_status TEXT,
    FOREIGN KEY (home_team) REFERENCES teams (team_abbr),
    FOREIGN KEY (away_team) REFERENCES teams (team_abbr)
);

CREATE TABLE IF NOT EXISTS player_stats
(
    player_id             TEXT NOT NULL,
    game_id               TEXT NOT NULL,
    team_abbr             TEXT,
    passing_yards         REAL,
    passing_tds           INTEGER,
    passing_interceptions INTEGER,
    rushing_yards         REAL,
    rushing_tds           INTEGER,
    receptions            INTEGER,
    receiving_yards       REAL,
    receiving_tds         INTEGER,
    fumbles_lost          INTEGER,

    PRIMARY KEY (player_id, game_id),
    FOREIGN KEY (player_id) REFERENCES players (player_id),
    FOREIGN KEY (game_id) REFERENCES games (game_id),
    FOREIGN KEY (team_abbr) REFERENCES teams (team_abbr)
);

CREATE TABLE IF NOT EXISTS plays
(
    game_id                TEXT    NOT NULL,
    play_id                INTEGER NOT NULL,
    qtr                    INTEGER,
    game_seconds_remaining INTEGER,
    down                   INTEGER,
    ydstogo                INTEGER,
    yardline_100           REAL,
    posteam                TEXT,
    score_differential     INTEGER,
    passer_player_id       TEXT,
    receiver_player_id     TEXT,
    rusher_player_id       TEXT,
    passing_yards          REAL,
    receiving_yards        REAL,
    rushing_yards          REAL,
    complete_pass          INTEGER,

    PRIMARY KEY (game_id, play_id),
    FOREIGN KEY (game_id) REFERENCES games (game_id)
);