import { CircuitRecord, DriverCareer, Driver, RaceResultRecord, Team } from '../types';

// Aplica una carrera a los records de circuito y a las estadísticas de piloto.
// Muta los mapas (copias). Los nombres se denormalizan (sobreviven a retiradas).
export function applyRaceToRecords(
    records: Record<string, CircuitRecord>,
    driverRecords: Record<string, DriverCareer>,
    record: RaceResultRecord,
    drivers: Record<string, Driver>,
    teams: Record<string, Team>,
): { fastestLapRecord: boolean } {
    const bump = (id: string, name: string, f: (c: DriverCareer) => void) => {
        const c = driverRecords[id] ?? { name, wins: 0, poles: 0, podiums: 0, fastestLaps: 0, races: 0 };
        c.name = name;
        f(c);
        driverRecords[id] = c;
    };

    for (const r of record.classification) {
        const name = drivers[r.driverId]?.name ?? driverRecords[r.driverId]?.name ?? r.driverId;
        bump(r.driverId, name, c => {
            c.races += 1;
            if (r.position === 1) c.wins += 1;
            if (r.position !== null && r.position <= 3) c.podiums += 1;
            if (r.fastestLap) c.fastestLaps += 1;
        });
    }
    const pole = record.classification.find(c => c.driverId === record.polesitterId);
    if (pole) bump(pole.driverId, drivers[pole.driverId]?.name ?? pole.driverId, c => { c.poles += 1; });

    // Record de vuelta rápida del circuito.
    let fastestLapRecord = false;
    if (record.fastestLapTime && record.fastestLapDriverId) {
        const cur = records[record.circuitId];
        if (!cur || record.fastestLapTime < cur.time) {
            const d = drivers[record.fastestLapDriverId];
            records[record.circuitId] = {
                driverName: d?.name ?? record.fastestLapDriverId,
                teamName: d?.teamId ? teams[d.teamId]?.shortName ?? '' : '',
                time: record.fastestLapTime,
                season: record.season,
            };
            fastestLapRecord = true;
        }
    }
    return { fastestLapRecord };
}
