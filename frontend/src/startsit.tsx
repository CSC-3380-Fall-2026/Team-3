import {useState} from 'react';

function StartSit() {
    {/*Constants*/}
    const [search, setSearch] = useState('');
    const [scoring, setScoring] = useState('PPR');
    const [selectedPlayers, setSelecetedPlayers] = useState<string[]>([]);
    const [results, setResults] = useState(false);

    const players = [
        'Dominic Thriffiley',
        'Lucas Gaudiosi',
        'De John Thompson',
        'Michael Vocke',
        'Anthony Lee',
    ];

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
        {players.filter((name) =>
            name.toLowerCase().includes(search.toLowerCase())
        ).length === 0 ? (
            <p>No players found.</p>
        ) : (
            players
                .filter((name) =>
                    name.toLowerCase().includes(search.toLowerCase())
                )
                .map((name) => (
                    <p key={name}>
                        <button
                            type="button"
                            disabled={
                                selectedPlayers.includes(name) ||
                                selectedPlayers.length >= 5
                            }
                            onClick={() => {
                                setSelecetedPlayers([...selectedPlayers, name]);
                                setSearch('');
                            }}
                        >
                            {name}
                        </button>
                    </p>
                ))
        )}
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
                        const player = fakeProjection[name];
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
                            <p key={player.name}>
                                {player.name}: {player.projection.toFixed(1)} points
                            </p>
                    ))}
                </div>
            )

            }
        </div>
    );
}
export default StartSit;
