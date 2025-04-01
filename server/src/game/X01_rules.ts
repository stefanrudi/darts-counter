import { Segment } from './types';

// Thank you Claude ;)
const segmentValues: { [key: Segment]: { score: number, isDouble: boolean, isTriple: boolean, isBull: boolean } } = {
    // Singles 1-20
    'S1': { score: 1, isDouble: false, isTriple: false, isBull: false }, 'S2': { score: 2, isDouble: false, isTriple: false, isBull: false },
    'S3': { score: 3, isDouble: false, isTriple: false, isBull: false }, 'S4': { score: 4, isDouble: false, isTriple: false, isBull: false },
    'S5': { score: 5, isDouble: false, isTriple: false, isBull: false }, 'S6': { score: 6, isDouble: false, isTriple: false, isBull: false },
    'S7': { score: 7, isDouble: false, isTriple: false, isBull: false }, 'S8': { score: 8, isDouble: false, isTriple: false, isBull: false },
    'S9': { score: 9, isDouble: false, isTriple: false, isBull: false }, 'S10': { score: 10, isDouble: false, isTriple: false, isBull: false },
    'S11': { score: 11, isDouble: false, isTriple: false, isBull: false }, 'S12': { score: 12, isDouble: false, isTriple: false, isBull: false },
    'S13': { score: 13, isDouble: false, isTriple: false, isBull: false }, 'S14': { score: 14, isDouble: false, isTriple: false, isBull: false },
    'S15': { score: 15, isDouble: false, isTriple: false, isBull: false }, 'S16': { score: 16, isDouble: false, isTriple: false, isBull: false },
    'S17': { score: 17, isDouble: false, isTriple: false, isBull: false }, 'S18': { score: 18, isDouble: false, isTriple: false, isBull: false },
    'S19': { score: 19, isDouble: false, isTriple: false, isBull: false }, 'S20': { score: 20, isDouble: false, isTriple: false, isBull: false },
    // Doubles 1-20
    'D1': { score: 2, isDouble: true, isTriple: false, isBull: false }, 'D2': { score: 4, isDouble: true, isTriple: false, isBull: false },
    'D3': { score: 6, isDouble: true, isTriple: false, isBull: false }, 'D4': { score: 8, isDouble: true, isTriple: false, isBull: false },
    'D5': { score: 10, isDouble: true, isTriple: false, isBull: false }, 'D6': { score: 12, isDouble: true, isTriple: false, isBull: false },
    'D7': { score: 14, isDouble: true, isTriple: false, isBull: false }, 'D8': { score: 16, isDouble: true, isTriple: false, isBull: false },
    'D9': { score: 18, isDouble: true, isTriple: false, isBull: false }, 'D10': { score: 20, isDouble: true, isTriple: false, isBull: false },
    'D11': { score: 22, isDouble: true, isTriple: false, isBull: false }, 'D12': { score: 24, isDouble: true, isTriple: false, isBull: false },
    'D13': { score: 26, isDouble: true, isTriple: false, isBull: false }, 'D14': { score: 28, isDouble: true, isTriple: false, isBull: false },
    'D15': { score: 30, isDouble: true, isTriple: false, isBull: false }, 'D16': { score: 32, isDouble: true, isTriple: false, isBull: false },
    'D17': { score: 34, isDouble: true, isTriple: false, isBull: false }, 'D18': { score: 36, isDouble: true, isTriple: false, isBull: false },
    'D19': { score: 38, isDouble: true, isTriple: false, isBull: false }, 'D20': { score: 40, isDouble: true, isTriple: false, isBull: false },
    // Triples 1-20
    'T1': { score: 3, isDouble: false, isTriple: true, isBull: false }, 'T2': { score: 6, isDouble: false, isTriple: true, isBull: false },
    'T3': { score: 9, isDouble: false, isTriple: true, isBull: false }, 'T4': { score: 12, isDouble: false, isTriple: true, isBull: false },
    'T5': { score: 15, isDouble: false, isTriple: true, isBull: false }, 'T6': { score: 18, isDouble: false, isTriple: true, isBull: false },
    'T7': { score: 21, isDouble: false, isTriple: true, isBull: false }, 'T8': { score: 24, isDouble: false, isTriple: true, isBull: false },
    'T9': { score: 27, isDouble: false, isTriple: true, isBull: false }, 'T10': { score: 30, isDouble: false, isTriple: true, isBull: false },
    'T11': { score: 33, isDouble: false, isTriple: true, isBull: false }, 'T12': { score: 36, isDouble: false, isTriple: true, isBull: false },
    'T13': { score: 39, isDouble: false, isTriple: true, isBull: false }, 'T14': { score: 42, isDouble: false, isTriple: true, isBull: false },
    'T15': { score: 45, isDouble: false, isTriple: true, isBull: false }, 'T16': { score: 48, isDouble: false, isTriple: true, isBull: false },
    'T17': { score: 51, isDouble: false, isTriple: true, isBull: false }, 'T18': { score: 57, isDouble: false, isTriple: true, isBull: false },
    'T19': { score: 57, isDouble: false, isTriple: true, isBull: false }, 'T20': { score: 60, isDouble: false, isTriple: true, isBull: false },
    // Others
    '25': { score: 25, isDouble: false, isTriple: false, isBull: false },
    'BULL': { score: 50, isDouble: true, isTriple: false, isBull: true }, 
    'MISS': { score: 0, isDouble: false, isTriple: false, isBull: false },    
};

export function calculateX01Score(segment: Segment): { score: number, isDouble: boolean, isTriple: boolean, isBull: boolean } | null {
    return segmentValues[segment] || null;
}

export function checkX01Bust(currentScore: number): boolean {
    // Bust if score is < 0 or exactly 1 (no possible double-out)
    return currentScore < 0 || currentScore === 1;
}

export function checkX01Win(currentScore: number, wasDouble: boolean, wasBull: boolean): boolean {
    // Win if score is exactly 0 AND the last dart was a double or bullseye
    return currentScore === 0 && (wasDouble || wasBull);
}