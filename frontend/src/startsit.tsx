import {useEffect, useState} from 'react';
import {getData} from './api';

type Player = {
    player_id: string;
    player_name: string;
    position: string;
    team_abbr: string;
};

function StartSit() {
    {/*Constants*/}
    const [search, setSearch] = useState('');
    const [scoring, setScoring] = useState('PPR');
    const [selectedPlayers, setSelecetedPlayers] = useState<string[]>([]);
    const [results, setResults] = useState(false);
    const [activePlayer, setActivePlayer] = useState('');

const [players, setPlayers] = useState<Player[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

useEffect(() => {
    if (search.trim() === '') {
        setPlayers([]);
        setError('');
        return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
        setLoading(true);
        setError('');

        try {
            const data = await getData<Player[]>(
                `/players/search?name=${encodeURIComponent(search.trim())}`
            );

            if (!cancelled) {
                setPlayers(data);
            }
        } catch {
            if (!cancelled) {
                setError('Unable to search players.');
                setPlayers([]);
            }
        } finally {
            if (!cancelled) {
                setLoading(false);
            }
        }
    }, 300);

    return () => {
        cancelled = true;
        clearTimeout(timer);
    };
}, [search]);

    const fakeProjection: Record<string, {yards: number; receptions: number}> = {
        'Dominic Thriffiley': {yards: 10.2, receptions: 2.1},
        'Lucas Gaudiosi': {yards: 90.5  , receptions: 8.2},
        'De John Thompson': {yards: 150.1, receptions: 12.6},
        'Michael Vocke': {yards: 40.4, receptions: 7.4},
        'Anthony Lee': {yards: 50.7, receptions: 9.5},
    }

    return (
        <div>
            <h1>Start/Sit</h1>
            <label htmlFor="scoring"> Scoring:
            </label>

            {/*select scoring type dropdown*/}
            <select id="scoring"
                    value={scoring}
                    onChange={(event) => setScoring(event.target.value)}
            >
                <option>Standard</option>
                <option>Half-PPR</option>
                <option>PPR</option>
            </select>

            {/*Search box*/}
            <h2>Select Players</h2>
            <label htmlFor={"search"}>Search players:</label>
            <input
                id="search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
            />

            {/*search boundaries*/}
            {search.trim() !== '' && (
                <div>
                    {loading && <p>Searching...</p>}
                    {error && <p>{error}</p>}

                    {!loading && !error && players.length === 0 && (
                        <p>No players found.</p>
                    )}

                    {!loading && !error && players.map((player) => (
                        <p key={player.player_id}>
                            <button
                                type="button"
                                disabled={
                                    selectedPlayers.includes(player.player_name) ||
                                    selectedPlayers.length >= 5
                                }
                                onClick={() => {
                                    setSelecetedPlayers([
                                        ...selectedPlayers,
                                        player.player_name
                                    ]);
                                    setSearch('');
                                }}
                            >
                                {player.player_name} ({player.position} - {player.team_abbr})
                            </button>
                        </p>
                    ))}
                </div>
            )}

            {/*makes list of players clicked*/}
            <div>
                {selectedPlayers.map((name) => (
                    <p key={name}>{name}</p>
                ))
                }
            </div>

            {/*go button*/}
            <button
                type="button"
                disabled={selectedPlayers.length === 0}
                onClick={() => setResults(true)}
            >
                Go
            </button>

            {/*result*/}
            {results && (
                <div>
                    <h2>Start-Sit Comparison</h2>
                    <p>Scoring: {scoring}</p>

                    {/*PPR Calc and Sorting*/}
                    {selectedPlayers.map((name) => {
                        const player = fakeProjection[name] ?? {yards: 0, receptions: 0};
                        let pprCalc;

                        if (scoring === 'PPR'){
                            pprCalc = 1;
                        }else if (scoring === 'Half-PPR'){
                            pprCalc = .5;
                        }else{
                            pprCalc = 0;
                        }

                        const projection = (player.yards / 10) + (player.receptions * pprCalc);

                        return{ name, projection};
                    })
                        .sort((a,b) => b.projection - a.projection)
                        .map((player) =>(
                            <div key={player.name}>
                            <button
                                type="button"
                                onClick={() => setActivePlayer(player.name)}
                                aria-expanded={activePlayer === player.name}
                            >
                                {player.name}
                            </button>
                            : {player.projection.toFixed(1)} points

                            {activePlayer === player.name && (
                                <div>
                                    <p>Projected yards: {fakeProjection[player.name].yards}</p>
                                    <p>Projected receptions: {fakeProjection[player.name].receptions}</p>
                                    <p>Projected fantasy points ({scoring}): {player.projection.toFixed(1)}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )

            }
        </div>
    );
}
export default StartSit;
