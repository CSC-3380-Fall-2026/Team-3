PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

INSERT INTO teams (team_abbr, team_name, team_conf, team_division)
VALUES ('TEST', 'SmartBet Test', NULL, NULL)
ON CONFLICT(team_abbr) DO NOTHING;

INSERT INTO players (player_id, player_name, position, team_abbr)
VALUES
    ('mock1', 'Dominic Thriffiley', 'QB', 'TEST'),
    ('mock2', 'Lucas Gaudiosi', 'QB', 'TEST'),
    ('mock3', 'De John Thompson', 'QB', 'TEST'),
    ('mock4', 'Michael Vocke', 'QB', 'TEST'),
    ('mock5', 'Anthony Lee', 'QB', 'TEST')
ON CONFLICT(player_id) DO NOTHING;

COMMIT;
