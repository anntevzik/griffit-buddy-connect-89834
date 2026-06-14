import QuizGame, { QuizRound } from "./QuizGame";

const rand = (n: number) => Math.floor(Math.random() * n);
const pick = <T,>(arr: T[]) => arr[rand(arr.length)];
const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

function buildNumeric(answer: number, spread: number): QuizRound["options"] {
  const set = new Set<number>([answer]);
  while (set.size < 4) {
    const delta = rand(spread * 2 + 1) - spread;
    const v = answer + delta;
    if (v >= 0) set.add(v);
  }
  return shuffle([...set]).map(String);
}

function fromWords(answer: string, pool: string[]): QuizRound {
  const opts = new Set<string>([answer]);
  while (opts.size < 4 && pool.length > opts.size) {
    opts.add(pick(pool));
  }
  const arr = shuffle([...opts]);
  return {
    prompt: "",
    options: arr,
    answerIndex: arr.indexOf(answer),
  };
}

type Gen = (level: number) => QuizRound;

/* ----- Generators ----- */

const gAddition: Gen = (l) => {
  const max = Math.min(5 + l * 2, 50);
  const a = rand(max) + 1;
  const b = rand(max) + 1;
  const ans = a + b;
  const opts = buildNumeric(ans, Math.max(3, l));
  return { prompt: `${a} + ${b} = ?`, options: opts, answerIndex: opts.indexOf(String(ans)) };
};

const gSubtraction: Gen = (l) => {
  const max = Math.min(5 + l * 2, 50);
  const a = rand(max) + 2;
  const b = rand(a) + 1;
  const ans = a - b;
  const opts = buildNumeric(ans, Math.max(3, l));
  return { prompt: `${a} - ${b} = ?`, options: opts, answerIndex: opts.indexOf(String(ans)) };
};

const gMultiplication: Gen = (l) => {
  const max = Math.min(2 + l, 12);
  const a = rand(max) + 1;
  const b = rand(max) + 1;
  const ans = a * b;
  const opts = buildNumeric(ans, Math.max(4, l + 2));
  return { prompt: `${a} × ${b} = ?`, options: opts, answerIndex: opts.indexOf(String(ans)) };
};

const gDivision: Gen = (l) => {
  const max = Math.min(2 + l, 12);
  const b = rand(max) + 1;
  const ans = rand(max) + 1;
  const a = ans * b;
  const opts = buildNumeric(ans, Math.max(3, l));
  return { prompt: `${a} ÷ ${b} = ?`, options: opts, answerIndex: opts.indexOf(String(ans)) };
};

const gDoubles: Gen = (l) => {
  const n = rand(5 + l * 2) + 1;
  const ans = n * 2;
  const opts = buildNumeric(ans, l + 2);
  return { prompt: `Double of ${n}?`, options: opts, answerIndex: opts.indexOf(String(ans)) };
};

const gHalves: Gen = (l) => {
  const n = (rand(5 + l) + 1) * 2;
  const ans = n / 2;
  const opts = buildNumeric(ans, l + 2);
  return { prompt: `Half of ${n}?`, options: opts, answerIndex: opts.indexOf(String(ans)) };
};

const gGreaterLess: Gen = (l) => {
  const max = Math.min(10 + l * 3, 99);
  const a = rand(max);
  const b = rand(max);
  const ans = a > b ? `${a}` : `${b}`;
  const opts = shuffle([`${a}`, `${b}`, `${rand(max)}`, `${rand(max)}`]);
  return { prompt: `Which is bigger?`, subPrompt: `${a}   vs   ${b}`, options: opts, answerIndex: opts.indexOf(ans) };
};

const gSmallest: Gen = (l) => {
  const max = Math.min(10 + l * 3, 99);
  const nums = Array.from({ length: 4 }, () => rand(max) + 1);
  const ans = String(Math.min(...nums));
  const opts = shuffle(nums.map(String));
  return { prompt: "Which is the smallest?", options: opts, answerIndex: opts.indexOf(ans) };
};

const gNumberOrder: Gen = (l) => {
  const start = rand(20) + 1;
  const step = Math.min(1 + Math.floor(l / 2), 5);
  const ans = start + step;
  const opts = buildNumeric(ans, l + 2);
  return { prompt: `What comes after ${start}? (step ${step})`, options: opts, answerIndex: opts.indexOf(String(ans)) };
};

const gEvenOdd: Gen = (l) => {
  const n = rand(20 + l * 5) + 1;
  const ans = n % 2 === 0 ? "Even" : "Odd";
  const opts = ["Even", "Odd"];
  return { prompt: `Is ${n} even or odd?`, options: opts, answerIndex: opts.indexOf(ans) };
};

const gMissingNumber: Gen = (l) => {
  const step = rand(Math.min(l, 4)) + 1;
  const start = rand(10) + 1;
  const seq = [start, start + step, start + 2 * step, start + 3 * step];
  const idx = rand(4);
  const ans = seq[idx];
  const shown = seq.map((v, i) => (i === idx ? "?" : String(v))).join(", ");
  const opts = buildNumeric(ans, l + 2);
  return { prompt: `Find the missing number:`, subPrompt: shown, options: opts, answerIndex: opts.indexOf(String(ans)) };
};

/* Word / language */

const OPPOSITES: [string, string][] = [
  ["hot", "cold"], ["big", "small"], ["happy", "sad"], ["up", "down"],
  ["fast", "slow"], ["day", "night"], ["wet", "dry"], ["full", "empty"],
  ["loud", "quiet"], ["soft", "hard"], ["open", "closed"], ["high", "low"],
  ["young", "old"], ["light", "dark"], ["clean", "dirty"], ["near", "far"],
];
const gOpposites: Gen = () => {
  const [a, b] = pick(OPPOSITES);
  const pool = OPPOSITES.flatMap(([x, y]) => [x, y]).filter((w) => w !== a && w !== b);
  const round = fromWords(b, pool);
  return { ...round, prompt: `Opposite of "${a}"?` };
};

const RHYMES: [string, string[]][] = [
  ["cat", ["bat", "hat", "rat", "mat"]],
  ["dog", ["log", "fog", "frog", "jog"]],
  ["sun", ["fun", "run", "bun", "one"]],
  ["star", ["car", "far", "jar", "bar"]],
  ["tree", ["bee", "see", "knee", "free"]],
  ["cake", ["bake", "lake", "snake", "make"]],
  ["bear", ["chair", "hair", "pear", "stair"]],
];
const gRhymes: Gen = () => {
  const [w, rh] = pick(RHYMES);
  const ans = pick(rh);
  const pool = RHYMES.flatMap(([, l]) => l).filter((x) => !rh.includes(x));
  const round = fromWords(ans, pool);
  return { ...round, prompt: `Which word rhymes with "${w}"?` };
};

const SYNONYMS: [string, string, string[]][] = [
  ["big", "large", ["small", "tiny", "thin"]],
  ["happy", "glad", ["sad", "angry", "tired"]],
  ["fast", "quick", ["slow", "late", "soft"]],
  ["smart", "clever", ["silly", "lazy", "loud"]],
  ["pretty", "beautiful", ["ugly", "messy", "dull"]],
  ["scared", "afraid", ["brave", "happy", "calm"]],
];
const gSynonyms: Gen = () => {
  const [w, ans, distract] = pick(SYNONYMS);
  const round = fromWords(ans, distract);
  return { ...round, prompt: `Which means the same as "${w}"?` };
};

const FIRST_LETTERS = ["apple", "ball", "cat", "dog", "egg", "fish", "goat", "hat", "ice", "juice"];
const gFirstLetter: Gen = () => {
  const w = pick(FIRST_LETTERS);
  const ans = w[0].toUpperCase();
  const opts = new Set<string>([ans]);
  while (opts.size < 4) opts.add(String.fromCharCode(65 + rand(26)));
  const arr = shuffle([...opts]);
  return { prompt: `What letter does "${w}" start with?`, options: arr, answerIndex: arr.indexOf(ans) };
};

const gLastLetter: Gen = () => {
  const w = pick(FIRST_LETTERS);
  const ans = w[w.length - 1].toUpperCase();
  const opts = new Set<string>([ans]);
  while (opts.size < 4) opts.add(String.fromCharCode(65 + rand(26)));
  const arr = shuffle([...opts]);
  return { prompt: `What letter does "${w}" end with?`, options: arr, answerIndex: arr.indexOf(ans) };
};

const gWordLength: Gen = (l) => {
  const words = ["sun", "tree", "house", "rabbit", "elephant", "butterfly", "cat", "moon", "school"];
  const w = pick(words.filter((x) => x.length <= 4 + l));
  const ans = String(w.length);
  const opts = buildNumeric(w.length, 3);
  return { prompt: `How many letters in "${w}"?`, options: opts, answerIndex: opts.indexOf(ans) };
};

/* Knowledge */

const ANIMAL_SOUNDS: [string, string, string[]][] = [
  ["Cow", "Moo", ["Bark", "Meow", "Roar"]],
  ["Dog", "Bark", ["Moo", "Quack", "Tweet"]],
  ["Cat", "Meow", ["Bark", "Roar", "Buzz"]],
  ["Duck", "Quack", ["Meow", "Hoot", "Bark"]],
  ["Lion", "Roar", ["Tweet", "Moo", "Hiss"]],
  ["Bee", "Buzz", ["Roar", "Moo", "Bark"]],
  ["Owl", "Hoot", ["Quack", "Bark", "Tweet"]],
  ["Snake", "Hiss", ["Moo", "Hoot", "Bark"]],
];
const gAnimalSound: Gen = () => {
  const [a, s, d] = pick(ANIMAL_SOUNDS);
  const r = fromWords(s, d);
  return { ...r, prompt: `What sound does a ${a} make?` };
};

const ANIMAL_BABY: [string, string, string[]][] = [
  ["Dog", "Puppy", ["Kitten", "Calf", "Chick"]],
  ["Cat", "Kitten", ["Puppy", "Foal", "Cub"]],
  ["Cow", "Calf", ["Foal", "Puppy", "Chick"]],
  ["Horse", "Foal", ["Cub", "Calf", "Puppy"]],
  ["Bear", "Cub", ["Chick", "Foal", "Calf"]],
  ["Chicken", "Chick", ["Cub", "Puppy", "Kitten"]],
];
const gAnimalBaby: Gen = () => {
  const [a, b, d] = pick(ANIMAL_BABY);
  const r = fromWords(b, d);
  return { ...r, prompt: `What is a baby ${a} called?` };
};

const ANIMAL_HABITAT: [string, string, string[]][] = [
  ["Fish", "Water", ["Tree", "Cave", "Sky"]],
  ["Bird", "Tree", ["Water", "Cave", "Burrow"]],
  ["Bear", "Cave", ["Water", "Sky", "Tree"]],
  ["Rabbit", "Burrow", ["Water", "Sky", "Cave"]],
  ["Bee", "Hive", ["Cave", "Water", "Burrow"]],
];
const gHabitat: Gen = () => {
  const [a, h, d] = pick(ANIMAL_HABITAT);
  const r = fromWords(h, d);
  return { ...r, prompt: `Where does a ${a} live?` };
};

const FOOD_GROUP: [string, string, string[]][] = [
  ["Apple", "Fruit", ["Vegetable", "Grain", "Dairy"]],
  ["Carrot", "Vegetable", ["Fruit", "Meat", "Dairy"]],
  ["Bread", "Grain", ["Fruit", "Dairy", "Meat"]],
  ["Milk", "Dairy", ["Grain", "Fruit", "Vegetable"]],
  ["Banana", "Fruit", ["Vegetable", "Dairy", "Meat"]],
  ["Cheese", "Dairy", ["Grain", "Fruit", "Vegetable"]],
];
const gFoodGroup: Gen = () => {
  const [f, g, d] = pick(FOOD_GROUP);
  const r = fromWords(g, d);
  return { ...r, prompt: `${f} is a type of?` };
};

const COLOR_OF: [string, string, string[]][] = [
  ["Banana", "Yellow", ["Blue", "Red", "Green"]],
  ["Grass", "Green", ["Red", "Brown", "Blue"]],
  ["Sky", "Blue", ["Pink", "Green", "Orange"]],
  ["Strawberry", "Red", ["Blue", "Green", "Yellow"]],
  ["Carrot", "Orange", ["Blue", "Purple", "Green"]],
  ["Snow", "White", ["Black", "Red", "Blue"]],
];
const gColorOf: Gen = () => {
  const [thing, c, d] = pick(COLOR_OF);
  const r = fromWords(c, d);
  return { ...r, prompt: `What color is a ${thing}?` };
};

const SHAPES: string[] = ["Circle", "Square", "Triangle", "Rectangle", "Star", "Heart", "Oval", "Diamond"];
const SHAPE_EMOJI: Record<string, string> = {
  Circle: "⚪", Square: "🟦", Triangle: "🔺", Rectangle: "▭",
  Star: "⭐", Heart: "❤️", Oval: "🥚", Diamond: "🔷",
};
const gShapeName: Gen = () => {
  const s = pick(SHAPES);
  const r = fromWords(s, SHAPES.filter((x) => x !== s));
  return { ...r, prompt: `What shape is this?`, subPrompt: SHAPE_EMOJI[s] };
};

const gShapeSides: Gen = () => {
  const list: [string, number][] = [
    ["Triangle", 3], ["Square", 4], ["Pentagon", 5], ["Hexagon", 6], ["Octagon", 8],
  ];
  const [name, n] = pick(list);
  const opts = buildNumeric(n, 3);
  return { prompt: `How many sides does a ${name} have?`, options: opts, answerIndex: opts.indexOf(String(n)) };
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const gDayAfter: Gen = () => {
  const i = rand(7);
  const ans = DAYS[(i + 1) % 7];
  const r = fromWords(ans, DAYS.filter((d) => d !== ans));
  return { ...r, prompt: `What day comes after ${DAYS[i]}?` };
};

const gDayBefore: Gen = () => {
  const i = rand(7);
  const ans = DAYS[(i + 6) % 7];
  const r = fromWords(ans, DAYS.filter((d) => d !== ans));
  return { ...r, prompt: `What day comes before ${DAYS[i]}?` };
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const gMonthAfter: Gen = () => {
  const i = rand(12);
  const ans = MONTHS[(i + 1) % 12];
  const r = fromWords(ans, MONTHS.filter((m) => m !== ans));
  return { ...r, prompt: `What month comes after ${MONTHS[i]}?` };
};

const SEASON: [string, string][] = [
  ["Snow", "Winter"], ["Flowers bloom", "Spring"], ["Hot beach", "Summer"], ["Leaves fall", "Autumn"],
];
const gSeasons: Gen = () => {
  const [clue, ans] = pick(SEASON);
  const r = fromWords(ans, ["Winter", "Spring", "Summer", "Autumn"].filter((s) => s !== ans));
  return { ...r, prompt: `Which season: ${clue}?` };
};

const gTimeOfDay: Gen = () => {
  const list: [string, string][] = [
    ["Sun rises", "Morning"], ["Sun is high up", "Noon"], ["Sun sets", "Evening"], ["Moon and stars", "Night"],
  ];
  const [clue, ans] = pick(list);
  const r = fromWords(ans, ["Morning", "Noon", "Evening", "Night"].filter((x) => x !== ans));
  return { ...r, prompt: `When? ${clue}` };
};

const gMoney: Gen = (l) => {
  const coins = [
    { v: 1, n: "1¢" }, { v: 5, n: "5¢" }, { v: 10, n: "10¢" }, { v: 25, n: "25¢" },
  ];
  const count = Math.min(2 + Math.floor(l / 2), 5);
  let total = 0;
  const used: string[] = [];
  for (let i = 0; i < count; i++) {
    const c = pick(coins);
    total += c.v;
    used.push(c.n);
  }
  const ans = `${total}¢`;
  const opts = new Set<string>([ans]);
  while (opts.size < 4) opts.add(`${total + (rand(11) - 5)}¢`);
  const arr = shuffle([...opts]);
  return { prompt: `Add the coins: ${used.join(" + ")}`, options: arr, answerIndex: arr.indexOf(ans) };
};

const gClockHour: Gen = () => {
  const h = rand(12) + 1;
  const ans = `${h}:00`;
  const opts = shuffle([ans, `${(h % 12) + 1}:00`, `${((h + 1) % 12) + 1}:00`, `${(h + 6) % 12 || 12}:00`]);
  return { prompt: `The hour hand points to ${h}. What time is it?`, options: opts, answerIndex: opts.indexOf(ans) };
};

const gMissingLetter: Gen = () => {
  const words = ["apple", "table", "house", "happy", "smile", "sunny", "river", "music"];
  const w = pick(words);
  const i = rand(w.length);
  const masked = w.split("").map((c, idx) => (idx === i ? "_" : c)).join(" ");
  const ans = w[i].toUpperCase();
  const opts = new Set<string>([ans]);
  while (opts.size < 4) opts.add(String.fromCharCode(65 + rand(26)));
  const arr = shuffle([...opts]);
  return { prompt: `Fill the blank:`, subPrompt: masked, options: arr, answerIndex: arr.indexOf(ans) };
};

const gOpposite2: Gen = () => {
  const pairs: [string, string][] = [
    ["start", "stop"], ["push", "pull"], ["above", "below"], ["inside", "outside"],
    ["front", "back"], ["left", "right"], ["give", "take"], ["buy", "sell"],
  ];
  const [a, b] = pick(pairs);
  const pool = pairs.flatMap(([x, y]) => [x, y]).filter((w) => w !== a && w !== b);
  const r = fromWords(b, pool);
  return { ...r, prompt: `Opposite of "${a}"?` };
};

const gOddEmoji: Gen = (l) => {
  const groups: [string[], string][] = [
    [["🍎", "🍊", "🍌", "🍇"], "🐶"],
    [["🐶", "🐱", "🐭", "🐰"], "🚗"],
    [["🚗", "🚙", "🚕", "🚌"], "🌳"],
    [["⚽", "🏀", "🎾", "🏐"], "🍕"],
    [["🌞", "⭐", "🌙", "☁️"], "🐠"],
  ];
  const [g, odd] = pick(groups);
  const arr = shuffle([...g, odd]);
  return {
    prompt: "Which one doesn't belong?",
    options: arr,
    answerIndex: arr.indexOf(odd),
  };
};

const gBigCity: Gen = () => {
  const list: [string, string, string[]][] = [
    ["France", "Paris", ["London", "Rome", "Berlin"]],
    ["Japan", "Tokyo", ["Beijing", "Seoul", "Bangkok"]],
    ["UK", "London", ["Paris", "Madrid", "Dublin"]],
    ["Italy", "Rome", ["Athens", "Madrid", "Lisbon"]],
    ["USA", "Washington", ["New York", "Boston", "Chicago"]],
    ["Egypt", "Cairo", ["Lagos", "Nairobi", "Algiers"]],
  ];
  const [c, cap, d] = pick(list);
  const r = fromWords(cap, d);
  return { ...r, prompt: `What is the capital of ${c}?` };
};

const gContinent: Gen = () => {
  const list: [string, string, string[]][] = [
    ["Egypt", "Africa", ["Asia", "Europe", "Oceania"]],
    ["Brazil", "South America", ["Africa", "Asia", "Europe"]],
    ["China", "Asia", ["Africa", "Europe", "Australia"]],
    ["France", "Europe", ["Asia", "Africa", "Oceania"]],
    ["Canada", "North America", ["Europe", "Asia", "Africa"]],
  ];
  const [c, cont, d] = pick(list);
  const r = fromWords(cont, d);
  return { ...r, prompt: `Which continent is ${c} in?` };
};

const gPlanets: Gen = () => {
  const list: [string, string, string[]][] = [
    ["Red planet", "Mars", ["Venus", "Jupiter", "Saturn"]],
    ["Biggest planet", "Jupiter", ["Earth", "Mars", "Mercury"]],
    ["Has rings", "Saturn", ["Mercury", "Venus", "Mars"]],
    ["We live here", "Earth", ["Mars", "Venus", "Pluto"]],
    ["Closest to sun", "Mercury", ["Venus", "Earth", "Mars"]],
  ];
  const [clue, ans, d] = pick(list);
  const r = fromWords(ans, d);
  return { ...r, prompt: `Planet quiz: ${clue}` };
};

const gBodyPart: Gen = () => {
  const list: [string, string, string[]][] = [
    ["see with", "Eyes", ["Ears", "Nose", "Mouth"]],
    ["hear with", "Ears", ["Eyes", "Nose", "Hands"]],
    ["smell with", "Nose", ["Eyes", "Ears", "Feet"]],
    ["taste with", "Tongue", ["Nose", "Ears", "Hands"]],
    ["walk with", "Feet", ["Hands", "Eyes", "Mouth"]],
    ["grab with", "Hands", ["Feet", "Eyes", "Nose"]],
  ];
  const [verb, ans, d] = pick(list);
  const r = fromWords(ans, d);
  return { ...r, prompt: `What do we ${verb}?` };
};

const gWeather: Gen = () => {
  const list: [string, string, string[]][] = [
    ["frozen water from sky", "Snow", ["Rain", "Wind", "Sun"]],
    ["water falling", "Rain", ["Snow", "Fog", "Hail"]],
    ["moving air", "Wind", ["Rain", "Sun", "Snow"]],
    ["dark thick cloud at ground", "Fog", ["Snow", "Wind", "Sun"]],
  ];
  const [clue, ans, d] = pick(list);
  const r = fromWords(ans, d);
  return { ...r, prompt: `What weather: ${clue}?` };
};

const gToolUse: Gen = () => {
  const list: [string, string, string[]][] = [
    ["Cut paper", "Scissors", ["Hammer", "Spoon", "Brush"]],
    ["Write", "Pencil", ["Fork", "Cup", "Pan"]],
    ["Eat soup", "Spoon", ["Knife", "Pen", "Brush"]],
    ["Brush teeth", "Toothbrush", ["Spoon", "Fork", "Pencil"]],
    ["Sweep floor", "Broom", ["Cup", "Pen", "Knife"]],
  ];
  const [task, ans, d] = pick(list);
  const r = fromWords(ans, d);
  return { ...r, prompt: `Which tool? Task: ${task}` };
};

const gFraction: Gen = (l) => {
  const denom = Math.min(2 + Math.floor(l / 2), 8);
  const num = rand(denom) + 1;
  const total = denom * 4;
  const ans = (num * total) / denom;
  const opts = buildNumeric(ans, 4);
  return { prompt: `${num}/${denom} of ${total} = ?`, options: opts, answerIndex: opts.indexOf(String(ans)) };
};

const gRoman: Gen = (l) => {
  const map: [string, number][] = [["I", 1], ["II", 2], ["III", 3], ["IV", 4], ["V", 5], ["VI", 6], ["VII", 7], ["VIII", 8], ["IX", 9], ["X", 10]];
  const limit = Math.min(3 + l, map.length);
  const [r, n] = map[rand(limit)];
  const opts = buildNumeric(n, 3);
  return { prompt: `Roman numeral ${r} = ?`, options: opts, answerIndex: opts.indexOf(String(n)) };
};

const gMaxOfFour: Gen = (l) => {
  const max = 10 + l * 4;
  const nums = Array.from({ length: 4 }, () => rand(max) + 1);
  const ans = String(Math.max(...nums));
  const opts = shuffle(nums.map(String));
  return { prompt: "Which is the biggest?", options: opts, answerIndex: opts.indexOf(ans) };
};

const gSumOfThree: Gen = (l) => {
  const max = Math.min(5 + l, 20);
  const a = rand(max) + 1, b = rand(max) + 1, c = rand(max) + 1;
  const ans = a + b + c;
  const opts = buildNumeric(ans, l + 3);
  return { prompt: `${a} + ${b} + ${c} = ?`, options: opts, answerIndex: opts.indexOf(String(ans)) };
};

const gWordProblem: Gen = (l) => {
  const a = rand(3 + l) + 2;
  const b = rand(3 + l) + 1;
  const ans = a + b;
  const opts = buildNumeric(ans, l + 2);
  return {
    prompt: `Anna has ${a} apples. Ben gives her ${b} more. How many now?`,
    options: opts, answerIndex: opts.indexOf(String(ans)),
  };
};

const gWordProblem2: Gen = (l) => {
  const a = rand(5 + l) + 3;
  const b = rand(a - 1) + 1;
  const ans = a - b;
  const opts = buildNumeric(ans, l + 2);
  return {
    prompt: `There are ${a} birds. ${b} fly away. How many are left?`,
    options: opts, answerIndex: opts.indexOf(String(ans)),
  };
};

/* ---- Registry ---- */

export interface QuizDef {
  key: string;
  label: string;
  emoji: string;
  gen: Gen;
}

export const QUIZ_GAMES: QuizDef[] = [
  { key: "math_add", label: "Addition", emoji: "➕", gen: gAddition },
  { key: "math_sub", label: "Subtraction", emoji: "➖", gen: gSubtraction },
  { key: "math_mul", label: "Multiplication", emoji: "✖️", gen: gMultiplication },
  { key: "math_div", label: "Division", emoji: "➗", gen: gDivision },
  { key: "doubles", label: "Doubles", emoji: "👯", gen: gDoubles },
  { key: "halves", label: "Halves", emoji: "½", gen: gHalves },
  { key: "bigger", label: "Bigger Number", emoji: "🔼", gen: gGreaterLess },
  { key: "smallest", label: "Smallest Number", emoji: "🔽", gen: gSmallest },
  { key: "order", label: "Number Order", emoji: "🔢", gen: gNumberOrder },
  { key: "even_odd", label: "Even or Odd", emoji: "⚖️", gen: gEvenOdd },
  { key: "missing_num", label: "Missing Number", emoji: "❓", gen: gMissingNumber },
  { key: "sum3", label: "Add Three", emoji: "🧮", gen: gSumOfThree },
  { key: "max4", label: "Biggest of Four", emoji: "🏔️", gen: gMaxOfFour },
  { key: "fraction", label: "Fractions", emoji: "🍰", gen: gFraction },
  { key: "roman", label: "Roman Numerals", emoji: "🏛️", gen: gRoman },
  { key: "money", label: "Money Math", emoji: "🪙", gen: gMoney },
  { key: "clock", label: "Tell the Time", emoji: "🕒", gen: gClockHour },
  { key: "word_add", label: "Word Problem +", emoji: "📖", gen: gWordProblem },
  { key: "word_sub", label: "Word Problem -", emoji: "📕", gen: gWordProblem2 },
  { key: "opposites", label: "Opposites", emoji: "↔️", gen: gOpposites },
  { key: "opposites2", label: "More Opposites", emoji: "🔄", gen: gOpposite2 },
  { key: "rhymes", label: "Rhymes", emoji: "🎵", gen: gRhymes },
  { key: "synonyms", label: "Same Meaning", emoji: "🟰", gen: gSynonyms },
  { key: "first_letter", label: "First Letter", emoji: "🔤", gen: gFirstLetter },
  { key: "last_letter", label: "Last Letter", emoji: "🔡", gen: gLastLetter },
  { key: "word_length", label: "Word Length", emoji: "📏", gen: gWordLength },
  { key: "missing_letter", label: "Missing Letter", emoji: "✍️", gen: gMissingLetter },
  { key: "animal_sound", label: "Animal Sounds", emoji: "🐄", gen: gAnimalSound },
  { key: "animal_baby", label: "Baby Animals", emoji: "🐣", gen: gAnimalBaby },
  { key: "habitat", label: "Animal Homes", emoji: "🏞️", gen: gHabitat },
  { key: "food_group", label: "Food Groups", emoji: "🥗", gen: gFoodGroup },
  { key: "color_of", label: "What Color?", emoji: "🌈", gen: gColorOf },
  { key: "shape_name", label: "Name the Shape", emoji: "🔺", gen: gShapeName },
  { key: "shape_sides", label: "Shape Sides", emoji: "📐", gen: gShapeSides },
  { key: "day_after", label: "Day After", emoji: "📅", gen: gDayAfter },
  { key: "day_before", label: "Day Before", emoji: "🗓️", gen: gDayBefore },
  { key: "month_after", label: "Month After", emoji: "📆", gen: gMonthAfter },
  { key: "seasons", label: "Seasons", emoji: "🍂", gen: gSeasons },
  { key: "time_of_day", label: "Time of Day", emoji: "🌅", gen: gTimeOfDay },
  { key: "capitals", label: "Capital Cities", emoji: "🗺️", gen: gBigCity },
  { key: "continents", label: "Continents", emoji: "🌍", gen: gContinent },
  { key: "planets", label: "Planets", emoji: "🪐", gen: gPlanets },
  { key: "body_parts", label: "Body Parts", emoji: "👀", gen: gBodyPart },
  { key: "weather", label: "Weather", emoji: "🌦️", gen: gWeather },
  { key: "tools", label: "Which Tool?", emoji: "🔧", gen: gToolUse },
  { key: "odd_emoji", label: "Doesn't Belong", emoji: "🚫", gen: gOddEmoji },
];

export const makeQuizComponent = (gen: Gen): React.FC => {
  const Comp = () => <QuizGame generate={gen} />;
  return Comp;
};