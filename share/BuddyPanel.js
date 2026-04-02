/**
 * openbuddy BuddyOverlay — ANSI cursor-addressed overlay, zero layout impact.
 * Buddy width scales with terminal width; main layout reserves the space.
 */
import { useEffect, useState, useCallback } from 'react';
import { useStdout } from 'ink';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export { getBuddyWidth };

const STATE_PATH = join(homedir(), '.config', 'openbuddy', 'state.json');
const STAGES     = [[0, 'egg'], [3, 'baby'], [12, 'adult'], [30, 'elder']];
const EGG_HATCH  = 3;

// ── ANSI helpers ──────────────────────────────────────────────────────────────
const C = {
    reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
    blue: '\x1b[94m', yellow: '\x1b[93m', green: '\x1b[92m',
    magenta: '\x1b[95m', cyan: '\x1b[96m', white: '\x1b[97m', gray: '\x1b[90m',
};
const CREATURE_COLOR = {
    debugrix: C.blue, velocode: C.yellow, refactoron: C.green,
    nullbyte: C.magenta, wizardex: C.cyan, compilox: C.yellow,
};
const CREATURE_NAME = {
    debugrix: 'Debugrix', velocode: 'Velocode', refactoron: 'Refactoron',
    nullbyte: 'Nullbyte', wizardex: 'Wizardex', compilox: 'Compilox',
};
const CREATURE_ASCII = {
    debugrix:   { egg: ['.~~~~.','( ???? )','`~~~~\''], baby: ['(ó‿ò)','/|_|\\','| | '], adult: ['(◉‿◉)','<|  |>','/|\\','d b'], elder: ['╔(◉_◉)╗','║BUG║','╚══╦╝','  ╨ '] },
    velocode:   { egg: ['.~~~~.','( ~~~~ )','`~~~~\''], baby: ['~(>‿<)','  /|\\','  db '], adult: ['~(>‿<)~','~/|\\~','~/ | \\~'], elder: ['≋(>‿<)≋','≋/|\\≋','≋/|\\≋'] },
    refactoron: { egg: ['.~~~~.','( ◇◇◇ )','`~~~~\''], baby: ['/\\_/\\','(o.o)',' >^< '], adult: ['/\\_/\\','(●.●)','(>♦<)','‾‾‾‾'], elder: ['╱\\_/╲','╱●.●╲','(CLEAN)','╲___╱'] },
    nullbyte:   { egg: ['.~~~~.','( ∅∅∅ )','`~~~~\''], baby: ['.~~~~.','|?__?|','`~~~~\''], adult: ['.─────.','│∅  ∅│','│  ▽ │','`─────\''], elder: ['╔═════╗','║∅  ∅║','║NULL║','╚═════╝'] },
    wizardex:   { egg: ['*~~~~*','( ✦✦✦ )','*~~~~*'], baby: [' *.*',' (^_^)',' /|*|\\'], adult: ['✦(^‿^)✦','✦/|~|\\✦','✦|  |✦','✦✦✦✦✦'], elder: ['✦(◕‿◕)✦','✦|MAGIC|✦','✦| |✦','✦✦✦✦✦'] },
    compilox:   { egg: ['.~~~~.','( .... )','`~~~~\''], baby: ['(u u)','/| |\\','| | '], adult: ['(u_u)','/|  |\\','|·|·|','d  b'], elder: ['┌(u_u)┐','│BUILD│','│ OK │','└────┘'] },
};
const IDLE_QUOTES = {
    debugrix:   ['sniffing bugs...', 'NULL? Really?', 'I smell a segfault.'],
    velocode:   ['O(n) too slow.', 'Cache everything.', 'Waiting... ugh.'],
    refactoron: ['Extract that method.', 'Magic numbers?'],
    nullbyte:   ['...', 'void.', 'NaN.'],
    wizardex:   ['tried monads?', 'Lambda > loop.'],
    compilox:   ['...compiling...', '56 warnings. Fine.'],
};

// ── Sizing ────────────────────────────────────────────────────────────────────

/** Returns the buddy panel's total width (including borders) for a given terminal width.
 *  0 = hidden. Used by both BuddyPanel and DefaultAppLayout. */
function getBuddyWidth(terminalWidth) {
    if (terminalWidth >= 130) return 20; // inner=18
    if (terminalWidth >= 105) return 16; // inner=14
    if (terminalWidth >=  85) return 13; // inner=11
    if (terminalWidth >=  65) return 11; // inner=9, art only
    return 0;
}

// ── Data helpers ──────────────────────────────────────────────────────────────

function getStage(sessions) {
    let s = 'egg';
    for (const [t, n] of STAGES) if (sessions >= t) s = n;
    return s;
}
function loadState() {
    try { return JSON.parse(readFileSync(STATE_PATH, 'utf8')); }
    catch { return null; }
}
function pickQuote(key) {
    const q = IDLE_QUOTES[key] || ['...'];
    return q[Math.floor(Math.random() * q.length)];
}

// ── Rendering ─────────────────────────────────────────────────────────────────

/** Strip ANSI, return visible length */
function vlen(s) { return s.replace(/\x1b\[[0-9;]*m/g, '').length; }

/** Truncate string to max visible width w, keeping ANSI intact as best-effort */
function truncate(s, w) {
    let visible = 0;
    let result  = '';
    let inEsc   = false;
    for (const ch of s) {
        if (ch === '\x1b') { inEsc = true; result += ch; continue; }
        if (inEsc) { result += ch; if (ch === 'm') inEsc = false; continue; }
        if (visible >= w) break;
        result += ch; visible++;
    }
    return result;
}

/** Pad/truncate to exact visible width w */
function fit(s, w) {
    const v = vlen(s);
    if (v > w) return truncate(s, w);
    return s + ' '.repeat(w - v);
}

function buildLines(state, quote, panelWidth) {
    const inner  = panelWidth - 2; // subtract left+right border chars
    const show   = inner >= 9;
    if (!show) return [];

    const sessions  = state?.sessions || 0;
    const isEgg     = !state?.hatched;
    const key       = state?.creature || 'compilox';
    const color     = CREATURE_COLOR[key] || C.white;
    const stage     = getStage(sessions);
    const art       = (CREATURE_ASCII[key] || CREATURE_ASCII.compilox)[stage] || [];
    const stageIcon = { egg: '🥚', baby: '🐣', adult: '✨', elder: '👑' }[stage];
    const nextAt    = STAGES.find(([t]) => t > sessions)?.[0];
    const showQuote = inner >= 11; // skip quote on very narrow panels
    const showMeta  = inner >= 11;

    const hr    = '─'.repeat(inner);
    const lines = [`${color}╭${hr}╮${C.reset}`];

    const row = (raw, c = color) => {
        const content = fit(raw, inner);
        lines.push(`${color}│${C.reset}${c}${content}${C.reset}${color}│${C.reset}`);
    };

    if (isEgg) {
        row(`${C.bold}???${C.reset}`, C.white);
        if (showMeta) row(`EGG ${sessions}/${EGG_HATCH}`, C.gray);
        row('');
        for (const l of art) row(l, C.white + C.bold);
        if (showMeta) {
            row('');
            row(`-${EGG_HATCH - sessions} session(s)`, C.yellow);
        }
        if (showQuote && quote) { row(''); row(`"${quote}"`, C.gray + C.dim); }
    } else {
        const name = CREATURE_NAME[key] || key;
        row(`${C.bold}${stageIcon}${name}${C.reset}`, color);
        if (showMeta && nextAt) row(`s:${sessions}→${nextAt}`, C.gray);
        row('');
        for (const l of art) row(l, color + C.bold);
        if (showQuote && quote) { row(''); row(`"${quote}"`, color + C.dim); }
    }

    lines.push(`${color}╰${hr}╯${C.reset}`);
    return lines;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const BuddyPanel = ({ terminalWidth }) => {
    const { stdout } = useStdout();
    const [state, setState] = useState(() => loadState());
    const [quote, setQuote] = useState(() => pickQuote(state?.creature));

    const draw = useCallback(() => {
        if (!stdout || !terminalWidth) return;
        const panelW = getBuddyWidth(terminalWidth);
        if (panelW === 0) return;

        // Start column (1-indexed for ANSI): right-align to terminal edge
        const col  = terminalWidth - panelW + 1;
        const lines = buildLines(state, quote, panelW);
        if (!lines.length) return;

        let buf = '\x1b7'; // save cursor (DEC)
        lines.forEach((line, i) => {
            buf += `\x1b[${i + 1};${col}H${line}`;
        });
        buf += '\x1b8'; // restore cursor
        stdout.write(buf);
    }, [state, quote, terminalWidth, stdout]);

    // Redraw after every Ink render
    useEffect(() => { draw(); });

    // Periodic reload
    useEffect(() => {
        const sid = setInterval(() => setState(loadState()), 5000);
        const qid = setInterval(() => {
            const s = loadState();
            if (s?.creature) setQuote(pickQuote(s.creature));
        }, 12000);
        return () => { clearInterval(sid); clearInterval(qid); };
    }, []);

    return null;
};
