(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  const VIEW = { w: 1280, h: 720 };
  const FIELD = {
    x: 82,
    y: 92,
    w: 1116,
    h: 532,
    goalDepth: 28,
    goalW: 150,
  };
  FIELD.cx = FIELD.x + FIELD.w / 2;
  FIELD.cy = FIELD.y + FIELD.h / 2;
  FIELD.goalTop = FIELD.cy - FIELD.goalW / 2;
  FIELD.goalBottom = FIELD.cy + FIELD.goalW / 2;

  const QUICK_MATCH_LENGTH = 75;
  const STANDARD_MATCH_LENGTH = 120;
  const ROLE_ORDER = ["GK", "DF", "MID", "WING", "ST"];
  const FIELD_DESIGNS = [
    { id: "classic", name: "Classic Grass" },
    { id: "team", name: "Team Colors" },
    { id: "glow", name: "Creator Glow" },
  ];
  const PENALTY_DIRECTIONS = ["left", "center", "right"];
  const TROPHY_STORAGE_KEY = "jplp-soccer-trophy-room";
  const PROGRESS_STORAGE_KEY = "jplp-soccer-progress-save";
  const PROGRESS_SAVE_VERSION = 1;
  const COUNTRY_CODES = {
    England: "ENG",
    France: "FRA",
    Germany: "GER",
    Italy: "ITA",
    Netherlands: "NED",
    Portugal: "POR",
    Spain: "ESP",
  };
  const FORMATION = {
    GK: { x: 0.045, y: 0.5 },
    DF: { x: 0.22, y: 0.5 },
    MID: { x: 0.4, y: 0.33 },
    WING: { x: 0.43, y: 0.68 },
    ST: { x: 0.62, y: 0.5 },
  };

  const TEAMS = [
    {
      name: "Real Madrid",
      short: "RMA",
      country: "Spain",
      colors: ["#ffffff", "#6247aa", "#f2bf49"],
      tactic: "Explosive counters",
      players: [
        { name: "Thibaut Courtois", role: "GK", number: 1, rating: 90, trait: "Reach" },
        { name: "Federico Valverde", role: "DF", number: 8, rating: 88, trait: "Engine" },
        { name: "Jude Bellingham", role: "MID", number: 5, rating: 94, trait: "Late runs" },
        { name: "Vinicius Junior", role: "WING", number: 7, rating: 96, trait: "Dribble" },
        { name: "Kylian Mbappe", role: "ST", number: 10, rating: 99, trait: "Burst" },
      ],
      bench: [
        { name: "Antonio Rudiger", role: "DF", number: 22, rating: 89, trait: "Duels" },
        { name: "Aurelien Tchouameni", role: "MID", number: 14, rating: 88, trait: "Anchor" },
        { name: "Rodrygo", role: "WING", number: 11, rating: 90, trait: "Sharp feet" },
      ],
    },
    {
      name: "Manchester City",
      short: "MCI",
      country: "England",
      colors: ["#6cabdd", "#132257", "#f5f7fb"],
      tactic: "Control press",
      players: [
        { name: "Ederson", role: "GK", number: 31, rating: 88, trait: "Passing" },
        { name: "Ruben Dias", role: "DF", number: 3, rating: 89, trait: "Blocks" },
        { name: "Rodri", role: "MID", number: 16, rating: 96, trait: "Balance" },
        { name: "Phil Foden", role: "WING", number: 47, rating: 91, trait: "Agility" },
        { name: "Erling Haaland", role: "ST", number: 9, rating: 98, trait: "Finisher" },
      ],
      bench: [
        { name: "Josko Gvardiol", role: "DF", number: 24, rating: 88, trait: "Carry" },
        { name: "Bernardo Silva", role: "MID", number: 20, rating: 90, trait: "Press proof" },
        { name: "Jeremy Doku", role: "WING", number: 11, rating: 87, trait: "Burst" },
      ],
    },
    {
      name: "Paris Saint-Germain",
      short: "PSG",
      country: "France",
      colors: ["#1b2f6b", "#d1142f", "#ffffff"],
      tactic: "Fast rotations",
      players: [
        { name: "Gianluigi Donnarumma", role: "GK", number: 1, rating: 89, trait: "Shot stop" },
        { name: "Nuno Mendes", role: "DF", number: 25, rating: 87, trait: "Overlap" },
        { name: "Vitinha", role: "MID", number: 17, rating: 93, trait: "Tempo" },
        { name: "Khvicha Kvaratskhelia", role: "WING", number: 7, rating: 94, trait: "Cut in" },
        { name: "Ousmane Dembele", role: "ST", number: 10, rating: 97, trait: "Chaos" },
      ],
      bench: [
        { name: "Marquinhos", role: "DF", number: 5, rating: 88, trait: "Command" },
        { name: "Joao Neves", role: "MID", number: 87, rating: 88, trait: "Snap press" },
        { name: "Bradley Barcola", role: "WING", number: 29, rating: 89, trait: "Glide" },
      ],
    },
    {
      name: "Bayern Munich",
      short: "BAY",
      country: "Germany",
      colors: ["#dc052d", "#ffffff", "#0066b2"],
      tactic: "Direct power",
      players: [
        { name: "Manuel Neuer", role: "GK", number: 1, rating: 86, trait: "Sweeper" },
        { name: "Joshua Kimmich", role: "DF", number: 6, rating: 88, trait: "Switches" },
        { name: "Jamal Musiala", role: "MID", number: 42, rating: 93, trait: "Glide" },
        { name: "Michael Olise", role: "WING", number: 17, rating: 90, trait: "Whip" },
        { name: "Harry Kane", role: "ST", number: 9, rating: 97, trait: "Clinical" },
      ],
      bench: [
        { name: "Dayot Upamecano", role: "DF", number: 2, rating: 86, trait: "Recovery" },
        { name: "Aleksandar Pavlovic", role: "MID", number: 45, rating: 84, trait: "Composure" },
        { name: "Leroy Sane", role: "WING", number: 10, rating: 88, trait: "Left foot" },
      ],
    },
    {
      name: "Barcelona",
      short: "BAR",
      country: "Spain",
      colors: ["#004d98", "#a50044", "#edbb00"],
      tactic: "Wide flair",
      players: [
        { name: "Marc-Andre ter Stegen", role: "GK", number: 1, rating: 88, trait: "Reflex" },
        { name: "Ronald Araujo", role: "DF", number: 4, rating: 86, trait: "Strength" },
        { name: "Pedri", role: "MID", number: 8, rating: 93, trait: "Vision" },
        { name: "Raphinha", role: "WING", number: 11, rating: 92, trait: "Curl" },
        { name: "Lamine Yamal", role: "ST", number: 19, rating: 96, trait: "Wonderkid" },
      ],
      bench: [
        { name: "Pau Cubarsi", role: "DF", number: 2, rating: 85, trait: "Anticipate" },
        { name: "Frenkie de Jong", role: "MID", number: 21, rating: 89, trait: "Carry" },
        { name: "Fermin Lopez", role: "WING", number: 16, rating: 86, trait: "Late runs" },
      ],
    },
    {
      name: "Liverpool",
      short: "LIV",
      country: "England",
      colors: ["#c8102e", "#00b2a9", "#ffffff"],
      tactic: "Relentless runs",
      players: [
        { name: "Alisson", role: "GK", number: 1, rating: 91, trait: "One-v-one" },
        { name: "Virgil van Dijk", role: "DF", number: 4, rating: 93, trait: "Command" },
        { name: "Dominik Szoboszlai", role: "MID", number: 8, rating: 86, trait: "Strike" },
        { name: "Florian Wirtz", role: "WING", number: 7, rating: 90, trait: "Inventive" },
        { name: "Mohamed Salah", role: "ST", number: 11, rating: 96, trait: "Angle" },
      ],
      bench: [
        { name: "Ibrahima Konate", role: "DF", number: 5, rating: 87, trait: "Power" },
        { name: "Alexis Mac Allister", role: "MID", number: 10, rating: 88, trait: "Pass map" },
        { name: "Cody Gakpo", role: "WING", number: 18, rating: 86, trait: "Cut inside" },
      ],
    },
    {
      name: "Inter Milan",
      short: "INT",
      country: "Italy",
      colors: ["#0057b8", "#000000", "#f5f7fb"],
      tactic: "Compact break",
      players: [
        { name: "Yann Sommer", role: "GK", number: 1, rating: 85, trait: "Calm" },
        { name: "Alessandro Bastoni", role: "DF", number: 95, rating: 90, trait: "Step out" },
        { name: "Nicolo Barella", role: "MID", number: 23, rating: 91, trait: "Buzz" },
        { name: "Denzel Dumfries", role: "WING", number: 2, rating: 87, trait: "Surge" },
        { name: "Lautaro Martinez", role: "ST", number: 10, rating: 94, trait: "Snap shot" },
      ],
      bench: [
        { name: "Benjamin Pavard", role: "DF", number: 28, rating: 86, trait: "Timing" },
        { name: "Hakan Calhanoglu", role: "MID", number: 20, rating: 90, trait: "Range" },
        { name: "Marcus Thuram", role: "ST", number: 9, rating: 89, trait: "Run channel" },
      ],
    },
    {
      name: "Arsenal",
      short: "ARS",
      country: "England",
      colors: ["#ef0107", "#ffffff", "#063672"],
      tactic: "Young pressure",
      players: [
        { name: "David Raya", role: "GK", number: 22, rating: 86, trait: "Claim" },
        { name: "William Saliba", role: "DF", number: 2, rating: 90, trait: "Recovery" },
        { name: "Declan Rice", role: "MID", number: 41, rating: 92, trait: "Drive" },
        { name: "Martin Odegaard", role: "WING", number: 8, rating: 91, trait: "Thread" },
        { name: "Bukayo Saka", role: "ST", number: 7, rating: 95, trait: "Composure" },
      ],
      bench: [
        { name: "Gabriel Magalhaes", role: "DF", number: 6, rating: 88, trait: "Aerial" },
        { name: "Martin Zubimendi", role: "MID", number: 36, rating: 87, trait: "Control" },
        { name: "Gabriel Martinelli", role: "WING", number: 11, rating: 88, trait: "Sprint" },
      ],
    },
    {
      name: "Chelsea",
      short: "CHE",
      country: "England",
      colors: ["#034694", "#ffffff", "#dba111"],
      tactic: "Young creation",
      players: [
        { name: "Robert Sanchez", role: "GK", number: 1, rating: 83, trait: "Reach" },
        { name: "Reece James", role: "DF", number: 24, rating: 87, trait: "Drive" },
        { name: "Enzo Fernandez", role: "MID", number: 8, rating: 88, trait: "Switches" },
        { name: "Cole Palmer", role: "WING", number: 20, rating: 94, trait: "Ice" },
        { name: "Nicolas Jackson", role: "ST", number: 15, rating: 86, trait: "Runs" },
      ],
      bench: [
        { name: "Moises Caicedo", role: "MID", number: 25, rating: 89, trait: "Ball wins" },
        { name: "Levi Colwill", role: "DF", number: 6, rating: 84, trait: "Balance" },
        { name: "Pedro Neto", role: "WING", number: 7, rating: 85, trait: "Acceleration" },
      ],
    },
    {
      name: "Newcastle United",
      short: "NEW",
      country: "England",
      colors: ["#111111", "#ffffff", "#41b6e6"],
      tactic: "High-energy breaks",
      players: [
        { name: "Nick Pope", role: "GK", number: 22, rating: 84, trait: "Command" },
        { name: "Sven Botman", role: "DF", number: 4, rating: 86, trait: "Wall" },
        { name: "Bruno Guimaraes", role: "MID", number: 39, rating: 90, trait: "Tempo" },
        { name: "Anthony Gordon", role: "WING", number: 10, rating: 88, trait: "Direct" },
        { name: "Alexander Isak", role: "ST", number: 14, rating: 93, trait: "Silky" },
      ],
      bench: [
        { name: "Kieran Trippier", role: "DF", number: 2, rating: 85, trait: "Delivery" },
        { name: "Sandro Tonali", role: "MID", number: 8, rating: 87, trait: "Engine" },
        { name: "Harvey Barnes", role: "WING", number: 11, rating: 84, trait: "Finish" },
      ],
    },
    {
      name: "AC Milan",
      short: "MIL",
      country: "Italy",
      colors: ["#fb090b", "#000000", "#ffffff"],
      tactic: "Wide surges",
      players: [
        { name: "Mike Maignan", role: "GK", number: 16, rating: 89, trait: "Reflex" },
        { name: "Theo Hernandez", role: "DF", number: 19, rating: 90, trait: "Overlap" },
        { name: "Yunus Musah", role: "MID", number: 80, rating: 82, trait: "Carry" },
        { name: "Christian Pulisic", role: "WING", number: 11, rating: 88, trait: "Burst" },
        { name: "Rafael Leao", role: "ST", number: 10, rating: 92, trait: "Glide" },
      ],
      bench: [
        { name: "Fikayo Tomori", role: "DF", number: 23, rating: 84, trait: "Recovery" },
        { name: "Tijjani Reijnders", role: "MID", number: 14, rating: 86, trait: "Arrivals" },
        { name: "Samuel Chukwueze", role: "WING", number: 21, rating: 83, trait: "Left foot" },
      ],
    },
    {
      name: "Juventus",
      short: "JUV",
      country: "Italy",
      colors: ["#ffffff", "#000000", "#f5c75f"],
      tactic: "Compact control",
      players: [
        { name: "Michele Di Gregorio", role: "GK", number: 29, rating: 84, trait: "Reactive" },
        { name: "Gleison Bremer", role: "DF", number: 3, rating: 88, trait: "Stopper" },
        { name: "Teun Koopmeiners", role: "MID", number: 8, rating: 87, trait: "Range" },
        { name: "Kenan Yildiz", role: "WING", number: 10, rating: 86, trait: "Spark" },
        { name: "Dusan Vlahovic", role: "ST", number: 9, rating: 89, trait: "Power" },
      ],
      bench: [
        { name: "Andrea Cambiaso", role: "DF", number: 27, rating: 84, trait: "Invert" },
        { name: "Manuel Locatelli", role: "MID", number: 5, rating: 84, trait: "Anchor" },
        { name: "Timothy Weah", role: "WING", number: 22, rating: 81, trait: "Pace" },
      ],
    },
    {
      name: "Borussia Dortmund",
      short: "BVB",
      country: "Germany",
      colors: ["#fde100", "#000000", "#ffffff"],
      tactic: "Vertical rush",
      players: [
        { name: "Gregor Kobel", role: "GK", number: 1, rating: 88, trait: "Big saves" },
        { name: "Nico Schlotterbeck", role: "DF", number: 4, rating: 86, trait: "Step out" },
        { name: "Julian Brandt", role: "MID", number: 10, rating: 86, trait: "Inventive" },
        { name: "Karim Adeyemi", role: "WING", number: 27, rating: 86, trait: "Pace" },
        { name: "Serhou Guirassy", role: "ST", number: 9, rating: 87, trait: "Box" },
      ],
      bench: [
        { name: "Waldemar Anton", role: "DF", number: 3, rating: 83, trait: "Cover" },
        { name: "Felix Nmecha", role: "MID", number: 8, rating: 82, trait: "Stride" },
        { name: "Jamie Gittens", role: "WING", number: 43, rating: 84, trait: "Tricks" },
      ],
    },
    {
      name: "Atletico Madrid",
      short: "ATM",
      country: "Spain",
      colors: ["#c8102e", "#ffffff", "#272e61"],
      tactic: "Ruthless transitions",
      players: [
        { name: "Jan Oblak", role: "GK", number: 13, rating: 89, trait: "Calm" },
        { name: "Jose Gimenez", role: "DF", number: 2, rating: 85, trait: "Fight" },
        { name: "Rodrigo De Paul", role: "MID", number: 5, rating: 86, trait: "Edge" },
        { name: "Antoine Griezmann", role: "WING", number: 7, rating: 90, trait: "Craft" },
        { name: "Julian Alvarez", role: "ST", number: 19, rating: 91, trait: "Press" },
      ],
      bench: [
        { name: "Robin Le Normand", role: "DF", number: 24, rating: 85, trait: "Aerial" },
        { name: "Koke", role: "MID", number: 6, rating: 84, trait: "Leader" },
        { name: "Alexander Sorloth", role: "ST", number: 9, rating: 84, trait: "Target" },
      ],
    },
    {
      name: "Bayer Leverkusen",
      short: "LEV",
      country: "Germany",
      colors: ["#e32221", "#000000", "#f5c75f"],
      tactic: "Wingback overloads",
      players: [
        { name: "Lukas Hradecky", role: "GK", number: 1, rating: 83, trait: "Stable" },
        { name: "Jonathan Tah", role: "DF", number: 4, rating: 87, trait: "Power" },
        { name: "Granit Xhaka", role: "MID", number: 34, rating: 88, trait: "Control" },
        { name: "Alex Grimaldo", role: "WING", number: 20, rating: 88, trait: "Whip" },
        { name: "Patrik Schick", role: "ST", number: 14, rating: 86, trait: "Finish" },
      ],
      bench: [
        { name: "Edmond Tapsoba", role: "DF", number: 12, rating: 85, trait: "Reach" },
        { name: "Exequiel Palacios", role: "MID", number: 25, rating: 85, trait: "Snap" },
        { name: "Jeremie Frimpong", role: "WING", number: 30, rating: 87, trait: "Rocket" },
      ],
    },
    {
      name: "Benfica",
      short: "BEN",
      country: "Portugal",
      colors: ["#e83030", "#ffffff", "#f2c94c"],
      tactic: "Technical waves",
      players: [
        { name: "Anatoliy Trubin", role: "GK", number: 1, rating: 84, trait: "Reach" },
        { name: "Antonio Silva", role: "DF", number: 4, rating: 85, trait: "Composed" },
        { name: "Florentino Luis", role: "MID", number: 61, rating: 84, trait: "Screen" },
        { name: "Kerem Akturkoglu", role: "WING", number: 17, rating: 85, trait: "Burst" },
        { name: "Vangelis Pavlidis", role: "ST", number: 14, rating: 86, trait: "Poacher" },
      ],
      bench: [
        { name: "Nicolas Otamendi", role: "DF", number: 30, rating: 83, trait: "Leader" },
        { name: "Orkun Kokcu", role: "MID", number: 10, rating: 85, trait: "Range" },
        { name: "Andreas Schjelderup", role: "WING", number: 21, rating: 80, trait: "Upside" },
      ],
    },
    {
      name: "Inter Miami",
      short: "MIA",
      country: "MLS",
      colors: ["#f7b5cd", "#111111", "#ffffff"],
      tactic: "Superstar combinations",
      players: [
        { name: "Drake Callender", role: "GK", number: 1, rating: 80, trait: "Reflex" },
        { name: "Jordi Alba", role: "DF", number: 18, rating: 86, trait: "Overlap" },
        { name: "Sergio Busquets", role: "MID", number: 5, rating: 87, trait: "Tempo" },
        { name: "Lionel Messi", role: "WING", number: 10, rating: 96, trait: "Genius" },
        { name: "Luis Suarez", role: "ST", number: 9, rating: 88, trait: "Poacher" },
      ],
      bench: [
        { name: "Tomas Aviles", role: "DF", number: 6, rating: 78, trait: "Recovery" },
        { name: "Benjamin Cremaschi", role: "MID", number: 30, rating: 77, trait: "Engine" },
        { name: "Fafa Picault", role: "WING", number: 7, rating: 79, trait: "Pace" },
      ],
    },
    {
      name: "Los Angeles FC",
      short: "LAFC",
      country: "MLS",
      colors: ["#111111", "#c39e6d", "#ffffff"],
      tactic: "Direct star power",
      players: [
        { name: "Hugo Lloris", role: "GK", number: 1, rating: 84, trait: "Command" },
        { name: "Aaron Long", role: "DF", number: 33, rating: 80, trait: "Duels" },
        { name: "Mark Delgado", role: "MID", number: 8, rating: 78, trait: "Balance" },
        { name: "Denis Bouanga", role: "WING", number: 99, rating: 87, trait: "Burst" },
        { name: "Olivier Giroud", role: "ST", number: 9, rating: 86, trait: "Target" },
      ],
      bench: [
        { name: "Ryan Hollingshead", role: "DF", number: 24, rating: 79, trait: "Overlap" },
        { name: "Timothy Tillman", role: "MID", number: 11, rating: 78, trait: "Runs" },
        { name: "Mateusz Bogusz", role: "WING", number: 19, rating: 81, trait: "Strike" },
      ],
    },
    {
      name: "LA Galaxy",
      short: "LAG",
      country: "MLS",
      colors: ["#00245d", "#ffffff", "#fdb515"],
      tactic: "Wide Hollywood pace",
      players: [
        { name: "John McCarthy", role: "GK", number: 77, rating: 78, trait: "Reach" },
        { name: "Maya Yoshida", role: "DF", number: 4, rating: 81, trait: "Leader" },
        { name: "Riqui Puig", role: "MID", number: 10, rating: 86, trait: "Glide" },
        { name: "Gabriel Pec", role: "WING", number: 11, rating: 83, trait: "Drive" },
        { name: "Joseph Paintsil", role: "ST", number: 28, rating: 82, trait: "Acceleration" },
      ],
      bench: [
        { name: "Miki Yamane", role: "DF", number: 2, rating: 78, trait: "Switches" },
        { name: "Marco Reus", role: "MID", number: 18, rating: 85, trait: "Craft" },
        { name: "Diego Fagundez", role: "WING", number: 7, rating: 77, trait: "Movement" },
      ],
    },
    {
      name: "Seattle Sounders",
      short: "SEA",
      country: "MLS",
      colors: ["#5d9731", "#005595", "#ffffff"],
      tactic: "Balanced pressure",
      players: [
        { name: "Stefan Frei", role: "GK", number: 24, rating: 81, trait: "Big saves" },
        { name: "Jackson Ragen", role: "DF", number: 25, rating: 79, trait: "Aerial" },
        { name: "Cristian Roldan", role: "MID", number: 7, rating: 81, trait: "Engine" },
        { name: "Albert Rusnak", role: "WING", number: 11, rating: 82, trait: "Range" },
        { name: "Jordan Morris", role: "ST", number: 13, rating: 82, trait: "Runs" },
      ],
      bench: [
        { name: "Nouhou Tolo", role: "DF", number: 5, rating: 79, trait: "Power" },
        { name: "Joao Paulo", role: "MID", number: 6, rating: 80, trait: "Tempo" },
        { name: "Pedro de la Vega", role: "WING", number: 10, rating: 80, trait: "Spark" },
      ],
    },
    {
      name: "Atlanta United",
      short: "ATL",
      country: "MLS",
      colors: ["#a6192e", "#000000", "#c1a875"],
      tactic: "Vertical Mercedes press",
      players: [
        { name: "Brad Guzan", role: "GK", number: 1, rating: 77, trait: "Command" },
        { name: "Stian Gregersen", role: "DF", number: 5, rating: 79, trait: "Duels" },
        { name: "Bartosz Slisz", role: "MID", number: 6, rating: 79, trait: "Screen" },
        { name: "Aleksey Miranchuk", role: "WING", number: 59, rating: 83, trait: "Thread" },
        { name: "Miguel Almiron", role: "ST", number: 10, rating: 84, trait: "Burst" },
      ],
      bench: [
        { name: "Brooks Lennon", role: "DF", number: 11, rating: 78, trait: "Crossing" },
        { name: "Tristan Muyumba", role: "MID", number: 8, rating: 77, trait: "Pressure" },
        { name: "Saba Lobjanidze", role: "WING", number: 9, rating: 78, trait: "Direct" },
      ],
    },
    {
      name: "Columbus Crew",
      short: "CLB",
      country: "MLS",
      colors: ["#fedd00", "#000000", "#ffffff"],
      tactic: "Possession waves",
      players: [
        { name: "Patrick Schulte", role: "GK", number: 28, rating: 79, trait: "Reactive" },
        { name: "Steven Moreira", role: "DF", number: 31, rating: 80, trait: "Carry" },
        { name: "Darlington Nagbe", role: "MID", number: 6, rating: 82, trait: "Calm" },
        { name: "Diego Rossi", role: "WING", number: 10, rating: 83, trait: "Angle" },
        { name: "Christian Ramirez", role: "ST", number: 17, rating: 79, trait: "Box" },
      ],
      bench: [
        { name: "Rudy Camacho", role: "DF", number: 4, rating: 79, trait: "Command" },
        { name: "Sean Zawadzki", role: "MID", number: 25, rating: 77, trait: "Utility" },
        { name: "Max Arfsten", role: "WING", number: 27, rating: 77, trait: "Overlap" },
      ],
    },
    {
      name: "New York City FC",
      short: "NYC",
      country: "MLS",
      colors: ["#6cace4", "#002f6c", "#fd4f00"],
      tactic: "City-style triangles",
      players: [
        { name: "Matt Freese", role: "GK", number: 49, rating: 78, trait: "Reach" },
        { name: "Thiago Martins", role: "DF", number: 13, rating: 80, trait: "Stopper" },
        { name: "James Sands", role: "MID", number: 6, rating: 78, trait: "Anchor" },
        { name: "Maxi Moralez", role: "WING", number: 27, rating: 82, trait: "Craft" },
        { name: "Santiago Rodriguez", role: "ST", number: 10, rating: 83, trait: "Inventive" },
      ],
      bench: [
        { name: "Tayvon Gray", role: "DF", number: 24, rating: 76, trait: "Recovery" },
        { name: "Keaton Parks", role: "MID", number: 55, rating: 79, trait: "Control" },
        { name: "Hannes Wolf", role: "WING", number: 17, rating: 80, trait: "Press" },
      ],
    },
    {
      name: "FC Cincinnati",
      short: "FCC",
      country: "MLS",
      colors: ["#263b80", "#f47b20", "#ffffff"],
      tactic: "Orange-blue overloads",
      players: [
        { name: "Roman Celentano", role: "GK", number: 18, rating: 79, trait: "Claim" },
        { name: "Matt Miazga", role: "DF", number: 21, rating: 80, trait: "Duels" },
        { name: "Obinna Nwobodo", role: "MID", number: 5, rating: 80, trait: "Ball wins" },
        { name: "Evander", role: "WING", number: 10, rating: 85, trait: "Range" },
        { name: "Kevin Denkey", role: "ST", number: 9, rating: 82, trait: "Finish" },
      ],
      bench: [
        { name: "Miles Robinson", role: "DF", number: 12, rating: 81, trait: "Recovery" },
        { name: "Pavel Bucha", role: "MID", number: 20, rating: 78, trait: "Tempo" },
        { name: "Yuya Kubo", role: "WING", number: 7, rating: 77, trait: "Runs" },
      ],
    },
    {
      name: "Orlando City SC",
      short: "ORL",
      country: "MLS",
      colors: ["#61259e", "#ffffff", "#f5c75f"],
      tactic: "Purple pressure",
      players: [
        { name: "Pedro Gallese", role: "GK", number: 1, rating: 81, trait: "Shot stop" },
        { name: "Robin Jansson", role: "DF", number: 6, rating: 80, trait: "Command" },
        { name: "Cesar Araujo", role: "MID", number: 5, rating: 80, trait: "Ball wins" },
        { name: "Martin Ojeda", role: "WING", number: 10, rating: 82, trait: "Curl" },
        { name: "Luis Muriel", role: "ST", number: 9, rating: 83, trait: "Craft" },
      ],
      bench: [
        { name: "Rafael Santos", role: "DF", number: 3, rating: 77, trait: "Overlap" },
        { name: "Wilder Cartagena", role: "MID", number: 16, rating: 78, trait: "Screen" },
        { name: "Duncan McGuire", role: "ST", number: 13, rating: 79, trait: "Box" },
      ],
    },
    {
      name: "New York Red Bulls",
      short: "RBNY",
      country: "MLS",
      colors: ["#ed1e36", "#ffffff", "#002f6c"],
      tactic: "Energy press",
      players: [
        { name: "Carlos Coronel", role: "GK", number: 31, rating: 80, trait: "Reflex" },
        { name: "Sean Nealis", role: "DF", number: 15, rating: 78, trait: "Duels" },
        { name: "Daniel Edelman", role: "MID", number: 75, rating: 77, trait: "Bite" },
        { name: "Emil Forsberg", role: "WING", number: 10, rating: 84, trait: "Inventive" },
        { name: "Lewis Morgan", role: "ST", number: 9, rating: 82, trait: "Runs" },
      ],
      bench: [
        { name: "Dylan Nealis", role: "DF", number: 12, rating: 77, trait: "Engine" },
        { name: "Peter Stroud", role: "MID", number: 5, rating: 76, trait: "Tempo" },
        { name: "Elias Manoel", role: "ST", number: 11, rating: 77, trait: "Power" },
      ],
    },
    {
      name: "Philadelphia Union",
      short: "PHI",
      country: "MLS",
      colors: ["#071b45", "#b9975b", "#ffffff"],
      tactic: "Diamond counter",
      players: [
        { name: "Andre Blake", role: "GK", number: 18, rating: 83, trait: "Big saves" },
        { name: "Jakob Glesnes", role: "DF", number: 5, rating: 80, trait: "Aerial" },
        { name: "Jack McGlynn", role: "MID", number: 16, rating: 79, trait: "Range" },
        { name: "Quinn Sullivan", role: "WING", number: 33, rating: 78, trait: "Spark" },
        { name: "Tai Baribo", role: "ST", number: 28, rating: 80, trait: "Poacher" },
      ],
      bench: [
        { name: "Kai Wagner", role: "DF", number: 27, rating: 80, trait: "Delivery" },
        { name: "Alejandro Bedoya", role: "MID", number: 11, rating: 77, trait: "Leader" },
        { name: "Mikael Uhre", role: "ST", number: 7, rating: 79, trait: "Channel run" },
      ],
    },
    {
      name: "Portland Timbers",
      short: "POR",
      country: "MLS",
      colors: ["#004812", "#d69a2d", "#ffffff"],
      tactic: "Rose City attack",
      players: [
        { name: "Maxime Crepeau", role: "GK", number: 16, rating: 80, trait: "Reach" },
        { name: "Kamal Miller", role: "DF", number: 4, rating: 79, trait: "Strength" },
        { name: "Diego Chara", role: "MID", number: 21, rating: 80, trait: "Bite" },
        { name: "Santiago Moreno", role: "WING", number: 30, rating: 81, trait: "Acceleration" },
        { name: "Jonathan Rodriguez", role: "ST", number: 14, rating: 82, trait: "Finish" },
      ],
      bench: [
        { name: "Dario Zuparic", role: "DF", number: 13, rating: 78, trait: "Cover" },
        { name: "David Ayala", role: "MID", number: 24, rating: 77, trait: "Snap" },
        { name: "Felipe Mora", role: "ST", number: 9, rating: 79, trait: "Box" },
      ],
    },
    {
      name: "Austin FC",
      short: "ATX",
      country: "MLS",
      colors: ["#00b140", "#111111", "#ffffff"],
      tactic: "Verde overloads",
      players: [
        { name: "Brad Stuver", role: "GK", number: 1, rating: 80, trait: "Reflex" },
        { name: "Julio Cascante", role: "DF", number: 18, rating: 78, trait: "Command" },
        { name: "Dani Pereira", role: "MID", number: 6, rating: 79, trait: "Tempo" },
        { name: "Owen Wolff", role: "WING", number: 33, rating: 77, trait: "Engine" },
        { name: "Brandon Vazquez", role: "ST", number: 9, rating: 82, trait: "Power" },
      ],
      bench: [
        { name: "Guilherme Biro", role: "DF", number: 29, rating: 76, trait: "Overlap" },
        { name: "Osman Bukari", role: "WING", number: 7, rating: 80, trait: "Pace" },
        { name: "Diego Rubio", role: "ST", number: 14, rating: 78, trait: "Craft" },
      ],
    },
    {
      name: "Toronto FC",
      short: "TOR",
      country: "MLS",
      colors: ["#e31937", "#1d1d1d", "#ffffff"],
      tactic: "Italian flair",
      players: [
        { name: "Sean Johnson", role: "GK", number: 1, rating: 80, trait: "Claim" },
        { name: "Richie Laryea", role: "DF", number: 22, rating: 79, trait: "Drive" },
        { name: "Jonathan Osorio", role: "MID", number: 21, rating: 80, trait: "Late runs" },
        { name: "Lorenzo Insigne", role: "WING", number: 24, rating: 84, trait: "Curl" },
        { name: "Federico Bernardeschi", role: "ST", number: 10, rating: 83, trait: "Left foot" },
      ],
      bench: [
        { name: "Raoul Petretta", role: "DF", number: 28, rating: 77, trait: "Balance" },
        { name: "Deybi Flores", role: "MID", number: 20, rating: 77, trait: "Screen" },
        { name: "Prince Owusu", role: "ST", number: 99, rating: 78, trait: "Target" },
      ],
    },
    {
      name: "Nashville SC",
      short: "NSH",
      country: "MLS",
      colors: ["#ece83a", "#1f1646", "#ffffff"],
      tactic: "Music City counters",
      players: [
        { name: "Joe Willis", role: "GK", number: 1, rating: 78, trait: "Stable" },
        { name: "Walker Zimmerman", role: "DF", number: 25, rating: 82, trait: "Aerial" },
        { name: "Sean Davis", role: "MID", number: 54, rating: 78, trait: "Balance" },
        { name: "Hany Mukhtar", role: "WING", number: 10, rating: 85, trait: "Inventive" },
        { name: "Sam Surridge", role: "ST", number: 9, rating: 81, trait: "Finish" },
      ],
      bench: [
        { name: "Daniel Lovitz", role: "DF", number: 2, rating: 78, trait: "Delivery" },
        { name: "Jacob Shaffelburg", role: "WING", number: 14, rating: 79, trait: "Pace" },
        { name: "Tyler Boyd", role: "ST", number: 11, rating: 78, trait: "Direct" },
      ],
    },
    {
      name: "St. Louis CITY SC",
      short: "STL",
      country: "MLS",
      colors: ["#e40046", "#0a214a", "#ffffff"],
      tactic: "Red wave press",
      players: [
        { name: "Roman Burki", role: "GK", number: 1, rating: 83, trait: "Command" },
        { name: "Tim Parker", role: "DF", number: 26, rating: 78, trait: "Duels" },
        { name: "Eduard Lowen", role: "MID", number: 10, rating: 81, trait: "Range" },
        { name: "Marcel Hartel", role: "WING", number: 17, rating: 82, trait: "Thread" },
        { name: "Joao Klauss", role: "ST", number: 9, rating: 80, trait: "Hold-up" },
      ],
      bench: [
        { name: "Tomas Totland", role: "DF", number: 14, rating: 77, trait: "Overlap" },
        { name: "Indiana Vassilev", role: "MID", number: 19, rating: 77, trait: "Energy" },
        { name: "Cedric Teuchert", role: "ST", number: 36, rating: 79, trait: "Movement" },
      ],
    },
  ];

  const CHAMPIONS_LEAGUE_TEAM_COUNT = 16;
  const CHAMPIONS_LEAGUE_INDICES = Array.from({ length: CHAMPIONS_LEAGUE_TEAM_COUNT }, (_, index) => index);
  const MLS_TEAM_INDICES = Array.from(
    { length: TEAMS.length - CHAMPIONS_LEAGUE_TEAM_COUNT },
    (_, index) => CHAMPIONS_LEAGUE_TEAM_COUNT + index
  );

  const WORLD_TEAMS = [
    {
      name: "Argentina",
      short: "ARG",
      country: "World Cup",
      colors: ["#75aadb", "#ffffff", "#f5c75f"],
      tactic: "Championship control",
      players: [
        { name: "Emiliano Martinez", role: "GK", number: 23, rating: 89, trait: "Penalty wall" },
        { name: "Cristian Romero", role: "DF", number: 13, rating: 87, trait: "Bite" },
        { name: "Enzo Fernandez", role: "MID", number: 8, rating: 88, trait: "Switches" },
        { name: "Lionel Messi", role: "WING", number: 10, rating: 96, trait: "Genius" },
        { name: "Lautaro Martinez", role: "ST", number: 22, rating: 93, trait: "Snap shot" },
      ],
    },
    {
      name: "France",
      short: "FRA",
      country: "World Cup",
      colors: ["#1d3c8c", "#ffffff", "#ef3340"],
      tactic: "Explosive pace",
      players: [
        { name: "Mike Maignan", role: "GK", number: 16, rating: 89, trait: "Reflex" },
        { name: "William Saliba", role: "DF", number: 17, rating: 90, trait: "Recovery" },
        { name: "Aurelien Tchouameni", role: "MID", number: 8, rating: 89, trait: "Anchor" },
        { name: "Kylian Mbappe", role: "WING", number: 10, rating: 99, trait: "Burst" },
        { name: "Antoine Griezmann", role: "ST", number: 7, rating: 90, trait: "Craft" },
      ],
    },
    {
      name: "Spain",
      short: "ESP",
      country: "World Cup",
      colors: ["#c60b1e", "#ffc400", "#ffffff"],
      tactic: "Technical waves",
      players: [
        { name: "Unai Simon", role: "GK", number: 23, rating: 86, trait: "Claim" },
        { name: "Dani Carvajal", role: "DF", number: 2, rating: 87, trait: "Edge" },
        { name: "Pedri", role: "MID", number: 20, rating: 93, trait: "Vision" },
        { name: "Lamine Yamal", role: "WING", number: 19, rating: 96, trait: "Wonderkid" },
        { name: "Nico Williams", role: "ST", number: 17, rating: 89, trait: "Acceleration" },
      ],
    },
    {
      name: "England",
      short: "ENG",
      country: "World Cup",
      colors: ["#ffffff", "#cf142b", "#00247d"],
      tactic: "Direct pressure",
      players: [
        { name: "Jordan Pickford", role: "GK", number: 1, rating: 84, trait: "Big saves" },
        { name: "John Stones", role: "DF", number: 5, rating: 87, trait: "Step out" },
        { name: "Jude Bellingham", role: "MID", number: 10, rating: 94, trait: "Late runs" },
        { name: "Bukayo Saka", role: "WING", number: 7, rating: 95, trait: "Composure" },
        { name: "Harry Kane", role: "ST", number: 9, rating: 97, trait: "Clinical" },
      ],
    },
    {
      name: "Brazil",
      short: "BRA",
      country: "World Cup",
      colors: ["#ffdf00", "#009c3b", "#002776"],
      tactic: "Wide flair",
      players: [
        { name: "Alisson", role: "GK", number: 1, rating: 91, trait: "One-v-one" },
        { name: "Marquinhos", role: "DF", number: 4, rating: 88, trait: "Command" },
        { name: "Bruno Guimaraes", role: "MID", number: 5, rating: 90, trait: "Tempo" },
        { name: "Vinicius Junior", role: "WING", number: 7, rating: 96, trait: "Dribble" },
        { name: "Rodrygo", role: "ST", number: 10, rating: 90, trait: "Sharp feet" },
      ],
    },
    {
      name: "Portugal",
      short: "POR",
      country: "World Cup",
      colors: ["#006600", "#ff0000", "#f5c75f"],
      tactic: "Creative overloads",
      players: [
        { name: "Diogo Costa", role: "GK", number: 22, rating: 86, trait: "Reach" },
        { name: "Ruben Dias", role: "DF", number: 4, rating: 89, trait: "Blocks" },
        { name: "Bruno Fernandes", role: "MID", number: 8, rating: 91, trait: "Range" },
        { name: "Bernardo Silva", role: "WING", number: 10, rating: 90, trait: "Press proof" },
        { name: "Cristiano Ronaldo", role: "ST", number: 7, rating: 88, trait: "Header" },
      ],
    },
    {
      name: "Netherlands",
      short: "NED",
      country: "World Cup",
      colors: ["#ff7f00", "#ffffff", "#21468b"],
      tactic: "Total pressing",
      players: [
        { name: "Bart Verbruggen", role: "GK", number: 1, rating: 83, trait: "Reactive" },
        { name: "Virgil van Dijk", role: "DF", number: 4, rating: 93, trait: "Command" },
        { name: "Frenkie de Jong", role: "MID", number: 21, rating: 89, trait: "Carry" },
        { name: "Xavi Simons", role: "WING", number: 7, rating: 87, trait: "Spark" },
        { name: "Cody Gakpo", role: "ST", number: 11, rating: 86, trait: "Cut inside" },
      ],
    },
    {
      name: "Germany",
      short: "GER",
      country: "World Cup",
      colors: ["#ffffff", "#111111", "#dd0000"],
      tactic: "Central control",
      players: [
        { name: "Manuel Neuer", role: "GK", number: 1, rating: 86, trait: "Sweeper" },
        { name: "Antonio Rudiger", role: "DF", number: 2, rating: 89, trait: "Duels" },
        { name: "Jamal Musiala", role: "MID", number: 10, rating: 93, trait: "Glide" },
        { name: "Florian Wirtz", role: "WING", number: 17, rating: 90, trait: "Inventive" },
        { name: "Kai Havertz", role: "ST", number: 7, rating: 86, trait: "Float" },
      ],
    },
    {
      name: "Italy",
      short: "ITA",
      country: "World Cup",
      colors: ["#0066b3", "#ffffff", "#009246"],
      tactic: "Compact break",
      players: [
        { name: "Gianluigi Donnarumma", role: "GK", number: 1, rating: 89, trait: "Shot stop" },
        { name: "Alessandro Bastoni", role: "DF", number: 23, rating: 90, trait: "Step out" },
        { name: "Nicolo Barella", role: "MID", number: 18, rating: 91, trait: "Buzz" },
        { name: "Federico Chiesa", role: "WING", number: 14, rating: 86, trait: "Surge" },
        { name: "Mateo Retegui", role: "ST", number: 9, rating: 84, trait: "Box" },
      ],
    },
    {
      name: "Belgium",
      short: "BEL",
      country: "World Cup",
      colors: ["#ed2939", "#000000", "#fae042"],
      tactic: "Veteran quality",
      players: [
        { name: "Thibaut Courtois", role: "GK", number: 1, rating: 90, trait: "Reach" },
        { name: "Arthur Theate", role: "DF", number: 3, rating: 83, trait: "Cover" },
        { name: "Kevin De Bruyne", role: "MID", number: 7, rating: 92, trait: "Laser pass" },
        { name: "Jeremy Doku", role: "WING", number: 11, rating: 87, trait: "Burst" },
        { name: "Romelu Lukaku", role: "ST", number: 9, rating: 86, trait: "Power" },
      ],
    },
    {
      name: "Croatia",
      short: "CRO",
      country: "World Cup",
      colors: ["#ffffff", "#d52b1e", "#171796"],
      tactic: "Midfield patience",
      players: [
        { name: "Dominik Livakovic", role: "GK", number: 1, rating: 84, trait: "Reflex" },
        { name: "Josko Gvardiol", role: "DF", number: 20, rating: 88, trait: "Carry" },
        { name: "Luka Modric", role: "MID", number: 10, rating: 90, trait: "Tempo" },
        { name: "Mateo Kovacic", role: "WING", number: 8, rating: 86, trait: "Press proof" },
        { name: "Andrej Kramaric", role: "ST", number: 9, rating: 84, trait: "Craft" },
      ],
    },
    {
      name: "Uruguay",
      short: "URU",
      country: "World Cup",
      colors: ["#7bcdef", "#ffffff", "#f5c75f"],
      tactic: "Aggressive verticals",
      players: [
        { name: "Sergio Rochet", role: "GK", number: 1, rating: 82, trait: "Calm" },
        { name: "Ronald Araujo", role: "DF", number: 4, rating: 86, trait: "Strength" },
        { name: "Federico Valverde", role: "MID", number: 15, rating: 88, trait: "Engine" },
        { name: "Facundo Pellistri", role: "WING", number: 11, rating: 82, trait: "Direct" },
        { name: "Darwin Nunez", role: "ST", number: 9, rating: 86, trait: "Chaos" },
      ],
    },
    {
      name: "Morocco",
      short: "MAR",
      country: "World Cup",
      colors: ["#c1272d", "#006233", "#ffffff"],
      tactic: "Counter punch",
      players: [
        { name: "Yassine Bounou", role: "GK", number: 1, rating: 86, trait: "Shot stop" },
        { name: "Achraf Hakimi", role: "DF", number: 2, rating: 88, trait: "Overlap" },
        { name: "Sofyan Amrabat", role: "MID", number: 4, rating: 84, trait: "Screen" },
        { name: "Brahim Diaz", role: "WING", number: 10, rating: 87, trait: "Glide" },
        { name: "Youssef En-Nesyri", role: "ST", number: 19, rating: 84, trait: "Aerial" },
      ],
    },
    {
      name: "Colombia",
      short: "COL",
      country: "World Cup",
      colors: ["#fcd116", "#003893", "#ce1126"],
      tactic: "Wide pressure",
      players: [
        { name: "Camilo Vargas", role: "GK", number: 12, rating: 82, trait: "Stable" },
        { name: "Daniel Munoz", role: "DF", number: 21, rating: 84, trait: "Drive" },
        { name: "James Rodriguez", role: "MID", number: 10, rating: 86, trait: "Thread" },
        { name: "Luis Diaz", role: "WING", number: 7, rating: 91, trait: "Explode" },
        { name: "Jhon Duran", role: "ST", number: 14, rating: 84, trait: "Power" },
      ],
    },
    {
      name: "United States",
      short: "USA",
      country: "World Cup",
      colors: ["#3c3b6e", "#ffffff", "#b22234"],
      tactic: "Athletic press",
      players: [
        { name: "Matt Turner", role: "GK", number: 1, rating: 80, trait: "Claim" },
        { name: "Antonee Robinson", role: "DF", number: 5, rating: 82, trait: "Sprint" },
        { name: "Weston McKennie", role: "MID", number: 8, rating: 82, trait: "Engine" },
        { name: "Christian Pulisic", role: "WING", number: 10, rating: 88, trait: "Burst" },
        { name: "Folarin Balogun", role: "ST", number: 20, rating: 81, trait: "Runs" },
      ],
    },
    {
      name: "Japan",
      short: "JPN",
      country: "World Cup",
      colors: ["#ffffff", "#bc002d", "#0f8f7e"],
      tactic: "Quick combinations",
      players: [
        { name: "Zion Suzuki", role: "GK", number: 23, rating: 78, trait: "Reactive" },
        { name: "Takehiro Tomiyasu", role: "DF", number: 16, rating: 83, trait: "Balance" },
        { name: "Wataru Endo", role: "MID", number: 6, rating: 82, trait: "Screen" },
        { name: "Kaoru Mitoma", role: "WING", number: 7, rating: 86, trait: "Dribble" },
        { name: "Takefusa Kubo", role: "ST", number: 20, rating: 85, trait: "Sharp feet" },
      ],
    },
  ];

  const WORLD_BRACKET_ORDER = [0, 15, 7, 8, 4, 11, 3, 12, 2, 13, 5, 10, 6, 9, 1, 14];

  const DIFFICULTIES = [
    {
      name: "Easy",
      opponentRank: 6,
      ratingBoost: -7,
      aiSpeed: 0.88,
      aggression: 0.78,
      decision: 0.78,
      shotPower: 0.9,
      passError: 1.35,
      tackleBonus: -0.08,
    },
    {
      name: "Medium",
      opponentRank: 4,
      ratingBoost: 0,
      aiSpeed: 1,
      aggression: 1,
      decision: 1,
      shotPower: 1,
      passError: 1,
      tackleBonus: 0,
    },
    {
      name: "Hard",
      opponentRank: 2,
      ratingBoost: 5,
      aiSpeed: 1.1,
      aggression: 1.22,
      decision: 1.18,
      shotPower: 1.09,
      passError: 0.78,
      tackleBonus: 0.08,
    },
    {
      name: "Impossible",
      opponentRank: 0,
      ratingBoost: 10,
      aiSpeed: 1.22,
      aggression: 1.48,
      decision: 1.35,
      shotPower: 1.18,
      passError: 0.58,
      tackleBonus: 0.16,
    },
  ];

  const initialProgressSave = loadProgressSave();

  const state = {
    mode: "menu",
    selectedTeam: 0,
    opponentTeam: 1,
    clubPool: "ucl",
    worldSelectedTeam: 0,
    worldOpponentTeam: 15,
    homeTeam: null,
    awayTeam: null,
    homePlayers: [],
    awayPlayers: [],
    controlledIndex: 4,
    ball: createBall(),
    score: { home: 0, away: 0 },
    timeLeft: STANDARD_MATCH_LENGTH,
    matchLength: STANDARD_MATCH_LENGTH,
    activeMatchKind: "match",
    fieldDesign: 0,
    trophies: loadTrophyRoom(),
    progressSave: initialProgressSave,
    savedProgress: summarizeProgressSave(initialProgressSave),
    penaltyShootout: null,
    goalFreeze: 0,
    message: "",
    messageTimer: 0,
    winnerText: "",
    particles: [],
    trail: [],
    crowdPulse: 0,
    cameraShake: 0,
    lastScorer: "",
    lastScorerName: "",
    difficulty: 2,
    menuMode: "quick",
    careerPlayerIndex: 4,
    career: { active: false, type: null },
    worldCup: { active: false },
    careerHubView: "office",
    selectedLineupRole: "ST",
    selectedRosterUid: null,
    currentCareerMatch: false,
    currentWorldCupMatch: false,
    currentGoatMatch: false,
    currentGoatMatchId: null,
    extraTime: { active: false, used: false, seconds: 30 },
    lockedPlayerId: null,
    matchStats: createMatchStats(),
    potentialAssist: null,
    lastText: "",
  };

  const keys = new Set();
  const justPressed = new Set();
  const pointer = { x: VIEW.w / 2, y: VIEW.h / 2, down: false };
  const touchInput = {
    active: false,
    id: null,
    x: VIEW.w / 2,
    y: VIEW.h / 2,
    startX: VIEW.w / 2,
    startY: VIEW.h / 2,
    startTime: 0,
    moved: false,
    menuTap: null,
    used: false,
  };
  let hitboxes = [];
  let playerId = 1;
  let dynastyPlayerId = 1;
  let lastTimestamp = 0;
  let suppressMouseUntil = 0;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const lerp = (a, b, t) => a + (b - a) * t;
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const round = (value) => Math.round(value * 10) / 10;
  const rating01 = (rating) => clamp((rating - 60) / 40, 0, 1);
  const pointDist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  function difficultyName(index = state.difficulty) {
    return DIFFICULTIES[clamp(index, 1, DIFFICULTIES.length) - 1].name;
  }

  function selectedDifficulty() {
    return DIFFICULTIES[state.difficulty - 1] || DIFFICULTIES[1];
  }

  function countryCode(country) {
    return COUNTRY_CODES[country] || country.slice(0, 3).toUpperCase();
  }

  function clubLeagueForTeam(index) {
    return index >= CHAMPIONS_LEAGUE_TEAM_COUNT ? "mls" : "ucl";
  }

  function clubLeagueName(league) {
    return league === "mls" ? "MLS" : "Champions League";
  }

  function clubLeagueIndices(league) {
    return league === "mls" ? MLS_TEAM_INDICES : CHAMPIONS_LEAGUE_INDICES;
  }

  function clubLeagueIndicesForTeam(index) {
    return clubLeagueIndices(clubLeagueForTeam(index));
  }

  function clubLeagueNameForTeam(index) {
    return clubLeagueName(clubLeagueForTeam(index));
  }

  function visibleClubIndices() {
    return clubLeagueIndices(state.clubPool);
  }

  function playoffAdvanceCountForLeague(league) {
    return 6;
  }

  function playoffAdvanceCountForSeason(season) {
    return playoffAdvanceCountForLeague(season?.league || "ucl");
  }

  function playoffRuleLabel(season) {
    return "Top 6 advance. Seeds #1 and #2 get first-round byes.";
  }

  function compactPlayoffRuleLabel(season) {
    return "TOP 6 ADVANCE  |  #1-#2 BYE";
  }

  function effectiveDifficultyIndex() {
    let index = state.difficulty;
    if (state.currentCareerMatch && state.career.active) {
      if (state.career.type === "club") {
        if (state.career.season?.stage === "playoff") return DIFFICULTIES.length;
        index += Math.floor((state.career.fixture - 1) / 3);
      } else if (state.career.type === "player") {
        index += Math.floor((state.career.fixture - 1) / 4);
      }
    }
    return clamp(index, 1, DIFFICULTIES.length);
  }

  function activeDifficulty() {
    return DIFFICULTIES[effectiveDifficultyIndex() - 1] || selectedDifficulty();
  }

  function cycleDifficulty() {
    state.difficulty = (state.difficulty % DIFFICULTIES.length) + 1;
    pickOpponent();
  }

  function activeFieldDesign() {
    return FIELD_DESIGNS[state.fieldDesign] || FIELD_DESIGNS[0];
  }

  function activeFieldTeam() {
    if (state.homeTeam) return state.homeTeam;
    if (state.menuMode === "world") return WORLD_TEAMS[state.worldSelectedTeam] || WORLD_TEAMS[0];
    return TEAMS[state.selectedTeam] || TEAMS[0];
  }

  function cycleFieldDesign() {
    state.fieldDesign = (state.fieldDesign + 1) % FIELD_DESIGNS.length;
    state.message = `Field colors: ${activeFieldDesign().name}`;
    state.messageTimer = 1.6;
    if (state.career?.active || state.worldCup?.active) {
      saveProgress("field-colors");
    } else if (state.mode === "menu" && state.menuMode === "world" && hasSavedWorldCup()) {
      saveFieldDesignPreference("field-colors");
    }
  }

  function normalizeHex(hex, fallback = "#f7fbff") {
    if (typeof hex !== "string") return fallback;
    const raw = hex.trim().replace("#", "");
    return /^[0-9a-f]{6}$/i.test(raw) ? `#${raw}` : fallback;
  }

  function hexToRgb(hex, fallback = "#f7fbff") {
    const raw = normalizeHex(hex, fallback).replace("#", "");
    return [
      parseInt(raw.slice(0, 2), 16),
      parseInt(raw.slice(2, 4), 16),
      parseInt(raw.slice(4, 6), 16),
    ];
  }

  function componentToHex(value) {
    return clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0");
  }

  function rgbToHex(rgb) {
    return `#${componentToHex(rgb[0])}${componentToHex(rgb[1])}${componentToHex(rgb[2])}`;
  }

  function mixHex(a, b, amount) {
    const left = hexToRgb(a);
    const right = hexToRgb(b);
    return rgbToHex(left.map((value, index) => lerp(value, right[index], clamp(amount, 0, 1))));
  }

  function rgbaFromHex(hex, alpha) {
    const [r, g, b] = hexToRgb(hex);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function readableLineHex(hex) {
    const [r, g, b] = hexToRgb(hex);
    const brightness = r * 0.299 + g * 0.587 + b * 0.114;
    return brightness > 118 ? normalizeHex(hex) : mixHex(hex, "#ffffff", 0.72);
  }

  function fieldThemeFor(team = activeFieldTeam()) {
    const design = activeFieldDesign().id;
    if (design === "classic") {
      return {
        stripeA: "#176b43",
        stripeB: "#125f3b",
        border: "#062318",
        line: "rgba(247,251,255,0.84)",
        boxLine: "rgba(247,251,255,0.72)",
        center: "#f7fbff",
        goalFill: "rgba(247,251,255,0.08)",
        stadiumTop: "#071014",
        stadiumMid: "#0c1c22",
        stadiumBottom: "#081115",
        light: "rgba(255,255,255,0.22)",
      };
    }

    const colors = team?.colors || ["#176b43", "#125f3b", "#f7fbff"];
    const primary = normalizeHex(colors[0], "#176b43");
    const secondary = normalizeHex(colors[1], "#125f3b");
    const trim = readableLineHex(colors[2] || "#f7fbff");
    const glow = design === "glow";
    return {
      stripeA: mixHex(glow ? "#102028" : "#176b43", primary, glow ? 0.62 : 0.38),
      stripeB: mixHex(glow ? "#071114" : "#125f3b", secondary, glow ? 0.58 : 0.34),
      border: mixHex("#062318", primary, glow ? 0.42 : 0.24),
      line: rgbaFromHex(trim, 0.88),
      boxLine: rgbaFromHex(trim, 0.72),
      center: trim,
      goalFill: rgbaFromHex(primary, 0.11),
      stadiumTop: mixHex("#071014", primary, glow ? 0.34 : 0.2),
      stadiumMid: mixHex("#0c1c22", secondary, glow ? 0.28 : 0.18),
      stadiumBottom: mixHex("#081115", primary, glow ? 0.24 : 0.14),
      light: rgbaFromHex(trim, glow ? 0.32 : 0.22),
    };
  }

  function loadTrophyRoom() {
    try {
      const storage = typeof window !== "undefined" ? window.localStorage : null;
      const raw = storage?.getItem(TROPHY_STORAGE_KEY);
      const trophies = raw ? JSON.parse(raw) : [];
      return Array.isArray(trophies) ? trophies.slice(0, 36) : [];
    } catch {
      return [];
    }
  }

  function saveTrophyRoom() {
    try {
      const storage = typeof window !== "undefined" ? window.localStorage : null;
      storage?.setItem(TROPHY_STORAGE_KEY, JSON.stringify(state.trophies.slice(0, 36)));
    } catch {
      // Local storage can be unavailable in private browsing; the current session still keeps trophies.
    }
  }

  function trophyTemplate(type) {
    const templates = {
      worldCup: { title: "World Cup", metal: "#f5c75f", accent: "#8bdcd3" },
      mls: { title: "MLS Cup", metal: "#d7edf7", accent: "#f05d5e" },
      ucl: { title: "UCL Trophy", metal: "#f4f7ff", accent: "#6aa8ff" },
      goat: { title: "GOAT Mashup", metal: "#f5c75f", accent: "#ff7ab6" },
    };
    return templates[type] || { title: "Trophy", metal: "#f5c75f", accent: "#8bdcd3" };
  }

  function awardTrophy(type, teamName, note, colors = ["#f5c75f", "#8bdcd3", "#f7fbff"]) {
    const template = trophyTemplate(type);
    state.trophies.unshift({
      id: `${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      title: template.title,
      teamName,
      note,
      colors,
      wonAt: new Date().toLocaleDateString(),
    });
    state.trophies = state.trophies.slice(0, 36);
    saveTrophyRoom();
  }

  function loadProgressSave() {
    try {
      const storage = typeof window !== "undefined" ? window.localStorage : null;
      const raw = storage?.getItem(PROGRESS_STORAGE_KEY);
      if (!raw) return null;
      const save = JSON.parse(raw);
      return save?.version === PROGRESS_SAVE_VERSION ? save : null;
    } catch {
      return null;
    }
  }

  function clonePlain(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function saveProgress(reason = "progress") {
    const save = {
      version: PROGRESS_SAVE_VERSION,
      savedAt: Date.now(),
      reason,
      selectedTeam: state.selectedTeam,
      opponentTeam: state.opponentTeam,
      clubPool: state.clubPool,
      worldSelectedTeam: state.worldSelectedTeam,
      worldOpponentTeam: state.worldOpponentTeam,
      careerPlayerIndex: state.careerPlayerIndex,
      difficulty: state.difficulty,
      fieldDesign: state.fieldDesign,
      activeMatchKind: state.activeMatchKind,
      careerHubView: state.careerHubView,
      selectedLineupRole: state.selectedLineupRole,
      selectedRosterUid: state.selectedRosterUid,
      career: state.career?.active ? clonePlain(state.career) : { active: false },
      worldCup: state.worldCup?.active ? clonePlain(state.worldCup) : { active: false },
    };
    try {
      const storage = typeof window !== "undefined" ? window.localStorage : null;
      storage?.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(save));
      state.progressSave = save;
      state.savedProgress = summarizeProgressSave(save);
    } catch {
      state.progressSave = save;
      state.savedProgress = summarizeProgressSave(save);
    }
  }

  function saveFieldDesignPreference(reason = "field-colors") {
    const save = loadProgressSave();
    if (!save) return;
    save.fieldDesign = state.fieldDesign;
    save.reason = reason;
    save.savedAt = Date.now();
    try {
      const storage = typeof window !== "undefined" ? window.localStorage : null;
      storage?.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(save));
    } catch {
      // Keep the current-session state even if local storage is unavailable.
    }
    state.progressSave = save;
    state.savedProgress = summarizeProgressSave(save);
  }

  function summarizeProgressSave(save) {
    if (!save) return null;
    const career = save.career?.active
      ? {
          active: true,
          type: save.career.type,
          teamIndex: save.career.teamIndex,
          team: TEAMS[save.career.teamIndex]?.short || "TBD",
          fixture: save.career.fixture,
          record: `${save.career.wins || 0}-${save.career.draws || 0}-${save.career.losses || 0}`,
          stage: save.career.type === "club" ? save.career.season?.stage || "regular" : "career",
          leagueName: save.career.type === "club" ? save.career.season?.leagueName || clubLeagueNameForTeam(save.career.teamIndex) : null,
          year: save.career.year || null,
        }
      : null;
    const worldCup = save.worldCup?.active
      ? {
          active: true,
          teamIndex: save.worldCup.teamIndex,
          team: WORLD_TEAMS[save.worldCup.teamIndex]?.short || "TBD",
          roundIndex: save.worldCup.roundIndex || 0,
          stage: savedWorldCupStageLabel(save.worldCup),
          eliminated: Boolean(save.worldCup.eliminated),
          champion: save.worldCup.championIndex != null ? WORLD_TEAMS[save.worldCup.championIndex]?.short || "TBD" : null,
        }
      : null;
    return {
      savedAt: save.savedAt,
      savedLabel: formatSavedAt(save.savedAt),
      career,
      worldCup,
    };
  }

  function savedWorldCupStageLabel(cup) {
    if (cup.championIndex === cup.teamIndex) return "World Champions";
    if (cup.championIndex != null) return `Champion: ${WORLD_TEAMS[cup.championIndex]?.short || "TBD"}`;
    if (cup.eliminated) return "Eliminated";
    return cup.rounds?.[cup.roundIndex]?.label || "Knockout";
  }

  function formatSavedAt(timestamp) {
    if (!timestamp) return "";
    try {
      return new Date(timestamp).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  }

  function hasSavedCareer(type = null) {
    const career = state.savedProgress?.career;
    return Boolean(career?.active && (!type || career.type === type));
  }

  function hasSavedWorldCup() {
    return Boolean(state.savedProgress?.worldCup?.active);
  }

  function continueSavedCareer(type = null) {
    const save = loadProgressSave();
    if (!save?.career?.active || (type && save.career.type !== type)) {
      state.message = "No saved season found";
      state.messageTimer = 1.8;
      state.progressSave = save;
      state.savedProgress = summarizeProgressSave(save);
      return;
    }
    restoreProgressSave(save);
    state.career = clonePlain(save.career);
    state.worldCup = { active: false };
    state.menuMode = state.career.type === "club" ? "club" : "player";
    state.selectedTeam = state.career.teamIndex;
    state.clubPool = clubLeagueForTeam(state.selectedTeam);
    state.careerHubView = state.career.type === "club" ? save.careerHubView || "office" : "office";
    state.selectedLineupRole = save.selectedLineupRole || "ST";
    state.selectedRosterUid = save.selectedRosterUid || null;
    if (state.career.type === "club") {
      ensureCareerLineup(state.career);
      syncDynastyPlayerId(state.career);
    }
    state.mode = "careerHub";
    state.message = state.career.type === "club" ? "Season loaded" : "Career loaded";
    state.messageTimer = 1.8;
    pickOpponent();
  }

  function continueSavedWorldCup() {
    const save = loadProgressSave();
    if (!save?.worldCup?.active) {
      state.message = "No saved tournament found";
      state.messageTimer = 1.8;
      state.progressSave = save;
      state.savedProgress = summarizeProgressSave(save);
      return;
    }
    restoreProgressSave(save);
    state.worldCup = clonePlain(save.worldCup);
    state.career = { active: false, type: null };
    state.menuMode = "world";
    state.worldSelectedTeam = state.worldCup.teamIndex;
    state.mode = "worldCupHub";
    state.message = "Tournament loaded";
    state.messageTimer = 1.8;
    pickOpponent();
  }

  function restoreProgressSave(save) {
    state.progressSave = save;
    state.savedProgress = summarizeProgressSave(save);
    state.selectedTeam = clamp(save.selectedTeam ?? state.selectedTeam, 0, TEAMS.length - 1);
    state.opponentTeam = clamp(save.opponentTeam ?? state.opponentTeam, 0, TEAMS.length - 1);
    state.clubPool = save.clubPool === "mls" ? "mls" : "ucl";
    state.worldSelectedTeam = clamp(save.worldSelectedTeam ?? state.worldSelectedTeam, 0, WORLD_TEAMS.length - 1);
    state.worldOpponentTeam = clamp(save.worldOpponentTeam ?? state.worldOpponentTeam, 0, WORLD_TEAMS.length - 1);
    state.careerPlayerIndex = clamp(save.careerPlayerIndex ?? state.careerPlayerIndex, 0, 4);
    state.difficulty = clamp(save.difficulty ?? state.difficulty, 1, DIFFICULTIES.length);
    state.fieldDesign = clamp(save.fieldDesign ?? state.fieldDesign, 0, FIELD_DESIGNS.length - 1);
    state.activeMatchKind = save.activeMatchKind === "quick" ? "quick" : "match";
    state.homeTeam = null;
    state.awayTeam = null;
    state.homePlayers = [];
    state.awayPlayers = [];
    state.controlledIndex = 4;
    state.ball = createBall();
    state.score = { home: 0, away: 0 };
    state.matchLength = STANDARD_MATCH_LENGTH;
    state.timeLeft = state.matchLength;
    state.penaltyShootout = null;
    state.currentCareerMatch = false;
    state.currentWorldCupMatch = false;
    state.currentGoatMatch = false;
    state.currentGoatMatchId = null;
    state.extraTime = { active: false, used: false, seconds: 30 };
    state.lockedPlayerId = null;
    state.matchStats = createMatchStats();
    state.potentialAssist = null;
    state.particles = [];
    state.trail = [];
  }

  function syncDynastyPlayerId(career) {
    if (!career?.roster) return;
    let maxId = 0;
    for (const player of career.roster) {
      const match = /^dyn-(\d+)$/.exec(player.uid || "");
      if (match) maxId = Math.max(maxId, Number(match[1]));
    }
    dynastyPlayerId = Math.max(dynastyPlayerId, maxId + 1);
  }

  function createBall() {
    return {
      x: FIELD.cx,
      y: FIELD.cy,
      vx: 0,
      vy: 0,
      r: 7.5,
      owner: null,
      lastTouch: null,
      targetId: null,
      looseTimer: 0,
      spin: 0,
    };
  }

  function createMatchStats() {
    return {
      shots: 0,
      passes: 0,
      tackles: 0,
      goals: 0,
      assists: 0,
      touches: 0,
    };
  }

  function teamPower(team) {
    const avg = team.players.reduce((sum, player) => sum + player.rating, 0) / team.players.length;
    return Math.round(avg);
  }

  function menuTeamPool() {
    return state.menuMode === "world" ? WORLD_TEAMS : visibleClubIndices().map((index) => TEAMS[index]);
  }

  function menuSelectedIndex() {
    if (state.menuMode === "world") return state.worldSelectedTeam;
    const index = visibleClubIndices().indexOf(state.selectedTeam);
    return index === -1 ? 0 : index;
  }

  function menuOpponentIndex() {
    if (state.menuMode === "world") return state.worldOpponentTeam;
    const indices = visibleClubIndices();
    const index = indices.indexOf(state.opponentTeam);
    if (index !== -1) return index;
    const fallback = indices.findIndex((teamIndex) => teamIndex !== state.selectedTeam);
    return fallback === -1 ? 0 : fallback;
  }

  function setMenuSelectedIndex(index) {
    if (state.menuMode === "world") {
      state.worldSelectedTeam = clamp(index, 0, WORLD_TEAMS.length - 1);
    } else {
      const indices = visibleClubIndices();
      const wrappedIndex = ((index % indices.length) + indices.length) % indices.length;
      state.selectedTeam = indices[wrappedIndex] || indices[0];
      state.careerPlayerIndex = Math.min(state.careerPlayerIndex, TEAMS[state.selectedTeam].players.length - 1);
    }
    pickOpponent();
  }

  function setClubPool(pool) {
    if (state.menuMode === "world") return;
    state.clubPool = pool === "mls" ? "mls" : "ucl";
    state.selectedTeam = visibleClubIndices()[0];
    state.careerPlayerIndex = Math.min(state.careerPlayerIndex, TEAMS[state.selectedTeam].players.length - 1);
    pickOpponent();
  }

  function setMenuMode(mode) {
    state.menuMode = mode;
    if (mode !== "world") {
      const indices = visibleClubIndices();
      if (!indices.includes(state.selectedTeam)) state.selectedTeam = indices[0];
      state.careerPlayerIndex = Math.min(state.careerPlayerIndex, TEAMS[state.selectedTeam].players.length - 1);
    }
    pickOpponent();
  }

  function teamSquad(team) {
    return team.players.concat(team.bench || []);
  }

  function createClubSeason(teamIndex) {
    const league = clubLeagueForTeam(teamIndex);
    const leagueTeams = clubLeagueIndices(league);
    const regularSeasonLength = leagueTeams.length;
    return {
      stage: "regular",
      league,
      leagueName: clubLeagueName(league),
      leagueTeamCount: leagueTeams.length,
      playoffAdvanceCount: playoffAdvanceCountForLeague(league),
      regularSeasonLength,
      schedule: createRoundRobinSchedule(leagueTeams, regularSeasonLength),
      standings: createStandings(leagueTeams),
      seeds: [],
      playoff: null,
      championIndex: null,
      eliminated: false,
      teamIndex,
    };
  }

  function createStandings(teamIndices = TEAMS.map((team, index) => index)) {
    return teamIndices.map((teamIndex, index) => ({
      teamIndex,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      points: 0,
      seed: index + 1,
    }));
  }

  function createRoundRobinSchedule(teamIndices, targetRounds = teamIndices.length) {
    const rotation = teamIndices.slice();
    const teamCount = rotation.length;
    const rounds = [];
    for (let round = 0; round < teamCount - 1; round += 1) {
      const matches = [];
      for (let i = 0; i < teamCount / 2; i += 1) {
        const first = rotation[i];
        const second = rotation[teamCount - 1 - i];
        matches.push(round % 2 === 0 ? { home: first, away: second } : { home: second, away: first });
      }
      rounds.push(matches);
      const fixed = rotation[0];
      const rest = rotation.slice(1);
      rest.unshift(rest.pop());
      rotation.splice(0, rotation.length, fixed, ...rest);
    }
    const schedule = rounds.slice();
    let extraRound = 0;
    while (schedule.length < targetRounds) {
      const source = rounds[extraRound % rounds.length];
      schedule.push(source.map((match) => ({ home: match.away, away: match.home })));
      extraRound += 1;
    }
    return schedule.slice(0, targetRounds);
  }

  function rankedStandings(career) {
    const standings = career.season?.standings || [];
    const ranked = standings.slice().sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return teamPower(TEAMS[b.teamIndex]) - teamPower(TEAMS[a.teamIndex]);
    });
    ranked.forEach((row, index) => {
      row.seed = index + 1;
    });
    return ranked;
  }

  function seedForTeam(career, teamIndex) {
    const row = rankedStandings(career).find((entry) => entry.teamIndex === teamIndex);
    return row ? row.seed : 0;
  }

  function cloneDynastyPlayer(player, sourceTeam = "Academy", extras = {}) {
    return {
      uid: `dyn-${dynastyPlayerId++}`,
      name: player.name,
      role: player.role,
      number: player.number || Math.floor(2 + Math.random() * 88),
      rating: clamp(Math.round(player.rating), 1, 100),
      trait: player.trait || "Upside",
      sourceTeam,
      drafted: Boolean(extras.drafted),
      potential: extras.potential || clamp(Math.round(player.rating + 4 + Math.random() * 8), player.rating, 100),
    };
  }

  function createDynastyRoster(team) {
    return teamSquad(team).map((player) => cloneDynastyPlayer(player, team.short));
  }

  function dynastyPower(career) {
    if (!career?.roster?.length) return teamPower(TEAMS[career.teamIndex]);
    const starters = chooseStartingFive(career.roster, career.lineup);
    const avg = starters.reduce((sum, player) => sum + player.rating, 0) / starters.length;
    return Math.round(avg);
  }

  function chooseStartingFive(roster, lineup = null) {
    if (lineup) {
      const picked = lineupPlayers(roster, lineup);
      if (picked.length === ROLE_ORDER.length) return picked;
    }
    return ROLE_ORDER.map((role) => {
      const candidates = roster.filter((player) => player.role === role).sort((a, b) => b.rating - a.rating);
      return candidates[0] || roster.slice().sort((a, b) => b.rating - a.rating)[0];
    });
  }

  function lineupPlayers(roster, lineup) {
    const used = new Set();
    return ROLE_ORDER.map((role) => {
      const player = roster.find((item) => item.uid === lineup[role] && !used.has(item.uid));
      if (player) used.add(player.uid);
      return player;
    }).filter(Boolean);
  }

  function ensureCareerLineup(career) {
    if (!career?.roster?.length) return;
    if (!career.lineup) career.lineup = {};
    const used = new Set();
    for (const role of ROLE_ORDER) {
      const current = career.roster.find((player) => player.uid === career.lineup[role] && !used.has(player.uid));
      if (current) {
        used.add(current.uid);
        continue;
      }
      const sameRole = career.roster
        .filter((player) => player.role === role && !used.has(player.uid))
        .sort((a, b) => b.rating - a.rating)[0];
      const bestAvailable = career.roster
        .filter((player) => !used.has(player.uid))
        .sort((a, b) => b.rating - a.rating)[0];
      const next = sameRole || bestAvailable;
      if (next) {
        career.lineup[role] = next.uid;
        used.add(next.uid);
      }
    }
    if (!state.selectedRosterUid || !career.roster.some((player) => player.uid === state.selectedRosterUid)) {
      const selected = career.roster.find((player) => player.uid === career.lineup[state.selectedLineupRole]) || career.roster[0];
      state.selectedRosterUid = selected?.uid || null;
    }
  }

  function setLineupSlot(career, role, playerUid) {
    ensureCareerLineup(career);
    const player = career.roster.find((item) => item.uid === playerUid);
    if (!player) return;
    const oldUid = career.lineup[role];
    const currentRole = ROLE_ORDER.find((slotRole) => career.lineup[slotRole] === playerUid);
    if (currentRole && currentRole !== role) career.lineup[currentRole] = oldUid;
    career.lineup[role] = playerUid;
    state.selectedLineupRole = role;
    state.selectedRosterUid = playerUid;
    career.lastSummary = `${lastName(player.name)} moved into the ${role} slot.`;
    saveProgress("lineup");
  }

  function autoFillLineup(career) {
    career.lineup = {};
    ensureCareerLineup(career);
    career.lastSummary = "Team profile set to the strongest balanced starting five.";
    saveProgress("lineup");
  }

  function lineupDataFor(team, side) {
    if (
      side === "home" &&
      state.career.active &&
      state.career.type === "club" &&
      state.career.teamIndex === state.selectedTeam &&
      state.career.roster?.length
    ) {
      ensureCareerLineup(state.career);
      return chooseStartingFive(state.career.roster, state.career.lineup);
    }
    return ROLE_ORDER.map((role) => team.players.find((player) => player.role === role));
  }

  function createTradeMarket(career) {
    const targets = [];
    const otherPlayers = TEAMS.filter((_, index) => index !== career.teamIndex).flatMap((team) =>
      teamSquad(team).map((player) => ({ ...player, sourceTeam: team.short }))
    );
    for (let i = 0; i < 3; i += 1) {
      const role = ROLE_ORDER[(career.year + career.fixture + i) % ROLE_ORDER.length];
      const outgoing =
        career.roster
          .filter((player) => player.role === role)
          .sort((a, b) => a.rating - b.rating)[0] ||
        career.roster.slice().sort((a, b) => a.rating - b.rating)[0];
      targets.push(createTradeOfferForPlayer(career, outgoing, otherPlayers, i));
    }
    return targets;
  }

  function createTradeOfferForPlayer(career, outgoing, marketPool = null, offset = 0) {
    const otherPlayers =
      marketPool ||
      TEAMS.filter((_, index) => index !== career.teamIndex).flatMap((team) =>
        teamSquad(team).map((player) => ({ ...player, sourceTeam: team.short }))
      );
    const pool = otherPlayers
      .filter((player) => player.role === outgoing.role && player.rating >= outgoing.rating - 2)
      .sort((a, b) => b.rating - a.rating);
    const fallbackPool = otherPlayers.filter((player) => player.role === outgoing.role);
    const finalPool = pool.length ? pool : fallbackPool;
    const target = finalPool[(career.year + career.fixture + offset * 3 + outgoing.rating) % finalPool.length];
    const cost = clamp(Math.round((target.rating - outgoing.rating + 9) * 3), 4, 42);
    return {
      outgoingUid: outgoing.uid,
      outgoingName: outgoing.name,
      incoming: cloneDynastyPlayer(target, target.sourceTeam),
      cost,
    };
  }

  function createDraftBoard(career) {
    const firstNames = ["Kai", "Mateo", "Noah", "Leo", "Dante", "Milan", "Theo", "Jules", "Nico", "Andre"];
    const lastNames = ["Stone", "Rivera", "Hayes", "Moreau", "Silva", "Kovac", "Bennett", "Santos", "Vale", "Reed"];
    return ROLE_ORDER.slice(1).concat(["GK"]).slice(0, 4).map((role, index) => {
      const base = clamp(70 + career.year * 2 + Math.floor(Math.random() * 10) + index, 70, 90);
      return cloneDynastyPlayer(
        {
          name: `${firstNames[(career.year + index) % firstNames.length]} ${lastNames[(career.fixture + index * 3) % lastNames.length]}`,
          role,
          number: 40 + index + career.year,
          rating: base,
          trait: ["High ceiling", "Composed", "Speed", "Playmaker"][index % 4],
        },
        "Draft",
        { drafted: true, potential: clamp(base + 8 + Math.floor(Math.random() * 8), base, 100) }
      );
    });
  }

  function activeTradeOffer(career) {
    if (!career.tradeOffers?.length) career.tradeOffers = createTradeMarket(career);
    return career.tradeOffers[0];
  }

  function activeDraftProspect(career) {
    if (!career.draftProspects?.length) career.draftProspects = createDraftBoard(career);
    return career.draftProspects[0];
  }

  function allPlayers() {
    return state.homePlayers.concat(state.awayPlayers);
  }

  function normalizeKey(event) {
    if (event.key === " ") return "space";
    if (event.key === "ArrowLeft") return "left";
    if (event.key === "ArrowRight") return "right";
    if (event.key === "ArrowUp") return "up";
    if (event.key === "ArrowDown") return "down";
    if (event.key === "Shift") return "shift";
    if (event.key === "Tab") return "tab";
    if (event.key === "Enter") return "enter";
    return event.key.toLowerCase();
  }

  window.addEventListener("keydown", (event) => {
    const key = normalizeKey(event);
    if (
      [
        "left",
        "right",
        "up",
        "down",
        "w",
        "a",
        "s",
        "d",
        "space",
        "shift",
        "tab",
        "enter",
        "1",
        "2",
        "3",
        "e",
        "c",
        "q",
        "p",
        "f",
      ].includes(key)
    ) {
      event.preventDefault();
    }
    if (!keys.has(key)) justPressed.add(key);
    keys.add(key);
  });

  window.addEventListener("keyup", (event) => {
    keys.delete(normalizeKey(event));
  });

  canvas.addEventListener("mousemove", (event) => {
    if (nowMs() < suppressMouseUntil) return;
    const point = toCanvasPoint(event);
    pointer.x = point.x;
    pointer.y = point.y;
  });

  canvas.addEventListener("mousedown", (event) => {
    if (nowMs() < suppressMouseUntil) return;
    const point = toCanvasPoint(event);
    pointer.x = point.x;
    pointer.y = point.y;
    pointer.down = true;
  });

  window.addEventListener("mouseup", (event) => {
    if (nowMs() < suppressMouseUntil) return;
    const point = toCanvasPoint(event);
    pointer.x = point.x;
    pointer.y = point.y;
    pointer.down = false;
    handleClick(point.x, point.y);
  });

  canvas.addEventListener("touchstart", (event) => {
    if (!event.changedTouches.length) return;
    const touch = event.changedTouches[0];
    const point = toCanvasPointFromClient(touch.clientX, touch.clientY);
    pointer.x = point.x;
    pointer.y = point.y;
    pointer.down = true;
    suppressMouseUntil = nowMs() + 700;
    touchInput.used = true;
    if (state.mode === "play") {
      beginGameplayTouch(touch.identifier, point);
    } else {
      touchInput.menuTap = {
        id: touch.identifier,
        startX: point.x,
        startY: point.y,
        x: point.x,
        y: point.y,
      };
    }
    event.preventDefault();
  }, { passive: false });

  canvas.addEventListener("touchmove", (event) => {
    const touch = matchingTouch(event.changedTouches, touchInput.active ? touchInput.id : touchInput.menuTap?.id);
    if (!touch) return;
    suppressMouseUntil = nowMs() + 700;
    const point = toCanvasPointFromClient(touch.clientX, touch.clientY);
    pointer.x = point.x;
    pointer.y = point.y;
    if (touchInput.active) {
      updateGameplayTouch(point);
    } else if (touchInput.menuTap) {
      touchInput.menuTap.x = point.x;
      touchInput.menuTap.y = point.y;
    }
    event.preventDefault();
  }, { passive: false });

  canvas.addEventListener("touchend", (event) => {
    finishTouch(event);
  }, { passive: false });

  canvas.addEventListener("touchcancel", (event) => {
    finishTouch(event, true);
  }, { passive: false });

  function toCanvasPoint(event) {
    return toCanvasPointFromClient(event.clientX, event.clientY);
  }

  function toCanvasPointFromClient(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * VIEW.w,
      y: ((clientY - rect.top) / rect.height) * VIEW.h,
    };
  }

  function matchingTouch(touches, id) {
    for (let i = 0; i < touches.length; i += 1) {
      const touch = touches[i];
      if (touch.identifier === id) return touch;
    }
    return null;
  }

  function nowMs() {
    return typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
  }

  function beginGameplayTouch(id, point) {
    touchInput.active = true;
    touchInput.id = id;
    touchInput.x = point.x;
    touchInput.y = point.y;
    touchInput.startX = point.x;
    touchInput.startY = point.y;
    touchInput.startTime = nowMs();
    touchInput.moved = false;
    touchInput.menuTap = null;
  }

  function updateGameplayTouch(point) {
    touchInput.x = point.x;
    touchInput.y = point.y;
    if (Math.hypot(point.x - touchInput.startX, point.y - touchInput.startY) > 18) {
      touchInput.moved = true;
    }
  }

  function finishTouch(event, cancelled = false) {
    const touch = matchingTouch(event.changedTouches, touchInput.active ? touchInput.id : touchInput.menuTap?.id);
    if (!touch) return;
    suppressMouseUntil = nowMs() + 700;
    const point = toCanvasPointFromClient(touch.clientX, touch.clientY);
    pointer.x = point.x;
    pointer.y = point.y;
    pointer.down = false;

    if (touchInput.active) {
      const moved = touchInput.moved || Math.hypot(point.x - touchInput.startX, point.y - touchInput.startY) > 18;
      const duration = nowMs() - touchInput.startTime;
      touchInput.active = false;
      touchInput.id = null;
      if (!cancelled && state.mode === "play" && !moved && duration < 360) {
        performControlledAction();
      }
    } else if (touchInput.menuTap) {
      const tap = touchInput.menuTap;
      const moved = Math.hypot(point.x - tap.startX, point.y - tap.startY) > 18;
      touchInput.menuTap = null;
      if (!cancelled && !moved) handleClick(point.x, point.y);
    }
    event.preventDefault();
  }

  function handleClick(x, y) {
    for (let i = hitboxes.length - 1; i >= 0; i -= 1) {
      const box = hitboxes[i];
      if (x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h) {
        box.action();
        return;
      }
    }
  }

  function addHitbox(id, x, y, w, h, action) {
    hitboxes.push({ id, x, y, w, h, action });
  }

  function pickOpponent() {
    if (state.menuMode === "world") {
      state.worldOpponentTeam = worldCupFirstOpponentIndex(state.worldSelectedTeam);
      return;
    }
    const leagueTeams = visibleClubIndices();
    if (!leagueTeams.includes(state.selectedTeam)) state.selectedTeam = leagueTeams[0];
    const sorted = leagueTeams.map((index) => ({ index, power: teamPower(TEAMS[index]) }))
      .filter((entry) => entry.index !== state.selectedTeam)
      .sort((a, b) => b.power - a.power);
    if (!sorted.length) {
      state.opponentTeam = state.selectedTeam;
      return;
    }
    const rank = clamp(selectedDifficulty().opponentRank, 0, sorted.length - 1);
    state.opponentTeam = sorted[rank].index;
  }

  function worldCupFirstOpponentIndex(teamIndex) {
    const slot = WORLD_BRACKET_ORDER.indexOf(teamIndex);
    if (slot === -1) return (teamIndex + 1) % WORLD_TEAMS.length;
    return WORLD_BRACKET_ORDER[slot % 2 === 0 ? slot + 1 : slot - 1];
  }

  function freePlayMatchLength(kind) {
    return kind === "quick" ? QUICK_MATCH_LENGTH : STANDARD_MATCH_LENGTH;
  }

  function startFreePlayMatch(kind = "match") {
    startMatch(state.selectedTeam, state.opponentTeam, {
      matchKind: kind === "quick" ? "quick" : "match",
      matchLength: freePlayMatchLength(kind),
    });
  }

  function startMatch(homeIndex = state.selectedTeam, awayIndex = state.opponentTeam, options = {}) {
    const teams = options.teams || TEAMS;
    const freePlay = !options.career && !options.worldCup && !options.goat;
    const matchKind = freePlay
      ? options.matchKind || state.activeMatchKind || "match"
      : options.career
        ? "career"
        : options.worldCup
          ? "world cup"
          : "goat mashup";
    state.matchLength = options.matchLength || (freePlay ? freePlayMatchLength(matchKind) : STANDARD_MATCH_LENGTH);
    if (freePlay) state.activeMatchKind = matchKind === "quick" ? "quick" : "match";
    if (!options.career && !options.worldCup && !options.goat) {
      state.career = { active: false, type: null };
      state.worldCup = { active: false };
      state.careerHubView = "office";
      state.currentCareerMatch = false;
      state.currentWorldCupMatch = false;
      state.currentGoatMatch = false;
      state.currentGoatMatchId = null;
      state.lockedPlayerId = null;
    } else if (options.career) {
      state.currentCareerMatch = true;
      state.currentWorldCupMatch = false;
      state.currentGoatMatch = false;
      state.currentGoatMatchId = null;
    } else if (options.worldCup) {
      state.currentWorldCupMatch = true;
      state.currentCareerMatch = false;
      state.currentGoatMatch = false;
      state.currentGoatMatchId = null;
      state.career = { active: false, type: null };
      state.lockedPlayerId = null;
    } else if (options.goat) {
      state.currentGoatMatch = true;
      state.currentGoatMatchId = options.goatMatchId || null;
      state.currentCareerMatch = false;
      state.currentWorldCupMatch = false;
      state.worldCup = { active: false };
      state.lockedPlayerId = null;
    }
    state.homeTeam = teams[homeIndex];
    state.awayTeam = teams[awayIndex];
    state.homePlayers = createLineup(state.homeTeam, "home");
    state.awayPlayers = createLineup(state.awayTeam, "away");
    state.controlledIndex = Math.max(1, state.homePlayers.findIndex((player) => player.role === "ST"));
    if (options.career && state.career.type === "player") {
      const careerPlayer = state.homePlayers.find((player) => player.name === state.career.playerName);
      if (careerPlayer) {
        state.controlledIndex = state.homePlayers.indexOf(careerPlayer);
        state.lockedPlayerId = careerPlayer.id;
      }
    }
    state.ball = createBall();
    state.score = { home: 0, away: 0 };
    state.timeLeft = state.matchLength;
    state.extraTime = { active: false, used: false, seconds: 30 };
    state.penaltyShootout = null;
    state.goalFreeze = 0;
    state.message = freePlay && state.activeMatchKind === "quick"
      ? `Quick: ${state.homeTeam.short} v ${state.awayTeam.short}`
      : `${state.homeTeam.short} v ${state.awayTeam.short}`;
    state.messageTimer = 2;
    state.winnerText = "";
    state.lastScorer = "";
    state.lastScorerName = "";
    state.matchStats = createMatchStats();
    state.potentialAssist = null;
    state.particles = [];
    state.trail = [];
    resetPositions();
    setBallOwner(state.homePlayers[state.controlledIndex]);
    state.mode = "play";
  }

  function createLineup(team, side) {
    const direction = side === "home" ? 1 : -1;
    const lineupData = lineupDataFor(team, side);
    return ROLE_ORDER.map((role, index) => {
      const data = lineupData[index] || team.players.find((player) => player.role === role);
      let rating = data.rating - (data.role !== role ? 3 : 0);
      if (side === "home" && state.career.active) {
        if (state.career.type === "player" && data.name === state.career.playerName) {
          rating += state.career.ratingBoost || 0;
        }
        if (state.career.type === "club" && state.career.teamIndex === state.selectedTeam) {
          rating += state.career.sharpness || 0;
        }
      }
      if (side === "away") {
        rating += activeDifficulty().ratingBoost;
      }
      rating = clamp(Math.round(rating), 1, 100);
      const form = FORMATION[role];
      const xPercent = side === "home" ? form.x : 1 - form.x;
      const baseX = FIELD.x + FIELD.w * xPercent;
      const baseY = FIELD.y + FIELD.h * form.y;
      return {
        id: playerId++,
        side,
        team,
        name: data.name,
        role,
        naturalRole: data.role,
        number: data.number,
        rating,
        trait: data.trait,
        baseX,
        baseY,
        x: baseX,
        y: baseY,
        vx: 0,
        vy: 0,
        r: data.role === "GK" ? 18 : 16,
        facingX: direction,
        facingY: 0,
        stamina: 1,
        cooldown: 0,
        tackleTimer: 0,
        aiThink: 0,
        flash: 0,
      };
    });
  }

  function resetPositions() {
    for (const player of allPlayers()) {
      player.x = player.baseX;
      player.y = player.baseY;
      player.vx = 0;
      player.vy = 0;
      player.facingX = player.side === "home" ? 1 : -1;
      player.facingY = 0;
      player.stamina = Math.max(player.stamina, 0.72);
      player.cooldown = 0;
      player.tackleTimer = 0;
    }
  }

  function setBallOwner(player) {
    state.ball.owner = player;
    state.ball.lastTouch = player;
    state.ball.targetId = null;
    state.ball.looseTimer = 0;
    state.ball.vx = 0;
    state.ball.vy = 0;
    player.flash = 0.22;
    if (state.currentCareerMatch && state.career.type === "player" && player.name === state.career.playerName) {
      state.matchStats.touches += 1;
    }
    if (player.side === "home" && player.role !== "GK" && !state.lockedPlayerId) {
      state.controlledIndex = state.homePlayers.indexOf(player);
    }
  }

  function releaseBall(player, vx, vy, targetId = null) {
    state.ball.owner = null;
    state.ball.lastTouch = player;
    state.ball.targetId = targetId;
    state.ball.looseTimer = 0.18;
    state.ball.vx = vx;
    state.ball.vy = vy;
    state.ball.x = player.x + player.facingX * (player.r + state.ball.r + 3);
    state.ball.y = player.y + player.facingY * (player.r + state.ball.r + 3);
    state.ball.spin = clamp((vx * 0.001) + (vy * 0.0008), -1.2, 1.2);
  }

  function update(dt) {
    state.crowdPulse += dt;
    state.cameraShake = Math.max(0, state.cameraShake - dt * 18);
    state.messageTimer = Math.max(0, state.messageTimer - dt);
    for (const player of allPlayers()) {
      player.cooldown = Math.max(0, player.cooldown - dt);
      player.tackleTimer = Math.max(0, player.tackleTimer - dt);
      player.flash = Math.max(0, player.flash - dt);
    }

    if (justPressed.has("f")) toggleFullscreen();

    if (state.mode === "menu") {
      updateMenu();
      updateParticles(dt);
      return;
    }

    if (state.mode === "careerHub") {
      updateCareerHub();
      updateParticles(dt);
      return;
    }

    if (state.mode === "worldCupHub") {
      updateWorldCupHub();
      updateParticles(dt);
      return;
    }

    if (state.mode === "trophyRoom") {
      updateTrophyRoom();
      updateParticles(dt);
      return;
    }

    if (state.mode === "penalties") {
      updatePenaltyShootout(dt);
      updateParticles(dt);
      return;
    }

    if (state.mode === "paused") {
      if (justPressed.has("p") || justPressed.has("enter")) state.mode = "play";
      updateParticles(dt);
      return;
    }

    if (state.mode === "ended") {
      updateParticles(dt);
      if (justPressed.has("enter")) startMatch();
      return;
    }

    if (justPressed.has("p")) {
      state.mode = "paused";
      return;
    }

    if (state.potentialAssist) {
      state.potentialAssist.time -= dt;
      if (state.potentialAssist.time <= 0) state.potentialAssist = null;
    }

    if (state.mode === "goal") {
      state.goalFreeze -= dt;
      updateBall(dt);
      updateParticles(dt);
      if (state.goalFreeze <= 0) {
        setupKickoff(state.lastScorer === "home" ? "away" : "home");
        state.mode = "play";
      }
      return;
    }

    handlePlayInputs();
    enforceCareerControlLock();
    updatePlayers(dt);
    resolvePlayerCollisions();
    updateBall(dt);
    handleBallClaims();
    handleGoalkeeperClaims();
    checkGoals();
    updateParticles(dt);

    state.timeLeft = Math.max(0, state.timeLeft - dt);
    if (state.timeLeft <= 0) finishMatch();
  }

  function updateMenu() {
    if (justPressed.has("1")) setMenuMode("quick");
    if (justPressed.has("2")) setMenuMode("player");
    if (justPressed.has("3")) setMenuMode("club");
    if (justPressed.has("4")) setMenuMode("world");
    if (state.menuMode !== "world" && justPressed.has("m")) setClubPool("mls");
    if (state.menuMode !== "world" && justPressed.has("u")) setClubPool("ucl");
    if (justPressed.has("c")) cycleFieldDesign();
    if (justPressed.has("left") || justPressed.has("a")) {
      const teams = menuTeamPool();
      setMenuSelectedIndex((menuSelectedIndex() + teams.length - 1) % teams.length);
    }
    if (justPressed.has("right") || justPressed.has("d")) {
      const teams = menuTeamPool();
      setMenuSelectedIndex((menuSelectedIndex() + 1) % teams.length);
    }
    if (justPressed.has("e")) {
      cycleDifficulty();
    }
    if (justPressed.has("up") || justPressed.has("w")) {
      if (state.menuMode === "player") {
        state.careerPlayerIndex =
          (state.careerPlayerIndex + TEAMS[state.selectedTeam].players.length - 1) %
          TEAMS[state.selectedTeam].players.length;
      }
    }
    if (justPressed.has("down") || justPressed.has("s")) {
      if (state.menuMode === "player") {
        state.careerPlayerIndex =
          (state.careerPlayerIndex + 1) % TEAMS[state.selectedTeam].players.length;
      }
    }
    if (justPressed.has("enter") || justPressed.has("space")) {
      if (state.menuMode === "player") beginPlayerCareer();
      else if (state.menuMode === "club") beginClubCareer();
      else if (state.menuMode === "world") beginWorldCup();
      else startFreePlayMatch("match");
    }
    if (state.menuMode === "quick" && justPressed.has("q")) startFreePlayMatch("quick");
  }

  function updateCareerHub() {
    if (justPressed.has("enter") || justPressed.has("space")) primaryCareerAction(state.career);
    if (justPressed.has("escape")) {
      if (state.career.type === "club" && state.careerHubView === "roster") {
        state.careerHubView = "office";
        return;
      }
      state.mode = "menu";
      state.menuMode = state.career.type === "club" ? "club" : "player";
    }
  }

  function updateWorldCupHub() {
    if (justPressed.has("enter") || justPressed.has("space")) startNextWorldCupMatch();
    if (justPressed.has("escape")) {
      state.mode = "menu";
      state.menuMode = "world";
    }
  }

  function handlePlayInputs() {
    const controlled = state.homePlayers[state.controlledIndex];
    if (!controlled) return;

    if (justPressed.has("tab")) switchControlledPlayer();

    const owner = state.ball.owner;
    const nowControlled = state.homePlayers[state.controlledIndex];
    if (justPressed.has("e") && owner === nowControlled) passBall(nowControlled, true);
    if (justPressed.has("space")) performControlledAction();
  }

  function performControlledAction() {
    const controlled = state.homePlayers[state.controlledIndex];
    if (!controlled) return;
    if (state.ball.owner === controlled) {
      shootBall(controlled, true);
    } else {
      attemptUserTackle(controlled);
    }
  }

  function switchControlledPlayer() {
    if (state.lockedPlayerId) {
      const locked = state.homePlayers.find((player) => player.id === state.lockedPlayerId);
      if (locked) {
        state.controlledIndex = state.homePlayers.indexOf(locked);
        state.message = `Locked to ${lastName(locked.name)}`;
        state.messageTimer = 0.9;
      }
      return;
    }
    const current = state.homePlayers[state.controlledIndex];
    if (state.ball.owner && state.ball.owner.side === "home" && state.ball.owner.role !== "GK") {
      state.controlledIndex = state.homePlayers.indexOf(state.ball.owner);
      return;
    }
    const outfield = state.homePlayers.filter((player) => player.role !== "GK");
    const currentOutfieldIndex = outfield.indexOf(current);
    let next = outfield[(currentOutfieldIndex + 1 + outfield.length) % outfield.length];
    const nearest = outfield.reduce((best, player) => {
      const score = dist(player, state.ball) - player.rating * 0.25;
      return score < best.score ? { player, score } : best;
    }, { player: next, score: Infinity }).player;
    if (dist(nearest, state.ball) + 30 < dist(next, state.ball)) next = nearest;
    state.controlledIndex = state.homePlayers.indexOf(next);
    next.flash = 0.25;
  }

  function enforceCareerControlLock() {
    if (!state.lockedPlayerId) return;
    const locked = state.homePlayers.find((player) => player.id === state.lockedPlayerId);
    if (locked) state.controlledIndex = state.homePlayers.indexOf(locked);
  }

  function beginPlayerCareer() {
    const team = TEAMS[state.selectedTeam];
    const chosen = team.players[state.careerPlayerIndex] || team.players[team.players.length - 1];
    state.worldCup = { active: false };
    state.career = {
      active: true,
      type: "player",
      teamIndex: state.selectedTeam,
      playerName: chosen.name,
      playerRole: chosen.role,
      playerNumber: chosen.number,
      baseRating: chosen.rating,
      ratingBoost: 0,
      xp: 0,
      fixture: 1,
      wins: 0,
      draws: 0,
      losses: 0,
      goals: 0,
      assists: 0,
      lastSummary: "Make your debut under the lights.",
      history: [],
    };
    saveProgress("player-career-start");
    startNextCareerMatch();
  }

  function beginClubCareer() {
    state.worldCup = { active: false };
    state.career = {
      active: true,
      type: "club",
      teamIndex: state.selectedTeam,
      budget: 72,
      reputation: 72,
      sharpness: 0,
      year: 1,
      championships: 0,
      playoffAppearances: 0,
      draftPicks: 1,
      roster: createDynastyRoster(TEAMS[state.selectedTeam]),
      lineup: {},
      tradeOffers: [],
      draftProspects: [],
      tradeCount: 0,
      fixture: 1,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      season: createClubSeason(state.selectedTeam),
      goatMashup: null,
      goatTitles: 0,
      lastSummary: `${clubLeagueNameForTeam(state.selectedTeam)} season starts with league-only fixtures.`,
      history: [],
    };
    state.careerHubView = "office";
    state.selectedLineupRole = "ST";
    state.selectedRosterUid = null;
    ensureCareerLineup(state.career);
    state.career.tradeOffers = createTradeMarket(state.career);
    state.career.draftProspects = createDraftBoard(state.career);
    saveProgress("club-career-start");
    startNextCareerMatch();
  }

  function beginWorldCup() {
    state.worldCup = createWorldCup(state.worldSelectedTeam);
    state.career = { active: false, type: null };
    state.currentCareerMatch = false;
    state.currentWorldCupMatch = false;
    state.currentGoatMatch = false;
    state.currentGoatMatchId = null;
    saveProgress("world-cup-start");
    startNextWorldCupMatch();
  }

  function createWorldCup(teamIndex) {
    const firstRound = [];
    for (let i = 0; i < WORLD_BRACKET_ORDER.length; i += 2) {
      firstRound.push(createWorldCupMatch("R16", WORLD_BRACKET_ORDER[i], WORLD_BRACKET_ORDER[i + 1], firstRound.length + 1));
    }
    return {
      active: true,
      teamIndex,
      roundIndex: 0,
      rounds: [
        { id: "round16", label: "Round of 16", matches: firstRound },
      ],
      championIndex: null,
      eliminated: false,
      lastSummary: "Sixteen nations. Single elimination. No trades, no second chances.",
      history: [],
    };
  }

  function createWorldCupMatch(prefix, homeTeam, awayTeam, number) {
    return {
      id: `${prefix}-${number}`,
      homeTeam,
      awayTeam,
      homeSeed: homeTeam + 1,
      awaySeed: awayTeam + 1,
      played: false,
      score: "",
      winner: null,
      loser: null,
      shootout: false,
    };
  }

  function currentWorldCupRound() {
    return state.worldCup.rounds[state.worldCup.roundIndex] || null;
  }

  function currentWorldCupMatch() {
    const round = currentWorldCupRound();
    if (!round) return null;
    return round.matches.find(
      (match) =>
        !match.played &&
        (match.homeTeam === state.worldCup.teamIndex || match.awayTeam === state.worldCup.teamIndex)
    ) || null;
  }

  function startNextWorldCupMatch() {
    const cup = state.worldCup;
    if (!cup.active || cup.eliminated || cup.championIndex != null) {
      cup.lastSummary = worldCupStatusText(cup);
      return;
    }
    const match = currentWorldCupMatch();
    if (!match) {
      cup.lastSummary = worldCupStatusText(cup);
      return;
    }
    const opponent = match.homeTeam === cup.teamIndex ? match.awayTeam : match.homeTeam;
    state.worldSelectedTeam = cup.teamIndex;
    state.worldOpponentTeam = opponent;
    startMatch(cup.teamIndex, opponent, { worldCup: true, teams: WORLD_TEAMS });
  }

  function applyWorldCupResult(wentToExtraTime = false, forcedWinner = null, penaltyScore = "") {
    const cup = state.worldCup;
    const round = currentWorldCupRound();
    const match = currentWorldCupMatch();
    if (!round || !match) return;
    const userIsHomeSeed = match.homeTeam === cup.teamIndex;
    const matchHomeGoals = userIsHomeSeed ? state.score.home : state.score.away;
    const matchAwayGoals = userIsHomeSeed ? state.score.away : state.score.home;
    const winner = forcedWinner ?? resolveWorldCupWinner(match.homeTeam, match.awayTeam, matchHomeGoals, matchAwayGoals);
    finishWorldCupMatch(
      match,
      matchHomeGoals,
      matchAwayGoals,
      winner,
      matchHomeGoals === matchAwayGoals,
      wentToExtraTime,
      penaltyScore
    );
    const userWon = winner === cup.teamIndex;
    cup.history.unshift({
      round: round.label,
      opponent: WORLD_TEAMS[match.homeTeam === cup.teamIndex ? match.awayTeam : match.homeTeam].short,
      result: userWon ? "W" : "L",
      score: match.score,
    });
    cup.history = cup.history.slice(0, 4);
    if (!userWon) {
      cup.eliminated = true;
      completeWorldCupAi(cup);
      cup.lastSummary = `Lost ${round.label} ${match.score}. ${WORLD_TEAMS[match.winner].short} advance. Champion: ${WORLD_TEAMS[cup.championIndex].short}.`;
      return;
    }
    simulateWorldCupRound(round, cup.teamIndex);
    if (!advanceWorldCupRound(cup)) {
      cup.championIndex = cup.teamIndex;
      awardTrophy("worldCup", WORLD_TEAMS[cup.teamIndex].name, "World Cup champions", WORLD_TEAMS[cup.teamIndex].colors);
      cup.lastSummary = `Won the Final ${match.score}. World Cup champions.`;
      return;
    }
    cup.lastSummary = `Won ${round.label} ${match.score}. Next: ${currentWorldCupRound().label}.`;
  }

  function finishWorldCupMatch(match, homeGoals, awayGoals, winner, shootout, extraTime = false, penaltyScore = "") {
    match.played = true;
    match.score = `${homeGoals}-${awayGoals}${shootout ? ` pens${penaltyScore ? ` ${penaltyScore}` : ""}` : extraTime ? " ET" : ""}`;
    match.winner = winner;
    match.loser = winner === match.homeTeam ? match.awayTeam : match.homeTeam;
    match.shootout = shootout;
    match.extraTime = extraTime;
    match.penaltyScore = penaltyScore;
  }

  function resolveWorldCupWinner(teamA, teamB, goalsA, goalsB) {
    if (goalsA > goalsB) return teamA;
    if (goalsB > goalsA) return teamB;
    const aPower = teamPower(WORLD_TEAMS[teamA]);
    const bPower = teamPower(WORLD_TEAMS[teamB]);
    const chanceA = clamp(0.5 + (aPower - bPower) / 80, 0.28, 0.72);
    return Math.random() < chanceA ? teamA : teamB;
  }

  function simulateWorldCupRound(round, protectedTeam = null) {
    for (const match of round.matches) {
      if (match.played) continue;
      if (protectedTeam != null && (match.homeTeam === protectedTeam || match.awayTeam === protectedTeam)) continue;
      const score = simulateWorldCupScore(match.homeTeam, match.awayTeam);
      const winner = resolveWorldCupWinner(match.homeTeam, match.awayTeam, score.home, score.away);
      finishWorldCupMatch(match, score.home, score.away, winner, score.home === score.away);
    }
  }

  function simulateWorldCupScore(homeIndex, awayIndex) {
    const homePower = teamPower(WORLD_TEAMS[homeIndex]);
    const awayPower = teamPower(WORLD_TEAMS[awayIndex]);
    const tilt = (homePower - awayPower) / 24;
    const home = clamp(Math.floor(Math.random() * 3 + 0.85 + tilt), 0, 5);
    const away = clamp(Math.floor(Math.random() * 3 + 0.75 - tilt), 0, 5);
    return { home, away };
  }

  function advanceWorldCupRound(cup) {
    const round = cup.rounds[cup.roundIndex];
    const winners = round.matches.map((match) => match.winner).filter((winner) => winner != null);
    if (winners.length <= 1) return false;
    const labels = ["Round of 16", "Quarterfinal", "Semifinal", "Final"];
    const nextIndex = cup.roundIndex + 1;
    const matches = [];
    for (let i = 0; i < winners.length; i += 2) {
      matches.push(createWorldCupMatch(labels[nextIndex].replaceAll(" ", "").toUpperCase(), winners[i], winners[i + 1], matches.length + 1));
    }
    cup.rounds.push({
      id: labels[nextIndex].toLowerCase().replaceAll(" ", ""),
      label: labels[nextIndex],
      matches,
    });
    cup.roundIndex = nextIndex;
    return true;
  }

  function completeWorldCupAi(cup) {
    while (cup.championIndex == null) {
      const round = cup.rounds[cup.roundIndex];
      simulateWorldCupRound(round);
      if (!advanceWorldCupRound(cup)) {
        cup.championIndex = round.matches[0].winner;
      }
    }
  }

  function worldCupStatusText(cup) {
    if (cup.championIndex === cup.teamIndex) return `${WORLD_TEAMS[cup.teamIndex].short} lifted the World Cup.`;
    if (cup.championIndex != null) return `Tournament complete. Champion: ${WORLD_TEAMS[cup.championIndex].short}.`;
    if (cup.eliminated) return `${WORLD_TEAMS[cup.teamIndex].short} are out.`;
    const match = currentWorldCupMatch();
    return match ? `Next knockout match: ${WORLD_TEAMS[cup.teamIndex].short} vs ${WORLD_TEAMS[match.homeTeam === cup.teamIndex ? match.awayTeam : match.homeTeam].short}.` : "Waiting for bracket.";
  }

  function startNextCareerMatch() {
    if (!state.career.active) return;
    state.selectedTeam = state.career.teamIndex;
    if (state.career.type === "club" && !hasPlayableClubMatch(state.career)) {
      state.career.lastSummary = clubSeasonStatusText(state.career);
      return;
    }
    const awayIndex = careerOpponentIndex();
    state.opponentTeam = awayIndex;
    startMatch(state.career.teamIndex, awayIndex, { career: true });
  }

  function isKnockoutMatchActive() {
    return (
      state.currentWorldCupMatch ||
      state.currentGoatMatch ||
      (state.currentCareerMatch && state.career.active && state.career.type === "club" && state.career.season?.stage === "playoff")
    );
  }

  function shouldStartExtraTime() {
    return isKnockoutMatchActive() && state.score.home === state.score.away && !state.extraTime.used;
  }

  function shouldStartPenaltyShootout() {
    return (
      state.score.home === state.score.away &&
      state.extraTime.used &&
      (state.currentWorldCupMatch ||
        (state.currentCareerMatch &&
          state.career.active &&
          state.career.type === "club" &&
          state.career.season?.stage === "playoff"))
    );
  }

  function startExtraTime() {
    state.extraTime.active = true;
    state.extraTime.used = true;
    state.timeLeft = state.extraTime.seconds;
    state.goalFreeze = 0;
    resetPositions();
    setupKickoff("home");
    state.message = "Extra time";
    state.messageTimer = 2;
  }

  function startPenaltyShootout() {
    const worldCupMatch = state.currentWorldCupMatch && state.worldCup.active ? currentWorldCupMatch() : null;
    const playoffMatch =
      state.currentCareerMatch && state.career.active && state.career.type === "club"
        ? currentPlayablePlayoffMatch(state.career)
        : null;
    const context = worldCupMatch ? "worldCup" : "playoff";
    const homeIndex = worldCupMatch ? state.worldCup.teamIndex : state.career.teamIndex;
    const awayIndex = worldCupMatch
      ? worldCupMatch.homeTeam === state.worldCup.teamIndex
        ? worldCupMatch.awayTeam
        : worldCupMatch.homeTeam
      : playoffMatch?.homeTeam === state.career.teamIndex
        ? playoffMatch.awayTeam
        : playoffMatch?.homeTeam;

    state.extraTime.active = false;
    state.penaltyShootout = {
      context,
      homeIndex,
      awayIndex,
      homePens: 0,
      awayPens: 0,
      homeTaken: 0,
      awayTaken: 0,
      homeSeq: [],
      awaySeq: [],
      maxKicks: 5,
      turn: "home",
      complete: false,
      winnerIndex: null,
      penaltyScore: "",
      live: null,
      log: ["Penalty shootout begins"],
      last: "Choose a side to shoot first.",
    };
    state.mode = "penalties";
    state.message = "Penalty shootout";
    state.messageTimer = 2;
    spawnBurst(FIELD.cx, FIELD.cy, ["#f5c75f", "#ffffff", "#8bdcd3"], 42);
  }

  function updatePenaltyShootout(dt = 1 / 60) {
    const shootout = state.penaltyShootout;
    if (!shootout) {
      state.mode = state.currentWorldCupMatch ? "worldCupHub" : "careerHub";
      return;
    }
    if (shootout.live) {
      updateLivePenalty(shootout, dt);
      return;
    }
    if (shootout.complete) {
      if (justPressed.has("enter") || justPressed.has("space")) exitPenaltyShootout();
      return;
    }
    if (justPressed.has("left") || justPressed.has("a") || justPressed.has("1")) takePenalty("left");
    if (justPressed.has("down") || justPressed.has("s") || justPressed.has("2") || justPressed.has("space")) takePenalty("center");
    if (justPressed.has("right") || justPressed.has("d") || justPressed.has("3")) takePenalty("right");
  }

  function takePenalty(choice) {
    const shootout = state.penaltyShootout;
    if (!shootout || shootout.complete || shootout.live || !PENALTY_DIRECTIONS.includes(choice)) return;
    const homePower = teamPower(state.homeTeam);
    const awayPower = teamPower(state.awayTeam);
    const homeTurn = shootout.turn === "home";
    const shotDirection = homeTurn ? choice : randomPenaltyDirection();
    const keeperDirection = homeTurn ? randomPenaltyDirection() : choice;
    const powerEdge = homeTurn ? (homePower - awayPower) / 230 : (awayPower - homePower) / 230;
    const baseChance = homeTurn ? 0.78 : 0.76;
    const readPenalty = shotDirection === keeperDirection ? (homeTurn ? 0.29 : 0.34) : 0;
    const chance = clamp(baseChance + powerEdge - readPenalty, homeTurn ? 0.42 : 0.38, homeTurn ? 0.92 : 0.9);
    const scored = Math.random() < chance;
    const saved = !scored && shotDirection === keeperDirection;

    shootout.live = {
      t: 0,
      duration: 1.08,
      homeTurn,
      shotDirection,
      keeperDirection,
      scored,
      saved,
      result: scored ? "GOAL" : saved ? "SAVE" : "MISS",
    };
    shootout.last = homeTurn
      ? `${state.homeTeam.short} shot ${shotDirection.toUpperCase()}`
      : `${state.awayTeam.short} shot ${shotDirection.toUpperCase()}`;
  }

  function updateLivePenalty(shootout, dt) {
    shootout.live.t += dt;
    if (shootout.live.t < shootout.live.duration) return;
    commitLivePenalty(shootout);
  }

  function commitLivePenalty(shootout) {
    const live = shootout.live;
    if (!live) return;
    const { homeTurn, shotDirection, scored, saved } = live;
    if (homeTurn) {
      shootout.homeTaken += 1;
      shootout.homeSeq.push(scored);
      if (scored) shootout.homePens += 1;
      shootout.last = `${state.homeTeam.short} ${scored ? "score" : saved ? "saved" : "miss"} ${shotDirection.toUpperCase()}`;
      shootout.turn = "away";
    } else {
      shootout.awayTaken += 1;
      shootout.awaySeq.push(scored);
      if (scored) shootout.awayPens += 1;
      shootout.last = `${state.awayTeam.short} ${scored ? "score" : saved ? "saved" : "miss"} ${shotDirection.toUpperCase()}`;
      shootout.turn = "home";
    }

    shootout.log.unshift(shootout.last);
    shootout.log = shootout.log.slice(0, 5);
    shootout.live = null;
    evaluatePenaltyShootout();
  }

  function randomPenaltyDirection() {
    return PENALTY_DIRECTIONS[Math.floor(Math.random() * PENALTY_DIRECTIONS.length)];
  }

  function evaluatePenaltyShootout() {
    const shootout = state.penaltyShootout;
    const homeRemaining = shootout.maxKicks - shootout.homeTaken;
    const awayRemaining = shootout.maxKicks - shootout.awayTaken;
    if (shootout.homePens > shootout.awayPens + awayRemaining) {
      completePenaltyShootout("home");
      return;
    }
    if (shootout.awayPens > shootout.homePens + homeRemaining) {
      completePenaltyShootout("away");
      return;
    }
    if (shootout.homeTaken >= shootout.maxKicks && shootout.awayTaken >= shootout.maxKicks) {
      if (shootout.homePens > shootout.awayPens) completePenaltyShootout("home");
      else if (shootout.awayPens > shootout.homePens) completePenaltyShootout("away");
      else {
        shootout.maxKicks += 1;
        shootout.last = "Sudden death";
        shootout.log.unshift("Sudden death");
        shootout.log = shootout.log.slice(0, 5);
      }
    }
  }

  function completePenaltyShootout(winnerSide) {
    const shootout = state.penaltyShootout;
    if (!shootout || shootout.complete) return;
    const winnerIndex = winnerSide === "home" ? shootout.homeIndex : shootout.awayIndex;
    shootout.complete = true;
    shootout.winnerIndex = winnerIndex;
    shootout.penaltyScore = `${shootout.homePens}-${shootout.awayPens}`;
    shootout.last = `${winnerSide === "home" ? state.homeTeam.short : state.awayTeam.short} win on PKs`;

    if (shootout.context === "worldCup") {
      applyWorldCupResult(true, winnerIndex, shootout.penaltyScore);
      state.currentWorldCupMatch = false;
      state.extraTime.active = false;
      saveProgress("world-cup-penalties");
    } else {
      applyCareerResult(true, winnerIndex, shootout.penaltyScore);
      state.currentCareerMatch = false;
      state.extraTime.active = false;
      state.lockedPlayerId = null;
      saveProgress("playoff-penalties");
    }
    state.message = shootout.last;
    state.messageTimer = 2.4;
    spawnBurst(FIELD.cx, FIELD.cy, ["#f5c75f", "#ffffff", "#8bdcd3"], 72);
  }

  function exitPenaltyShootout() {
    const context = state.penaltyShootout?.context;
    state.penaltyShootout = null;
    state.mode = context === "worldCup" ? "worldCupHub" : "careerHub";
    state.message = context === "worldCup" ? "World Cup result saved" : "Playoff result saved";
    state.messageTimer = 2;
  }

  function careerOpponentIndex() {
    const career = state.career;
    const leagueTeams = clubLeagueIndicesForTeam(career.teamIndex);
    const candidates = TEAMS.map((team, index) => ({ index, power: teamPower(team) }))
      .filter((entry) => entry.index !== career.teamIndex)
      .filter((entry) => leagueTeams.includes(entry.index))
      .sort((a, b) => b.power - a.power);
    if (career.type === "club") {
      if (career.season?.stage === "regular") return regularSeasonOpponentIndex(career);
      const match = currentPlayablePlayoffMatch(career);
      if (match) return match.homeTeam === career.teamIndex ? match.awayTeam : match.homeTeam;
      return candidates[0].index;
    }
    return candidates[(career.fixture + state.careerPlayerIndex) % candidates.length].index;
  }

  function hasPlayableClubMatch(career) {
    if (career.type !== "club") return true;
    if (career.season.stage === "regular") return career.fixture <= career.season.regularSeasonLength;
    if (career.season.stage === "playoff") return Boolean(currentPlayablePlayoffMatch(career));
    return false;
  }

  function regularSeasonOpponentIndex(career) {
    const round = career.season.schedule[Math.min(career.fixture - 1, career.season.schedule.length - 1)];
    const match = round.find((fixture) => fixture.home === career.teamIndex || fixture.away === career.teamIndex);
    return match.home === career.teamIndex ? match.away : match.home;
  }

  function currentPlayablePlayoffMatch(career) {
    const playoff = career.season.playoff;
    if (!playoff) return null;
    const matches = playoff.round === "final" ? [playoff.final] : playoff.matches;
    return matches.find(
      (match) =>
        match &&
        !match.played &&
        (match.homeTeam === career.teamIndex || match.awayTeam === career.teamIndex)
    );
  }

  function clubSeasonStatusText(career) {
    if (career.season.stage === "champion") return `${TEAMS[career.teamIndex].short} are ${career.season.leagueName} champions.`;
    if (career.season.stage === "eliminated") {
      const champion = career.season.championIndex != null ? TEAMS[career.season.championIndex].short : "TBD";
      return `Season complete. Champion: ${champion}.`;
    }
    return "No playable fixture is available.";
  }

  function upcomingCareerDifficultyIndex(career) {
    if (!career?.active) return state.difficulty;
    if (career.type === "club") {
      if (career.season?.stage === "playoff") return DIFFICULTIES.length;
      return clamp(state.difficulty + Math.floor((career.fixture - 1) / 3), 1, DIFFICULTIES.length);
    }
    if (career.type === "player") {
      return clamp(state.difficulty + Math.floor((career.fixture - 1) / 4), 1, DIFFICULTIES.length);
    }
    return state.difficulty;
  }

  function applyCareerResult(wentToExtraTime = false, forcedWinner = null, penaltyScore = "") {
    const career = state.career;
    const home = state.score.home;
    const away = state.score.away;
    const result = forcedWinner != null ? (forcedWinner === career.teamIndex ? "W" : "L") : home > away ? "W" : home < away ? "L" : "D";
    const scoreLabel = penaltyScore ? `${home}-${away} pens ${penaltyScore}` : `${home}-${away}`;
    if (result === "W") career.wins += 1;
    else if (result === "D") career.draws += 1;
    else career.losses += 1;

    if (career.type === "player") {
      const resultXp = result === "W" ? 42 : result === "D" ? 22 : 10;
      const xpGain =
        resultXp +
        state.matchStats.goals * 90 +
        state.matchStats.assists * 65 +
        state.matchStats.shots * 9 +
        state.matchStats.passes * 5 +
        state.matchStats.tackles * 12 +
        Math.min(34, state.matchStats.touches * 2);
      career.xp += xpGain;
      career.goals += state.matchStats.goals;
      career.assists += state.matchStats.assists;
      career.ratingBoost = Math.min(8, Math.floor(career.xp / 180));
      const overall = Math.min(100, career.baseRating + career.ratingBoost);
      career.lastSummary = `${result} ${scoreLabel}: +${xpGain} XP, ${state.matchStats.goals} G, ${state.matchStats.assists} A, OVR ${overall}`;
      career.history.unshift({
        fixture: career.fixture,
        opponent: state.awayTeam.short,
        result,
        score: scoreLabel,
        note: `XP +${xpGain}`,
      });
    } else {
      const prize = result === "W" ? 18 : result === "D" ? 8 : 3;
      const fanShift = result === "W" ? 5 : result === "D" ? 1 : -4;
      career.budget += prize + home * 2;
      career.reputation = clamp(career.reputation + fanShift + home - away, 20, 100);
      career.sharpness = clamp(career.sharpness + (result === "W" ? 1 : 0), 0, 7);
      career.goalsFor += home;
      career.goalsAgainst += away;
      career.lastSummary = `${result} ${scoreLabel}: budget +$${prize + home * 2}M, reputation ${career.reputation}`;
      career.history.unshift({
        fixture: career.fixture,
        opponent: state.awayTeam.short,
        result,
        score: scoreLabel,
        note: `$${career.budget}M budget`,
      });
      if (career.season.stage === "regular") {
        applyRegularSeasonRound(career, home, away);
      } else if (career.season.stage === "playoff") {
        applyPlayoffResult(career, home, away, wentToExtraTime, forcedWinner, penaltyScore);
      }
    }
    career.history = career.history.slice(0, 5);
    career.fixture += 1;
  }

  function applyRegularSeasonRound(career, homeGoals, awayGoals) {
    const opponentIndex = TEAMS.indexOf(state.awayTeam);
    applyTableResult(career, career.teamIndex, opponentIndex, homeGoals, awayGoals);
    simulateOtherRegularMatches(career);
    const seed = seedForTeam(career, career.teamIndex);
    career.lastSummary += `, seed #${seed}`;
    if (career.fixture >= career.season.regularSeasonLength) {
      seedPlayoff(career);
    }
  }

  function applyTableResult(career, teamA, teamB, goalsA, goalsB) {
    const rowA = career.season.standings.find((row) => row.teamIndex === teamA);
    const rowB = career.season.standings.find((row) => row.teamIndex === teamB);
    rowA.played += 1;
    rowB.played += 1;
    rowA.gf += goalsA;
    rowA.ga += goalsB;
    rowB.gf += goalsB;
    rowB.ga += goalsA;
    if (goalsA > goalsB) {
      rowA.wins += 1;
      rowB.losses += 1;
      rowA.points += 3;
    } else if (goalsB > goalsA) {
      rowB.wins += 1;
      rowA.losses += 1;
      rowB.points += 3;
    } else {
      rowA.draws += 1;
      rowB.draws += 1;
      rowA.points += 1;
      rowB.points += 1;
    }
    rowA.gd = rowA.gf - rowA.ga;
    rowB.gd = rowB.gf - rowB.ga;
    rankedStandings(career);
  }

  function simulateOtherRegularMatches(career) {
    const round = career.season.schedule[career.fixture - 1] || [];
    for (const match of round) {
      if (match.home === career.teamIndex || match.away === career.teamIndex) continue;
      const score = simulateScore(match.home, match.away);
      applyTableResult(career, match.home, match.away, score.home, score.away);
    }
  }

  function simulateScore(homeIndex, awayIndex) {
    const homePower = teamPower(TEAMS[homeIndex]);
    const awayPower = teamPower(TEAMS[awayIndex]);
    const tilt = (homePower - awayPower) / 22;
    const home = clamp(Math.floor(Math.random() * 3 + 0.9 + tilt), 0, 5);
    const away = clamp(Math.floor(Math.random() * 3 + 0.75 - tilt), 0, 5);
    return { home, away };
  }

  function seedPlayoff(career) {
    const advanceCount = playoffAdvanceCountForSeason(career.season);
    const playoffSeeds = rankedStandings(career).slice(0, advanceCount);
    career.season.seeds = playoffSeeds.map((row) => ({ seed: row.seed, teamIndex: row.teamIndex }));
    const qf1 = createPlayoffMatch("QF1", playoffSeeds[2], playoffSeeds[5]);
    const qf2 = createPlayoffMatch("QF2", playoffSeeds[3], playoffSeeds[4]);
    career.season.playoff = {
      round: "quarterfinal",
      byes: [playoffSeeds[0], playoffSeeds[1]],
      quarterfinals: [qf1, qf2],
      semifinals: null,
      matches: [qf1, qf2],
      final: null,
    };
    career.season.stage = "playoff";
    if (!playoffSeeds.some((row) => row.teamIndex === career.teamIndex)) {
      career.season.eliminated = true;
      completeAiPlayoffs(career);
      career.season.stage = "eliminated";
      const champion = TEAMS[career.season.championIndex].short;
      career.lastSummary = `Regular season complete: seed #${seedForTeam(career, career.teamIndex)}. Missed playoffs. Champion: ${champion}.`;
    } else {
      career.playoffAppearances += 1;
      const seed = seedForTeam(career, career.teamIndex);
      if (seed <= 2) {
        simulateQuarterfinalsAndCreateSemis(career);
        career.lastSummary = `Regular season complete: seed #${seed}. First-round bye earned.`;
      } else {
        career.lastSummary = `Regular season complete: qualified for the ${advanceCount}-team playoff as seed #${seed}.`;
      }
    }
  }

  function createPlayoffMatch(id, homeSeedRow, awaySeedRow) {
    return {
      id,
      homeTeam: homeSeedRow.teamIndex,
      awayTeam: awaySeedRow.teamIndex,
      homeSeed: homeSeedRow.seed,
      awaySeed: awaySeedRow.seed,
      played: false,
      score: "",
      winner: null,
      loser: null,
      shootout: false,
    };
  }

  function applyPlayoffResult(career, homeGoals, awayGoals, wentToExtraTime = false, forcedWinner = null, penaltyScore = "") {
    const match = currentPlayablePlayoffMatch(career);
    if (!match) return;
    const opponent = match.homeTeam === career.teamIndex ? match.awayTeam : match.homeTeam;
    const winner = forcedWinner ?? resolveKnockoutWinner(career.teamIndex, opponent, homeGoals, awayGoals);
    const userWon = winner === career.teamIndex;
    finishPlayoffMatch(
      match,
      career.teamIndex,
      opponent,
      homeGoals,
      awayGoals,
      winner,
      homeGoals === awayGoals,
      wentToExtraTime,
      penaltyScore
    );

    if (career.season.playoff.round === "quarterfinal") {
      for (const other of career.season.playoff.matches) {
        if (!other.played) simulatePlayoffMatch(other);
      }
      simulateQuarterfinalsAndCreateSemis(career);
      if (!userWon) {
        completeAiPlayoffs(career);
        career.season.stage = "eliminated";
        career.lastSummary = `Lost first round ${match.score}. Champion: ${TEAMS[career.season.championIndex].short}.`;
      } else {
        career.lastSummary = `Won first round ${match.score}. Semifinal next.`;
      }
      return;
    }

    if (career.season.playoff.round === "semifinal") {
      for (const other of career.season.playoff.matches) {
        if (!other.played) simulatePlayoffMatch(other);
      }
      const winners = career.season.playoff.matches.map((item) => item.winner);
      const [first, second] = winners.sort((a, b) => seedForTeam(career, a) - seedForTeam(career, b));
      career.season.playoff.final = createPlayoffMatch(
        "FINAL",
        rankedStandings(career).find((row) => row.teamIndex === first),
        rankedStandings(career).find((row) => row.teamIndex === second)
      );
      career.season.playoff.round = "final";
      if (!userWon) {
        simulatePlayoffMatch(career.season.playoff.final);
        career.season.championIndex = career.season.playoff.final.winner;
        career.season.stage = "eliminated";
        career.lastSummary = `Lost semifinal ${match.score}. Champion: ${TEAMS[career.season.championIndex].short}.`;
      } else {
        career.lastSummary = `Won semifinal ${match.score}. Final next.`;
      }
      return;
    }

    career.season.championIndex = match.winner;
    career.season.stage = userWon ? "champion" : "eliminated";
    if (userWon) {
      career.championships += 1;
      awardTrophy(
        career.season.league === "mls" ? "mls" : "ucl",
        TEAMS[career.teamIndex].name,
        `${career.season.leagueName} champions`,
        TEAMS[career.teamIndex].colors
      );
    }
    career.lastSummary = userWon
      ? `Won final ${match.score}. ${career.season.leagueName} champions.`
      : `Lost final ${match.score}. Champion: ${TEAMS[match.winner].short}.`;
  }

  function simulatePlayoffMatch(match) {
    const score = simulateScore(match.homeTeam, match.awayTeam);
    const winner = resolveKnockoutWinner(match.homeTeam, match.awayTeam, score.home, score.away);
    finishPlayoffMatch(match, match.homeTeam, match.awayTeam, score.home, score.away, winner, score.home === score.away);
  }

  function finishPlayoffMatch(match, teamA, teamB, goalsA, goalsB, winner, shootout, extraTime = false, penaltyScore = "") {
    match.played = true;
    match.score = `${goalsA}-${goalsB}${shootout ? ` pens${penaltyScore ? ` ${penaltyScore}` : ""}` : extraTime ? " ET" : ""}`;
    match.winner = winner;
    match.loser = winner === teamA ? teamB : teamA;
    match.shootout = shootout;
    match.extraTime = extraTime;
    match.penaltyScore = penaltyScore;
  }

  function resolveKnockoutWinner(teamA, teamB, goalsA, goalsB) {
    if (goalsA > goalsB) return teamA;
    if (goalsB > goalsA) return teamB;
    const aPower = teamPower(TEAMS[teamA]);
    const bPower = teamPower(TEAMS[teamB]);
    const chanceA = clamp(0.5 + (aPower - bPower) / 80, 0.28, 0.72);
    return Math.random() < chanceA ? teamA : teamB;
  }

  function seedRowForTeam(career, teamIndex) {
    return (
      career.season.seeds.find((row) => row.teamIndex === teamIndex) ||
      rankedStandings(career).find((row) => row.teamIndex === teamIndex)
    );
  }

  function simulateQuarterfinalsAndCreateSemis(career) {
    const playoff = career.season.playoff;
    for (const match of playoff.quarterfinals) {
      if (!match.played) simulatePlayoffMatch(match);
    }
    const [thirdVsSixth, fourthVsFifth] = playoff.quarterfinals;
    playoff.semifinals = [
      createPlayoffMatch("SF1", playoff.byes[0], seedRowForTeam(career, fourthVsFifth.winner)),
      createPlayoffMatch("SF2", playoff.byes[1], seedRowForTeam(career, thirdVsSixth.winner)),
    ];
    playoff.matches = playoff.semifinals;
    playoff.round = "semifinal";
  }

  function completeAiPlayoffs(career) {
    const playoff = career.season.playoff;
    if (!playoff) return;
    if (playoff.round === "quarterfinal") {
      simulateQuarterfinalsAndCreateSemis(career);
    }
    for (const match of playoff.matches) {
      if (!match.played) simulatePlayoffMatch(match);
    }
    const winners = playoff.matches.map((match) => match.winner);
    const [first, second] = winners.sort((a, b) => seedForTeam(career, a) - seedForTeam(career, b));
    playoff.final = createPlayoffMatch(
      "FINAL",
      rankedStandings(career).find((row) => row.teamIndex === first),
      rankedStandings(career).find((row) => row.teamIndex === second)
    );
    simulatePlayoffMatch(playoff.final);
    playoff.round = "complete";
    career.season.championIndex = playoff.final.winner;
  }

  function simulateClubKnockout(indices, pool) {
    let participants = indices.slice();
    const rounds = [];
    while (participants.length > 1) {
      const winners = [];
      const matches = [];
      for (let i = 0; i < participants.length; i += 2) {
        const home = participants[i];
        const away = participants[i + 1];
        const score = simulatePoolScore(pool, home, away);
        const winner = resolvePoolKnockoutWinner(pool, home, away, score.home, score.away);
        winners.push(winner);
        matches.push({
          home,
          away,
          score: `${score.home}-${score.away}${score.home === score.away ? " pens" : ""}`,
          winner,
        });
      }
      rounds.push(matches);
      participants = winners;
    }
    return { championIndex: participants[0], rounds };
  }

  function simulatePoolScore(pool, homeIndex, awayIndex) {
    const homePower = teamPower(pool[homeIndex]);
    const awayPower = teamPower(pool[awayIndex]);
    const tilt = (homePower - awayPower) / 24;
    const home = clamp(Math.floor(Math.random() * 3 + 0.9 + tilt), 0, 5);
    const away = clamp(Math.floor(Math.random() * 3 + 0.75 - tilt), 0, 5);
    return { home, away };
  }

  function resolvePoolKnockoutWinner(pool, teamA, teamB, goalsA, goalsB) {
    if (goalsA > goalsB) return teamA;
    if (goalsB > goalsA) return teamB;
    const aPower = teamPower(pool[teamA]);
    const bPower = teamPower(pool[teamB]);
    const chanceA = clamp(0.5 + (aPower - bPower) / 80, 0.28, 0.72);
    return Math.random() < chanceA ? teamA : teamB;
  }

  function simulateStandaloneWorldCup() {
    const cup = createWorldCup(0);
    completeWorldCupAi(cup);
    return { championIndex: cup.championIndex, rounds: cup.rounds };
  }

  function pickDistinctClubIndex(preferredIndex, candidates, takenNames) {
    if (!takenNames.has(TEAMS[preferredIndex].name)) return preferredIndex;
    return (
      candidates
        .slice()
        .sort((a, b) => teamPower(TEAMS[b]) - teamPower(TEAMS[a]))
        .find((index) => !takenNames.has(TEAMS[index].name)) ?? preferredIndex
    );
  }

  function teamSummary(team) {
    return {
      name: team.name,
      short: team.short,
      power: teamPower(team),
    };
  }

  function createGoatMashup(career) {
    const championsLeague = simulateClubKnockout(CHAMPIONS_LEAGUE_INDICES, TEAMS);
    const worldCup = simulateStandaloneWorldCup();
    const mlsCup = simulateClubKnockout(MLS_TEAM_INDICES, TEAMS);
    const taken = new Set([TEAMS[career.teamIndex].name]);
    const championsParticipant = pickDistinctClubIndex(championsLeague.championIndex, CHAMPIONS_LEAGUE_INDICES, taken);
    taken.add(TEAMS[championsParticipant].name);
    const mlsParticipant = pickDistinctClubIndex(mlsCup.championIndex, MLS_TEAM_INDICES, taken);

    const teams = [
      TEAMS[career.teamIndex],
      TEAMS[championsParticipant],
      WORLD_TEAMS[worldCup.championIndex],
      TEAMS[mlsParticipant],
    ];
    const entries = [
      { label: "Your Club", source: "Dynasty", team: teamSummary(teams[0]) },
      {
        label: championsParticipant === championsLeague.championIndex ? "Champions League Winner" : "Champions League Rep",
        source: "Champions League",
        team: teamSummary(teams[1]),
      },
      { label: "World Cup Winner", source: "World Cup", team: teamSummary(teams[2]) },
      {
        label: mlsParticipant === mlsCup.championIndex ? "MLS Winner" : "MLS Rep",
        source: "MLS",
        team: teamSummary(teams[3]),
      },
    ];
    const matches = [
      createGoatMatch("SF1", 0, 1),
      createGoatMatch("SF2", 2, 3),
    ];
    const mashup = {
      active: true,
      round: "semifinal",
      teams,
      entries,
      qualifiers: {
        championsLeague: teamSummary(TEAMS[championsLeague.championIndex]),
        worldCup: teamSummary(WORLD_TEAMS[worldCup.championIndex]),
        mls: teamSummary(TEAMS[mlsCup.championIndex]),
      },
      matches,
      final: null,
      championIndex: null,
      eliminated: false,
      lastSummary: "GOAT Mashup loaded: Champions League, World Cup, and MLS winners simulated.",
    };
    simulateGoatMatch(mashup, matches[1]);
    return mashup;
  }

  function createGoatMatch(id, homeTeam, awayTeam) {
    return {
      id,
      homeTeam,
      awayTeam,
      played: false,
      score: "",
      winner: null,
      loser: null,
      shootout: false,
      extraTime: false,
    };
  }

  function currentPlayableGoatMatch(career) {
    const mashup = career.goatMashup;
    if (!mashup || mashup.championIndex != null) return null;
    const matches = mashup.round === "final" ? [mashup.final] : mashup.matches;
    return matches.find((match) => match && !match.played && (match.homeTeam === 0 || match.awayTeam === 0)) || null;
  }

  function startNextGoatMashupMatch(career) {
    if (!career.goatMashup) {
      career.goatMashup = createGoatMashup(career);
      saveProgress("goat-created");
    }
    const match = currentPlayableGoatMatch(career);
    if (!match) {
      career.goatMashup.lastSummary = goatMashupStatusText(career.goatMashup);
      career.lastSummary = career.goatMashup.lastSummary;
      saveProgress("goat-status");
      return;
    }
    state.selectedTeam = career.teamIndex;
    const opponent = match.homeTeam === 0 ? match.awayTeam : match.homeTeam;
    startMatch(0, opponent, {
      goat: true,
      goatMatchId: match.id,
      teams: career.goatMashup.teams,
    });
  }

  function applyGoatMashupResult(wentToExtraTime = false) {
    const career = state.career;
    const mashup = career.goatMashup;
    const match = currentPlayableGoatMatch(career);
    if (!mashup || !match) return;
    const homeGoals = state.score.home;
    const awayGoals = state.score.away;
    const winner = resolveGoatWinner(mashup, match.homeTeam, match.awayTeam, homeGoals, awayGoals);
    finishGoatMatch(match, homeGoals, awayGoals, winner, homeGoals === awayGoals, wentToExtraTime);
    const userWon = winner === 0;

    if (mashup.round === "semifinal") {
      createGoatFinal(mashup);
      if (!userWon) {
        simulateGoatMatch(mashup, mashup.final);
        mashup.championIndex = mashup.final.winner;
        mashup.round = "complete";
        mashup.eliminated = true;
        mashup.lastSummary = `Lost GOAT semifinal ${match.score}. Champion: ${goatTeamLabel(mashup, mashup.championIndex)}.`;
        career.lastSummary = mashup.lastSummary;
      } else {
        mashup.lastSummary = `Won GOAT semifinal ${match.score}. Final next vs ${goatTeamLabel(mashup, mashup.final.awayTeam)}.`;
        career.lastSummary = mashup.lastSummary;
      }
      return;
    }

    mashup.championIndex = winner;
    mashup.round = "complete";
    mashup.eliminated = !userWon;
    if (userWon) {
      career.goatTitles = (career.goatTitles || 0) + 1;
      career.budget += 35;
      career.reputation = clamp(career.reputation + 7, 20, 100);
      awardTrophy("goat", TEAMS[career.teamIndex].name, "GOAT Mashup champion", TEAMS[career.teamIndex].colors);
      mashup.lastSummary = `Won the GOAT Mashup ${match.score}. Budget +$35M, reputation ${career.reputation}.`;
    } else {
      mashup.lastSummary = `Lost GOAT final ${match.score}. Champion: ${goatTeamLabel(mashup, winner)}.`;
    }
    career.lastSummary = mashup.lastSummary;
  }

  function createGoatFinal(mashup) {
    const winners = mashup.matches.map((match) => match.winner).filter((winner) => winner != null);
    if (winners.length < 2) return;
    const home = winners.includes(0) ? 0 : winners[0];
    const away = winners.find((winner) => winner !== home) ?? winners[1];
    mashup.final = createGoatMatch("FINAL", home, away);
    mashup.round = "final";
  }

  function simulateGoatMatch(mashup, match) {
    if (!match || match.played) return;
    const score = simulatePoolScore(mashup.teams, match.homeTeam, match.awayTeam);
    const winner = resolveGoatWinner(mashup, match.homeTeam, match.awayTeam, score.home, score.away);
    finishGoatMatch(match, score.home, score.away, winner, score.home === score.away);
  }

  function finishGoatMatch(match, homeGoals, awayGoals, winner, shootout, extraTime = false) {
    match.played = true;
    match.score = `${homeGoals}-${awayGoals}${shootout ? " pens" : extraTime ? " ET" : ""}`;
    match.winner = winner;
    match.loser = winner === match.homeTeam ? match.awayTeam : match.homeTeam;
    match.shootout = shootout;
    match.extraTime = extraTime;
  }

  function resolveGoatWinner(mashup, teamA, teamB, goalsA, goalsB) {
    if (goalsA > goalsB) return teamA;
    if (goalsB > goalsA) return teamB;
    const aPower = teamPower(mashup.teams[teamA]);
    const bPower = teamPower(mashup.teams[teamB]);
    const chanceA = clamp(0.5 + (aPower - bPower) / 75, 0.25, 0.75);
    return Math.random() < chanceA ? teamA : teamB;
  }

  function goatTeamLabel(mashup, index) {
    return mashup.teams[index]?.short || "TBD";
  }

  function goatMashupStatusText(mashup) {
    if (!mashup) return "GOAT Mashup not started.";
    if (mashup.championIndex != null) return `GOAT Mashup complete. Champion: ${goatTeamLabel(mashup, mashup.championIndex)}.`;
    const match = currentPlayableGoatMatch(state.career);
    return match ? `Next GOAT Mashup match: ${goatTeamLabel(mashup, 0)} vs ${goatTeamLabel(mashup, match.awayTeam)}.` : mashup.lastSummary;
  }

  function trainClub() {
    const career = state.career;
    if (!career.active || career.type !== "club") return;
    if (career.budget < 8 || career.sharpness >= 7) {
      career.lastSummary = career.sharpness >= 7 ? "Training is already maxed for this run." : "Not enough budget for elite training.";
      return;
    }
    career.budget -= 8;
    career.sharpness = clamp(career.sharpness + 1, 0, 7);
    career.reputation = clamp(career.reputation + 1, 20, 100);
    career.lastSummary = `Training block complete: sharpness +1, budget $${career.budget}M.`;
    saveProgress("training");
  }

  function applyTradeOffer() {
    const career = state.career;
    if (!career.active || career.type !== "club") return;
    acceptTradeOffer(career, activeTradeOffer(career));
  }

  function applySelectedTradeOffer() {
    const career = state.career;
    if (!career.active || career.type !== "club") return;
    const offer = tradeOfferForSelected(career);
    if (!offer) {
      offerTradeForSelected();
      career.lastSummary = "Trade offer created. Review it, then accept.";
      return;
    }
    acceptTradeOffer(career, offer);
  }

  function acceptTradeOffer(career, offer) {
    if (!offer) {
      career.lastSummary = "Choose a player and create a trade offer first.";
      return;
    }
    const outgoingIndex = career.roster.findIndex((player) => player.uid === offer.outgoingUid);
    if (outgoingIndex === -1) {
      career.tradeOffers = createTradeMarket(career);
      career.lastSummary = "Trade market refreshed.";
      return;
    }
    if (career.budget < offer.cost) {
      career.lastSummary = `Need $${offer.cost}M to complete that trade.`;
      return;
    }
    const outgoing = career.roster[outgoingIndex];
    const starterRole = career.lineup ? ROLE_ORDER.find((role) => career.lineup[role] === outgoing.uid) : null;
    career.roster.splice(outgoingIndex, 1, offer.incoming);
    if (starterRole) career.lineup[starterRole] = offer.incoming.uid;
    career.budget -= offer.cost;
    career.tradeCount += 1;
    state.selectedRosterUid = offer.incoming.uid;
    ensureCareerLineup(career);
    career.tradeOffers = createTradeMarket(career);
    career.lastSummary = `Trade complete: ${lastName(outgoing.name)} out, ${lastName(offer.incoming.name)} in.`;
    saveProgress("trade");
  }

  function offerTradeForSelected() {
    const career = state.career;
    if (!career.active || career.type !== "club") return;
    ensureCareerLineup(career);
    const selected = selectedRosterPlayer(career);
    if (!selected) return;
    const offer = createTradeOfferForPlayer(career, selected);
    career.tradeOffers = [offer].concat(
      (career.tradeOffers || []).filter((offer) => offer.outgoingUid !== selected.uid)
    );
    state.selectedRosterUid = selected.uid;
    career.lastSummary = `Offer ready: ${lastName(selected.name)} for ${lastName(offer.incoming.name)}.`;
    saveProgress("trade-offer");
  }

  function tradeOfferForSelected(career) {
    const selected = selectedRosterPlayer(career);
    if (!selected) return null;
    return (career.tradeOffers || []).find((offer) => offer.outgoingUid === selected.uid) || null;
  }

  function selectedRosterPlayer(career) {
    return (
      career.roster.find((player) => player.uid === state.selectedRosterUid) ||
      career.roster.find((player) => player.uid === career.lineup?.[state.selectedLineupRole]) ||
      career.roster[0]
    );
  }

  function draftProspect() {
    const career = state.career;
    if (!career.active || career.type !== "club") return;
    if (career.draftPicks <= 0) {
      career.lastSummary = "No draft picks left this year.";
      return;
    }
    const prospect = activeDraftProspect(career);
    career.roster.push(prospect);
    career.draftProspects = career.draftProspects.filter((player) => player.uid !== prospect.uid);
    career.draftPicks -= 1;
    state.selectedRosterUid = prospect.uid;
    ensureCareerLineup(career);
    career.lastSummary = `Drafted ${prospect.name}, ${prospect.role}, ${prospect.rating} OVR.`;
    saveProgress("draft");
  }

  function clubSeasonComplete(career) {
    return career.type === "club" && ["champion", "eliminated"].includes(career.season?.stage);
  }

  function goatMashupPlayable(career) {
    return career.type === "club" && clubSeasonComplete(career) && !career.goatMashup?.championIndex;
  }

  function primaryCareerAction(career) {
    if (career.type === "club" && clubSeasonComplete(career)) {
      if (goatMashupPlayable(career)) {
        startNextGoatMashupMatch(career);
        return;
      }
      startNextDynastyYear();
      return;
    }
    startNextCareerMatch();
  }

  function startNextDynastyYear() {
    const career = state.career;
    if (!career.active || career.type !== "club") return;
    if (!clubSeasonComplete(career)) {
      career.lastSummary = "Finish the season before starting a new year.";
      return;
    }
    developDynastyRoster(career);
    career.year += 1;
    career.fixture = 1;
    career.wins = 0;
    career.draws = 0;
    career.losses = 0;
    career.goalsFor = 0;
    career.goalsAgainst = 0;
    career.history = [];
    career.season = createClubSeason(career.teamIndex);
    career.goatMashup = null;
    career.budget += 24 + Math.floor(career.reputation / 8);
    career.sharpness = Math.max(0, career.sharpness - 1);
    career.draftPicks = 1;
    ensureCareerLineup(career);
    career.tradeOffers = createTradeMarket(career);
    career.draftProspects = createDraftBoard(career);
    career.lastSummary = `Year ${career.year} begins. Draft pick added and squad development applied.`;
    saveProgress("next-dynasty-year");
    state.score = { home: 0, away: 0 };
    state.timeLeft = state.matchLength;
    state.ball = createBall();
    state.homeTeam = TEAMS[career.teamIndex];
    state.opponentTeam = careerOpponentIndex();
    state.awayTeam = TEAMS[state.opponentTeam];
    state.homePlayers = [];
    state.awayPlayers = [];
    state.currentGoatMatch = false;
    state.currentGoatMatchId = null;
  }

  function developDynastyRoster(career) {
    for (const player of career.roster) {
      if (!player.drafted) continue;
      const growth = player.rating < player.potential ? 1 + Math.floor(Math.random() * 3) : 0;
      player.rating = clamp(player.rating + growth, 1, player.potential);
    }
  }

  function updatePlayers(dt) {
    const homeControlled = state.homePlayers[state.controlledIndex];
    for (const player of state.homePlayers) {
      if (player === homeControlled) updateControlledPlayer(player, dt);
      else updateSupportPlayer(player, dt);
    }
    for (const player of state.awayPlayers) updateOpponentPlayer(player, dt);
  }

  function updateControlledPlayer(player, dt) {
    const input = readMovementInput(player);
    const touchSprint = input.source === "touch" && input.mag > 0.72;
    const sprinting = (keys.has("shift") || touchSprint) && player.stamina > 0.08 && input.mag > 0.1;
    const ratingBoost = rating01(player.rating);
    const maxSpeed = lerp(165, 255, ratingBoost) * (sprinting ? 1.24 : 1);
    const accel = lerp(720, 1080, ratingBoost) * (sprinting ? 1.12 : 1);
    const drag = state.ball.owner === player ? 5.4 : 6.7;

    if (input.mag > 0.1) {
      player.vx += input.x * accel * dt;
      player.vy += input.y * accel * dt;
      player.facingX = input.x;
      player.facingY = input.y;
      if (sprinting) player.stamina = Math.max(0, player.stamina - dt * 0.34);
    } else {
      player.vx -= player.vx * drag * dt;
      player.vy -= player.vy * drag * dt;
      player.stamina = Math.min(1, player.stamina + dt * 0.18);
    }

    if (!sprinting) player.stamina = Math.min(1, player.stamina + dt * 0.12);
    limitVelocity(player, maxSpeed * (state.ball.owner === player ? 0.88 : 1));
    integratePlayer(player, dt);
  }

  function updateSupportPlayer(player, dt) {
    if (player.role === "GK") {
      updateGoalkeeper(player, dt);
      return;
    }

    const owner = state.ball.owner;
    const target = formationTarget(player);
    const nearestToLoose = nearestPlayerToBall("home", false);
    const shouldChase =
      !owner &&
      nearestToLoose === player &&
      dist(player, state.ball) < lerp(210, 330, teamPower(state.homeTeam) / 100);

    if (owner && owner.side === "away" && nearestPlayerToBall("home", false) === player) {
      target.x = state.ball.x - 12;
      target.y = state.ball.y;
    } else if (owner && owner.side === "home") {
      const lane = player.role === "ST" ? -55 : player.role === "WING" ? 65 : 0;
      target.x += 120;
      target.y += lane * Math.sin(state.crowdPulse * 1.5 + player.id);
    }

    if (shouldChase) {
      target.x = state.ball.x;
      target.y = state.ball.y;
    }

    moveToward(player, target, dt, 0.9);
  }

  function updateOpponentPlayer(player, dt) {
    if (player.role === "GK") {
      updateGoalkeeper(player, dt);
      return;
    }

    const owner = state.ball.owner;
    const target = formationTarget(player);
    const ratingBoost = rating01(player.rating);
    const difficulty = activeDifficulty();

    if (owner === player) {
      const goal = attackingGoal(player.side);
      const pressure = nearestOpponentDistance(player);
      if (player.cooldown <= 0 && (player.x < FIELD.x + FIELD.w * 0.28 || pressure < 50 * difficulty.aggression)) {
        if (Math.random() < clamp(0.54 * difficulty.decision, 0.25, 0.9)) passBall(player, false);
      }
      if (player.cooldown <= 0 && player.x < FIELD.x + FIELD.w * lerp(0.42, 0.58, ratingBoost) * difficulty.decision) {
        shootBall(player, false);
      }
      moveToward(player, {
        x: goal.x + 70,
        y: clamp(goal.y + Math.sin(state.crowdPulse * 2 + player.id) * 48, FIELD.y + 80, FIELD.y + FIELD.h - 80),
      }, dt, 1.05 * difficulty.aiSpeed);
      return;
    }

    if (!owner && nearestPlayerToBall("away", false) === player) {
      target.x = state.ball.x;
      target.y = state.ball.y;
    } else if (owner && owner.side === "home" && nearestPlayerToBall("away", false) === player) {
      target.x = state.ball.x + 16;
      target.y = state.ball.y;
      if (dist(player, owner) < 38 * difficulty.aggression && player.cooldown <= 0) {
        attemptAiTackle(player, owner);
      }
    } else if (owner && owner.side === "away") {
      target.x -= 110;
      target.y += (player.role === "WING" ? -58 : player.role === "ST" ? 22 : 0);
    }

    moveToward(player, target, dt, 0.95 * difficulty.aiSpeed);
  }

  function updateGoalkeeper(player, dt) {
    const sideDir = player.side === "home" ? 1 : -1;
    const lineX = player.side === "home" ? FIELD.x + 42 : FIELD.x + FIELD.w - 42;
    const targetY = clamp(state.ball.y, FIELD.goalTop + 22, FIELD.goalBottom - 22);
    let targetX = lineX;
    if (player.side === "home" && state.ball.x < FIELD.x + 200) targetX = clamp(state.ball.x - 20, FIELD.x + 28, FIELD.x + 110);
    if (player.side === "away" && state.ball.x > FIELD.x + FIELD.w - 200) targetX = clamp(state.ball.x + 20, FIELD.x + FIELD.w - 110, FIELD.x + FIELD.w - 28);

    if (state.ball.owner === player) {
      const teammate = bestPassTarget(player);
      player.facingX = sideDir;
      player.facingY = 0;
      if (player.cooldown <= 0 || dist(player, teammate) > 180) passBall(player, false);
    } else {
      moveToward(player, { x: targetX, y: targetY }, dt, player.side === "away" ? 0.8 * activeDifficulty().aiSpeed : 0.8);
    }
  }

  function readMovementInput(player) {
    const touch = readTouchMovementInput(player);
    if (touch.mag > 0.05) return touch;
    let x = 0;
    let y = 0;
    if (keys.has("left") || keys.has("a")) x -= 1;
    if (keys.has("right") || keys.has("d")) x += 1;
    if (keys.has("up") || keys.has("w")) y -= 1;
    if (keys.has("down") || keys.has("s")) y += 1;
    const mag = Math.hypot(x, y);
    if (mag > 0) {
      x /= mag;
      y /= mag;
    }
    return { x, y, mag, source: "keyboard" };
  }

  function readTouchMovementInput(player) {
    if (!touchInput.active || state.mode !== "play" || !player) return { x: 0, y: 0, mag: 0, source: "touch" };
    const dx = clamp(touchInput.x, FIELD.x + 24, FIELD.x + FIELD.w - 24) - player.x;
    const dy = clamp(touchInput.y, FIELD.y + 24, FIELD.y + FIELD.h - 24) - player.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 10) return { x: 0, y: 0, mag: 0, source: "touch" };
    return {
      x: dx / distance,
      y: dy / distance,
      mag: clamp(distance / 112, 0, 1),
      source: "touch",
    };
  }

  function formationTarget(player) {
    const ballShift = clamp((state.ball.x - FIELD.cx) / (FIELD.w / 2), -1, 1);
    const sideDir = player.side === "home" ? 1 : -1;
    const possession = state.ball.owner ? state.ball.owner.side : null;
    const hasBall = possession === player.side;
    const shift = sideDir * ballShift * (hasBall ? 120 : 80);
    const compact = hasBall ? 1 : 0.74;
    const yPull = (state.ball.y - FIELD.cy) * (player.role === "GK" ? 0 : 0.14);
    return {
      x: clamp(player.baseX + shift, FIELD.x + 35, FIELD.x + FIELD.w - 35),
      y: clamp(FIELD.cy + (player.baseY - FIELD.cy) * compact + yPull, FIELD.y + 40, FIELD.y + FIELD.h - 40),
    };
  }

  function moveToward(player, target, dt, intensity = 1) {
    const dx = target.x - player.x;
    const dy = target.y - player.y;
    const distance = Math.hypot(dx, dy);
    const ratingBoost = rating01(player.rating);
    const accel = lerp(480, 850, ratingBoost) * intensity;
    const speed = lerp(140, 230, ratingBoost) * intensity;
    if (distance > 4) {
      const nx = dx / distance;
      const ny = dy / distance;
      player.vx += nx * accel * dt;
      player.vy += ny * accel * dt;
      player.facingX = nx;
      player.facingY = ny;
    } else {
      player.vx -= player.vx * 7 * dt;
      player.vy -= player.vy * 7 * dt;
    }
    player.stamina = Math.min(1, player.stamina + dt * 0.1);
    limitVelocity(player, speed * (state.ball.owner === player ? 0.86 : 1));
    integratePlayer(player, dt);
  }

  function limitVelocity(player, maxSpeed) {
    const speed = Math.hypot(player.vx, player.vy);
    if (speed > maxSpeed) {
      player.vx = (player.vx / speed) * maxSpeed;
      player.vy = (player.vy / speed) * maxSpeed;
    }
  }

  function integratePlayer(player, dt) {
    player.x += player.vx * dt;
    player.y += player.vy * dt;
    player.vx *= Math.max(0, 1 - dt * 2.6);
    player.vy *= Math.max(0, 1 - dt * 2.6);

    const margin = player.role === "GK" ? 12 : 18;
    player.x = clamp(player.x, FIELD.x + margin, FIELD.x + FIELD.w - margin);
    player.y = clamp(player.y, FIELD.y + margin, FIELD.y + FIELD.h - margin);
  }

  function updateBall(dt) {
    const ball = state.ball;
    if (ball.owner) {
      const owner = ball.owner;
      const speed = Math.hypot(owner.vx, owner.vy);
      if (speed > 18) {
        owner.facingX = owner.vx / speed;
        owner.facingY = owner.vy / speed;
      }
      const offset = owner.r + ball.r + 4;
      ball.x = owner.x + owner.facingX * offset;
      ball.y = owner.y + owner.facingY * offset;
      ball.vx = owner.vx;
      ball.vy = owner.vy;
      pushTrail(ball.x, ball.y);
      return;
    }

    ball.looseTimer = Math.max(0, ball.looseTimer - dt);
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;
    ball.vx *= Math.max(0, 1 - dt * 0.9);
    ball.vy *= Math.max(0, 1 - dt * 0.9);
    ball.spin *= Math.max(0, 1 - dt * 1.8);

    if (ball.y < FIELD.y + ball.r) {
      ball.y = FIELD.y + ball.r;
      ball.vy = Math.abs(ball.vy) * 0.72;
      spawnBurst(ball.x, ball.y, ["#f7fbff", "#8bdcd3"], 5);
    }
    if (ball.y > FIELD.y + FIELD.h - ball.r) {
      ball.y = FIELD.y + FIELD.h - ball.r;
      ball.vy = -Math.abs(ball.vy) * 0.72;
      spawnBurst(ball.x, ball.y, ["#f7fbff", "#8bdcd3"], 5);
    }

    const inGoalMouth = ball.y > FIELD.goalTop && ball.y < FIELD.goalBottom;
    if (!inGoalMouth) {
      if (ball.x < FIELD.x + ball.r) {
        ball.x = FIELD.x + ball.r;
        ball.vx = Math.abs(ball.vx) * 0.76;
      }
      if (ball.x > FIELD.x + FIELD.w - ball.r) {
        ball.x = FIELD.x + FIELD.w - ball.r;
        ball.vx = -Math.abs(ball.vx) * 0.76;
      }
    }
    pushTrail(ball.x, ball.y);
  }

  function pushTrail(x, y) {
    state.trail.push({ x, y, life: 0.25 });
    if (state.trail.length > 12) state.trail.shift();
    for (const dot of state.trail) dot.life -= 0.016;
    state.trail = state.trail.filter((dot) => dot.life > 0);
  }

  function handleBallClaims() {
    if (state.ball.owner || state.mode !== "play") return;
    let best = null;
    for (const player of allPlayers()) {
      if (state.ball.looseTimer > 0 && state.ball.lastTouch && state.ball.lastTouch.id === player.id) continue;
      const catchRadius = player.r + state.ball.r + lerp(4, 16, rating01(player.rating));
      const d = dist(player, state.ball);
      const targetBonus = state.ball.targetId === player.id ? 22 : 0;
      if (d < catchRadius + targetBonus) {
        const score = d - player.rating * 0.08 - targetBonus;
        if (!best || score < best.score) best = { player, score };
      }
    }
    if (best) {
      setBallOwner(best.player);
      spawnBurst(state.ball.x, state.ball.y, [best.player.team.colors[0], best.player.team.colors[2], "#ffffff"], 7);
    }
  }

  function handleGoalkeeperClaims() {
    if (state.ball.owner || state.mode !== "play") return;
    for (const keeper of [state.homePlayers[0], state.awayPlayers[0]]) {
      const nearOwnGoal =
        (keeper.side === "home" && state.ball.x < FIELD.x + 140) ||
        (keeper.side === "away" && state.ball.x > FIELD.x + FIELD.w - 140);
      if (nearOwnGoal && dist(keeper, state.ball) < lerp(38, 58, rating01(keeper.rating))) {
        setBallOwner(keeper);
        keeper.cooldown = 0.45;
        spawnBurst(state.ball.x, state.ball.y, [keeper.team.colors[0], "#ffffff"], 9);
      }
    }
  }

  function resolvePlayerCollisions() {
    const players = allPlayers();
    for (let i = 0; i < players.length; i += 1) {
      for (let j = i + 1; j < players.length; j += 1) {
        const a = players[i];
        const b = players[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distance = Math.hypot(dx, dy) || 1;
        const minDistance = a.r + b.r + 2;
        if (distance < minDistance) {
          const overlap = (minDistance - distance) * 0.5;
          const nx = dx / distance;
          const ny = dy / distance;
          a.x -= nx * overlap;
          a.y -= ny * overlap;
          b.x += nx * overlap;
          b.y += ny * overlap;
          const bump = 0.18;
          a.vx -= nx * overlap * bump;
          a.vy -= ny * overlap * bump;
          b.vx += nx * overlap * bump;
          b.vy += ny * overlap * bump;
        }
      }
    }
  }

  function passBall(player, userDriven) {
    const target = bestPassTarget(player);
    if (!target) return;
    const dx = target.x - player.x;
    const dy = target.y - player.y;
    const distance = Math.hypot(dx, dy) || 1;
    const difficulty = player.side === "away" ? activeDifficulty() : DIFFICULTIES[1];
    const accuracy = lerp(0.2, 0.05, rating01(player.rating)) * difficulty.passError;
    const lead = userDriven ? 0.22 : 0.34;
    const targetX = target.x + target.vx * lead + (Math.random() - 0.5) * distance * accuracy;
    const targetY = target.y + target.vy * lead + (Math.random() - 0.5) * distance * accuracy;
    const ndx = targetX - player.x;
    const ndy = targetY - player.y;
    const nd = Math.hypot(ndx, ndy) || 1;
    const speed = clamp(distance * 2.8, 360, 620) + player.rating * 1.7;
    player.facingX = ndx / nd;
    player.facingY = ndy / nd;
    releaseBall(player, (ndx / nd) * speed, (ndy / nd) * speed, target.id);
    player.cooldown = 0.22;
    if (state.currentCareerMatch && state.career.type === "player" && player.name === state.career.playerName) {
      state.matchStats.passes += 1;
      state.potentialAssist = {
        passerName: player.name,
        side: player.side,
        time: 5,
      };
    }
    state.message = `${lastName(player.name)} to ${lastName(target.name)}`;
    state.messageTimer = 1.1;
    spawnBurst(player.x, player.y, [player.team.colors[0], player.team.colors[2], "#ffffff"], 6);
  }

  function bestPassTarget(player) {
    const teammates = player.side === "home" ? state.homePlayers : state.awayPlayers;
    const opponents = player.side === "home" ? state.awayPlayers : state.homePlayers;
    const attackDir = player.side === "home" ? 1 : -1;
    const candidates = teammates.filter((teammate) => teammate !== player);
    let best = candidates[0];
    let bestScore = -Infinity;
    for (const teammate of candidates) {
      const d = dist(player, teammate);
      const forward = (teammate.x - player.x) * attackDir;
      const pressure = Math.min(...opponents.map((opp) => dist(teammate, opp)));
      const roleBonus = teammate.role === "ST" ? 45 : teammate.role === "WING" ? 26 : 0;
      const score = pressure + forward * 0.42 + teammate.rating * 1.1 + roleBonus - d * 0.14;
      if (score > bestScore) {
        bestScore = score;
        best = teammate;
      }
    }
    return best;
  }

  function shootBall(player, userDriven) {
    const goal = attackingGoal(player.side);
    const distanceToGoal = Math.hypot(goal.x - player.x, goal.y - player.y);
    const ratingBoost = rating01(player.rating);
    const aimFromPointer = userDriven && pointer.x > FIELD.x && pointer.x < FIELD.x + FIELD.w;
    const goalTop = FIELD.goalTop + 18;
    const goalBottom = FIELD.goalBottom - 18;
    let targetY = aimFromPointer
      ? clamp(pointer.y, goalTop, goalBottom)
      : goal.y + Math.sin(state.crowdPulse * 1.7 + player.id) * lerp(28, 8, ratingBoost);
    const pressure = nearestOpponentDistance(player);
    const pressureError = clamp(70 - pressure, 0, 70) * lerp(0.8, 0.25, ratingBoost);
    targetY += (Math.random() - 0.5) * (lerp(90, 18, ratingBoost) + pressureError);
    targetY = clamp(targetY, goalTop - 18, goalBottom + 18);
    const dx = goal.x - player.x;
    const dy = targetY - player.y;
    const d = Math.hypot(dx, dy) || 1;
    let power = lerp(550, 820, ratingBoost) + clamp(360 - distanceToGoal, 0, 200);
    if (!userDriven && player.side === "away") power *= activeDifficulty().shotPower;
    player.facingX = dx / d;
    player.facingY = dy / d;
    releaseBall(player, (dx / d) * power, (dy / d) * power);
    player.cooldown = 0.45;
    if (state.currentCareerMatch && state.career.type === "player" && player.name === state.career.playerName) {
      state.matchStats.shots += 1;
    }
    state.cameraShake = 1.4;
    state.message = `${lastName(player.name)} shoots`;
    state.messageTimer = 1.2;
    spawnBurst(player.x + player.facingX * 20, player.y + player.facingY * 20, ["#ffffff", player.team.colors[0], "#f5c75f"], 12);
  }

  function attemptUserTackle(player) {
    const opponentOwner = state.ball.owner && state.ball.owner.side === "away" ? state.ball.owner : null;
    if (!opponentOwner || player.cooldown > 0) {
      const toward = {
        x: state.ball.x - player.x,
        y: state.ball.y - player.y,
      };
      const d = Math.hypot(toward.x, toward.y) || 1;
      player.vx += (toward.x / d) * 150;
      player.vy += (toward.y / d) * 150;
      player.cooldown = 0.32;
      player.tackleTimer = 0.18;
      return;
    }
    const d = dist(player, opponentOwner);
    if (d > 54) return;
    const chance = clamp(0.5 + (player.rating - opponentOwner.rating) / 140 + (54 - d) / 90, 0.18, 0.86);
    player.cooldown = 0.38;
    player.tackleTimer = 0.2;
    if (Math.random() < chance) {
      setBallOwner(player);
      if (state.currentCareerMatch && state.career.type === "player" && player.name === state.career.playerName) {
        state.matchStats.tackles += 1;
      }
      state.message = `${lastName(player.name)} wins it`;
      state.messageTimer = 1.1;
      spawnBurst(player.x, player.y, [player.team.colors[0], "#ffffff", "#8bdcd3"], 12);
    } else {
      opponentOwner.vx += opponentOwner.facingX * 70;
      opponentOwner.vy += opponentOwner.facingY * 70;
      state.message = `${lastName(opponentOwner.name)} rides it`;
      state.messageTimer = 0.9;
    }
  }

  function attemptAiTackle(player, owner) {
    const d = dist(player, owner);
    const difficulty = player.side === "away" ? activeDifficulty() : DIFFICULTIES[1];
    const chance = clamp(0.32 + (player.rating - owner.rating) / 180 + (40 - d) / 130 + difficulty.tackleBonus, 0.08, 0.82);
    player.cooldown = 0.62;
    player.tackleTimer = 0.16;
    if (Math.random() < chance) {
      setBallOwner(player);
      state.message = `${lastName(player.name)} intercepts`;
      state.messageTimer = 1;
      spawnBurst(player.x, player.y, [player.team.colors[0], "#ffffff"], 9);
    }
  }

  function nearestOpponentDistance(player) {
    const opponents = player.side === "home" ? state.awayPlayers : state.homePlayers;
    return Math.min(...opponents.map((opponent) => dist(player, opponent)));
  }

  function nearestPlayerToBall(side, includeKeeper) {
    const players = side === "home" ? state.homePlayers : state.awayPlayers;
    return players
      .filter((player) => includeKeeper || player.role !== "GK")
      .reduce((best, player) => (dist(player, state.ball) < dist(best, state.ball) ? player : best));
  }

  function attackingGoal(side) {
    return side === "home"
      ? { x: FIELD.x + FIELD.w + FIELD.goalDepth + 8, y: FIELD.cy }
      : { x: FIELD.x - FIELD.goalDepth - 8, y: FIELD.cy };
  }

  function checkGoals() {
    const ball = state.ball;
    const inGoalMouth = ball.y > FIELD.goalTop && ball.y < FIELD.goalBottom;
    if (!inGoalMouth) return;

    if (ball.x > FIELD.x + FIELD.w + FIELD.goalDepth * 0.72) {
      scoreGoal("home");
    } else if (ball.x < FIELD.x - FIELD.goalDepth * 0.72) {
      scoreGoal("away");
    }
  }

  function scoreGoal(side) {
    state.score[side] += 1;
    state.lastScorer = side;
    const scorer = state.ball.lastTouch && state.ball.lastTouch.side === side ? state.ball.lastTouch : null;
    state.lastScorerName = scorer ? scorer.name : side === "home" ? state.homeTeam.name : state.awayTeam.name;
    if (state.currentCareerMatch && state.career.type === "player" && scorer && scorer.name === state.career.playerName) {
      state.matchStats.goals += 1;
    }
    if (
      state.currentCareerMatch &&
      state.career.type === "player" &&
      scorer &&
      state.potentialAssist &&
      state.potentialAssist.side === side &&
      state.potentialAssist.passerName === state.career.playerName &&
      state.potentialAssist.passerName !== scorer.name
    ) {
      state.matchStats.assists += 1;
    }
    state.potentialAssist = null;
    state.message = `GOAL ${side === "home" ? state.homeTeam.short : state.awayTeam.short}`;
    state.messageTimer = 2.2;
    state.goalFreeze = 2.1;
    state.mode = "goal";
    state.ball.owner = null;
    state.ball.vx *= 0.25;
    state.ball.vy *= 0.25;
    state.cameraShake = 3;
    spawnGoalBurst(side);
  }

  function spawnGoalBurst(side) {
    const team = side === "home" ? state.homeTeam : state.awayTeam;
    const x = side === "home" ? FIELD.x + FIELD.w + FIELD.goalDepth : FIELD.x - FIELD.goalDepth;
    for (let i = 0; i < 90; i += 1) {
      const speed = 90 + Math.random() * 390;
      const angle = (side === "home" ? Math.PI : 0) + (Math.random() - 0.5) * 2.2;
      state.particles.push({
        x,
        y: FIELD.goalTop + Math.random() * FIELD.goalW,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 80,
        life: 0.8 + Math.random() * 0.8,
        size: 2 + Math.random() * 4,
        color: [team.colors[0], team.colors[1], team.colors[2], "#ffffff", "#f5c75f"][Math.floor(Math.random() * 5)],
      });
    }
  }

  function setupKickoff(possessionSide) {
    resetPositions();
    state.ball = createBall();
    const teamPlayers = possessionSide === "home" ? state.homePlayers : state.awayPlayers;
    const striker = teamPlayers.find((player) => player.role === "ST") || teamPlayers[teamPlayers.length - 1];
    striker.x = FIELD.cx + (possessionSide === "home" ? -38 : 38);
    striker.y = FIELD.cy;
    setBallOwner(striker);
    state.message = `${possessionSide === "home" ? state.homeTeam.short : state.awayTeam.short} kickoff`;
    state.messageTimer = 1.4;
  }

  function finishMatch() {
    if (shouldStartExtraTime()) {
      startExtraTime();
      return;
    }
    if (shouldStartPenaltyShootout()) {
      startPenaltyShootout();
      return;
    }
    const wentToExtraTime = state.extraTime.used;
    if (state.currentWorldCupMatch && state.worldCup.active) {
      applyWorldCupResult(wentToExtraTime);
      state.currentWorldCupMatch = false;
      state.extraTime.active = false;
      state.mode = "worldCupHub";
      state.message = "World Cup result saved";
      state.messageTimer = 2;
      saveProgress("world-cup-result");
      spawnBurst(FIELD.cx, FIELD.cy, ["#f5c75f", "#ffffff", "#8bdcd3"], 70);
      return;
    }
    if (state.currentGoatMatch && state.career.active && state.career.type === "club") {
      applyGoatMashupResult(wentToExtraTime);
      state.currentGoatMatch = false;
      state.currentGoatMatchId = null;
      state.extraTime.active = false;
      state.lockedPlayerId = null;
      state.mode = "careerHub";
      state.message = "GOAT Mashup result saved";
      state.messageTimer = 2;
      saveProgress("goat-result");
      spawnBurst(FIELD.cx, FIELD.cy, ["#f5c75f", "#ffffff", "#8bdcd3"], 70);
      return;
    }
    if (state.currentCareerMatch && state.career.active) {
      applyCareerResult(wentToExtraTime);
      state.currentCareerMatch = false;
      state.extraTime.active = false;
      state.lockedPlayerId = null;
      state.mode = "careerHub";
      state.message = "Career result saved";
      state.messageTimer = 2;
      saveProgress("career-result");
      spawnBurst(FIELD.cx, FIELD.cy, ["#f5c75f", "#ffffff", "#8bdcd3"], 70);
      return;
    }
    state.mode = "ended";
    if (state.score.home > state.score.away) {
      state.winnerText = `${state.homeTeam.name} win`;
    } else if (state.score.away > state.score.home) {
      state.winnerText = `${state.awayTeam.name} win`;
    } else {
      state.winnerText = "Draw under the lights";
    }
    state.message = "Full time";
    state.messageTimer = 3;
    spawnBurst(FIELD.cx, FIELD.cy, ["#f5c75f", "#ffffff", "#8bdcd3"], 80);
  }

  function spawnBurst(x, y, colors, count) {
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 180;
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.25 + Math.random() * 0.55,
        size: 1.5 + Math.random() * 3.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }

  function updateParticles(dt) {
    for (const particle of state.particles) {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vx *= Math.max(0, 1 - dt * 1.4);
      particle.vy += 150 * dt;
      particle.life -= dt;
    }
    state.particles = state.particles.filter((particle) => particle.life > 0);
  }

  function draw() {
    hitboxes = [];
    ctx.save();
    ctx.clearRect(0, 0, VIEW.w, VIEW.h);
    const shake = state.cameraShake > 0 ? state.cameraShake : 0;
    if (shake) {
      ctx.translate((Math.random() - 0.5) * shake * 3, (Math.random() - 0.5) * shake * 3);
    }

    if (state.mode === "menu") drawMenu();
    else if (state.mode === "careerHub") drawCareerHub();
    else if (state.mode === "worldCupHub") drawWorldCupHub();
    else if (state.mode === "trophyRoom") drawTrophyRoom();
    else if (state.mode === "penalties") drawPenaltyShootout();
    else {
      drawStadium();
      drawPitch();
      drawBallTrail();
      drawPlayers();
      drawBall();
      drawParticles();
      drawScoreboard();
      drawMessage();
      drawTouchPlayHints();
      if (state.mode === "paused") drawPauseOverlay();
      if (state.mode === "ended") drawEndOverlay();
    }
    ctx.restore();
    state.lastText = renderGameToText();
  }

  function drawMenu() {
    drawMenuBackground();
    const teams = menuTeamPool();
    const selected = teams[menuSelectedIndex()];
    const opponent = teams[menuOpponentIndex()];

    ctx.save();
    ctx.fillStyle = "#f7fbff";
    ctx.font = "800 54px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("JPLP. Soccer", 66, 82);
    ctx.font = "600 16px Inter, system-ui, sans-serif";
    ctx.fillStyle = "rgba(247,251,255,0.72)";
    const subtitle = state.menuMode === "world"
      ? "Sixteen national teams, single-elimination pressure, and locked World Cup squads."
      : "Five-a-side browser football with real clubs, real stars, and rating-driven play.";
    ctx.fillText(subtitle, 70, 112);

    drawModeTabs();
    drawTeamCards();
    if (state.menuMode === "player") {
      drawPlayerCareerPanel(selected, opponent);
    } else if (state.menuMode === "club") {
      drawClubCareerPanel(selected, opponent);
    } else if (state.menuMode === "world") {
      drawSelectedTeamPanel(selected, opponent);
      drawWorldCupStartPanel(selected, opponent);
    } else {
      drawSelectedTeamPanel(selected, opponent);
      drawStartPanel(selected, opponent);
    }
    drawControlsStrip();
    ctx.restore();
    drawParticles();
  }

  function drawCareerHub() {
    drawMenuBackground();
    const career = state.career;
    const team = TEAMS[career.teamIndex];
    const nextOpponent = TEAMS[careerOpponentIndex()];
    if (career.type === "club") ensureCareerLineup(career);
    ctx.save();
    ctx.fillStyle = "#f7fbff";
    ctx.font = "900 50px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(career.type === "player" ? "Player Career Hub" : "Club Career Hub", 66, 82);
    ctx.font = "700 15px Inter, system-ui, sans-serif";
    ctx.fillStyle = "rgba(247,251,255,0.7)";
    ctx.fillText(`${team.name}  |  ${career.type === "club" ? clubStageLabel(career) : `Fixture ${career.fixture}`}`, 70, 112);

    drawGlassPanel(68, 150, 548, 466);
    drawCrest(100, 184, 92, 112, team, 1);
    ctx.textAlign = "left";
    ctx.fillStyle = "#f7fbff";
    ctx.font = "900 32px Inter, system-ui, sans-serif";
    ctx.fillText(team.name, 224, 202);
    ctx.fillStyle = "rgba(247,251,255,0.68)";
    ctx.font = "800 14px Inter, system-ui, sans-serif";
    const subline =
      career.type === "club"
        ? `${clubStageLabel(career)}  |  Record ${career.wins}-${career.draws}-${career.losses}`
        : `Record ${career.wins}-${career.draws}-${career.losses}`;
    ctx.fillText(subline, 226, 230);
    if (career.type === "club") drawClubLeaderboard(98, 328, 470, career);
    else drawCareerHistory(98, 330, 470, career.history);

    drawGlassPanel(664, 150, 548, 466);
    if (career.type === "player") drawPlayerCareerHub(career, team, nextOpponent);
    else if (state.careerHubView === "roster") drawClubTeamRoster(career, team);
    else drawClubCareerHub(career, team, nextOpponent);

    drawButton(68, 642, 180, 46, "Main Menu", () => {
      state.mode = "menu";
      state.menuMode = career.type === "club" ? "club" : "player";
    }, false);
    drawButton(1010, 642, 202, 46, careerActionLabel(career), () => primaryCareerAction(career), true);
    ctx.restore();
    drawParticles();
  }

  function drawWorldCupHub() {
    drawMenuBackground();
    const cup = state.worldCup;
    const team = WORLD_TEAMS[cup.teamIndex];
    const match = currentWorldCupMatch();
    const opponent = match ? WORLD_TEAMS[match.homeTeam === cup.teamIndex ? match.awayTeam : match.homeTeam] : null;
    ctx.save();
    ctx.fillStyle = "#f7fbff";
    ctx.font = "900 50px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("World Cup", 66, 82);
    ctx.font = "700 15px Inter, system-ui, sans-serif";
    ctx.fillStyle = "rgba(247,251,255,0.7)";
    ctx.fillText(`${team.name}  |  ${worldCupStageLabel(cup)}`, 70, 112);

    drawGlassPanel(68, 150, 548, 466);
    drawWorldCupBracket(98, 202, 470, cup);

    drawGlassPanel(664, 150, 548, 466);
    drawCrest(704, 184, 108, 130, team, 1);
    ctx.fillStyle = "#f7fbff";
    ctx.font = "900 30px Inter, system-ui, sans-serif";
    ctx.fillText(team.name, 848, 194);
    ctx.fillStyle = "rgba(247,251,255,0.68)";
    ctx.font = "800 14px Inter, system-ui, sans-serif";
    ctx.fillText(opponent ? `Next ${opponent.short}  |  Knockout match` : worldCupStageLabel(cup), 850, 222);
    drawClubMetric(704, 342, 132, "Power", String(teamPower(team)), "#f5c75f");
    drawClubMetric(858, 342, 132, "Round", worldCupRoundShort(cup), "#8bdcd3");
    drawClubMetric(1012, 342, 132, "Trades", "OFF", team.colors[2]);
    ctx.fillStyle = "rgba(247,251,255,0.74)";
    ctx.font = "800 13px Inter, system-ui, sans-serif";
    wrapText(cup.lastSummary, 850, 258, 294, 18, 3);
    drawFieldCreatorButton(704, 402, 460, 30, team);
    drawWorldCupSquad(704, 452, 460, team);

    drawButton(68, 642, 180, 46, "Main Menu", () => {
      state.mode = "menu";
      state.menuMode = "world";
    }, false);
    drawButton(1010, 642, 202, 46, worldCupActionLabel(cup), () => startNextWorldCupMatch(), !cup.eliminated && cup.championIndex == null);
    ctx.restore();
    drawParticles();
  }

  function updateTrophyRoom() {
    if (justPressed.has("escape") || justPressed.has("enter") || justPressed.has("space")) {
      state.mode = "menu";
    }
  }

  function drawTrophyRoom() {
    drawMenuBackground();
    const counts = state.trophies.reduce((acc, trophy) => {
      acc[trophy.type] = (acc[trophy.type] || 0) + 1;
      return acc;
    }, {});
    ctx.save();
    ctx.fillStyle = "#f7fbff";
    ctx.font = "900 50px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Trophy Room", 66, 82);
    ctx.font = "700 15px Inter, system-ui, sans-serif";
    ctx.fillStyle = "rgba(247,251,255,0.7)";
    ctx.fillText("Your World Cup, MLS, UCL, and GOAT Mashup trophies live here.", 70, 112);

    drawGlassPanel(68, 150, 342, 466);
    ctx.fillStyle = "#f5c75f";
    ctx.font = "900 14px Inter, system-ui, sans-serif";
    ctx.fillText("CABINET", 100, 190);
    drawTrophySummaryRow(100, 232, "World Cup", counts.worldCup || 0, trophyTemplate("worldCup"));
    drawTrophySummaryRow(100, 292, "MLS Cup", counts.mls || 0, trophyTemplate("mls"));
    drawTrophySummaryRow(100, 352, "UCL Trophy", counts.ucl || 0, trophyTemplate("ucl"));
    drawTrophySummaryRow(100, 412, "GOAT Mashup", counts.goat || 0, trophyTemplate("goat"));
    ctx.fillStyle = "rgba(247,251,255,0.62)";
    ctx.font = "800 12px Inter, system-ui, sans-serif";
    wrapText("Win finals in career, World Cup, and the GOAT Mashup to fill the shelves.", 100, 494, 262, 17, 3);

    drawGlassPanel(438, 150, 774, 466);
    ctx.fillStyle = "#f7fbff";
    ctx.font = "900 26px Inter, system-ui, sans-serif";
    ctx.fillText("Latest Wins", 474, 194);
    ctx.fillStyle = "rgba(247,251,255,0.6)";
    ctx.font = "800 12px Inter, system-ui, sans-serif";
    ctx.fillText(`${state.trophies.length} trophies collected`, 476, 218);

    const display = state.trophies.length
      ? state.trophies.slice(0, 8)
      : [
          { type: "worldCup", title: "World Cup", teamName: "Locked", note: "Win the World Cup", wonAt: "", locked: true },
          { type: "mls", title: "MLS Cup", teamName: "Locked", note: "Win the MLS playoffs", wonAt: "", locked: true },
          { type: "ucl", title: "UCL Trophy", teamName: "Locked", note: "Win the UCL playoffs", wonAt: "", locked: true },
          { type: "goat", title: "GOAT Mashup", teamName: "Locked", note: "Win the GOAT Mashup", wonAt: "", locked: true },
        ];
    display.forEach((trophy, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      drawTrophyCard(474 + col * 356, 250 + row * 82, 326, 68, trophy, trophy.locked);
    });

    drawButton(68, 642, 180, 46, "Main Menu", () => {
      state.mode = "menu";
    }, false);
    ctx.restore();
    drawParticles();
  }

  function drawTrophySummaryRow(x, y, label, count, template) {
    drawRoundedRect(x, y - 28, 250, 44, 12, "rgba(247,251,255,0.06)");
    drawTrophyCup(x + 12, y - 22, 30, 34, template, null, count === 0);
    ctx.fillStyle = "#f7fbff";
    ctx.font = "900 15px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(label, x + 58, y - 4);
    ctx.fillStyle = count ? "#8bdcd3" : "rgba(247,251,255,0.42)";
    ctx.font = "900 18px Inter, system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(String(count), x + 226, y - 4);
    ctx.textAlign = "left";
  }

  function drawTrophyCard(x, y, w, h, trophy, locked = false) {
    const template = trophyTemplate(trophy.type);
    const colors = trophy.colors || [template.metal, template.accent, "#f7fbff"];
    drawRoundedRect(x, y, w, h, 12, locked ? "rgba(247,251,255,0.04)" : "rgba(247,251,255,0.07)");
    ctx.strokeStyle = locked ? "rgba(247,251,255,0.08)" : "rgba(245,199,95,0.24)";
    ctx.lineWidth = 1.1;
    strokeRoundedRect(x, y, w, h, 12);
    drawTrophyCup(x + 14, y + 10, 44, 48, template, colors, locked);
    ctx.fillStyle = locked ? "rgba(247,251,255,0.46)" : "#f7fbff";
    ctx.font = "900 15px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    fillFittedText(trophy.title || template.title, x + 72, y + 25, w - 92);
    ctx.fillStyle = locked ? "rgba(247,251,255,0.38)" : "#8bdcd3";
    ctx.font = "800 12px Inter, system-ui, sans-serif";
    fillFittedText(trophy.teamName || "Locked", x + 72, y + 43, w - 160);
    ctx.fillStyle = "rgba(247,251,255,0.54)";
    ctx.font = "700 10.5px Inter, system-ui, sans-serif";
    fillFittedText(trophy.note || "", x + 72, y + 58, w - 96);
    if (trophy.wonAt) {
      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(247,251,255,0.48)";
      ctx.font = "800 10px Inter, system-ui, sans-serif";
      ctx.fillText(trophy.wonAt, x + w - 14, y + 43);
      ctx.textAlign = "left";
    }
  }

  function drawTrophyCup(x, y, w, h, template, colors, locked = false) {
    const metal = locked ? "rgba(247,251,255,0.2)" : template.metal;
    const accent = locked ? "rgba(247,251,255,0.12)" : colors?.[2] || template.accent;
    ctx.save();
    ctx.strokeStyle = locked ? "rgba(247,251,255,0.22)" : template.accent;
    ctx.lineWidth = Math.max(1.4, w * 0.05);
    ctx.beginPath();
    ctx.arc(x + w * 0.18, y + h * 0.32, w * 0.18, Math.PI * 0.75, Math.PI * 1.65);
    ctx.arc(x + w * 0.82, y + h * 0.32, w * 0.18, Math.PI * 1.35, Math.PI * 0.25, true);
    ctx.stroke();
    ctx.fillStyle = metal;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.22, y + h * 0.1);
    ctx.lineTo(x + w * 0.78, y + h * 0.1);
    ctx.lineTo(x + w * 0.66, y + h * 0.54);
    ctx.quadraticCurveTo(x + w * 0.5, y + h * 0.7, x + w * 0.34, y + h * 0.54);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = accent;
    ctx.fillRect(x + w * 0.35, y + h * 0.24, w * 0.3, h * 0.08);
    ctx.fillStyle = metal;
    ctx.fillRect(x + w * 0.44, y + h * 0.58, w * 0.12, h * 0.2);
    drawRoundedRect(x + w * 0.28, y + h * 0.78, w * 0.44, h * 0.12, h * 0.04, metal);
    drawRoundedRect(x + w * 0.2, y + h * 0.9, w * 0.6, h * 0.1, h * 0.04, accent);
    ctx.restore();
  }

  function drawPenaltyShootout() {
    drawStadium();
    drawPitch();
    drawOverlayShade();
    drawParticles();
    const shootout = state.penaltyShootout;
    if (!shootout) return;
    const x = 318;
    const y = 86;
    const w = 644;
    const h = 548;
    drawGlassPanel(x, y, w, h);
    ctx.fillStyle = "#f7fbff";
    ctx.font = "900 38px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Penalty Shootout", x + w / 2, y + 58);
    ctx.fillStyle = "rgba(247,251,255,0.66)";
    ctx.font = "800 13px Inter, system-ui, sans-serif";
    ctx.fillText(`${state.homeTeam.short} ${state.score.home}-${state.score.away} ${state.awayTeam.short}`, x + w / 2, y + 84);

    drawPenaltyGoalGraphic(x + 110, y + 112, w - 220, 142, shootout);
    ctx.fillStyle = "#f5c75f";
    ctx.font = "900 58px Inter, system-ui, sans-serif";
    ctx.fillText(`${shootout.homePens} - ${shootout.awayPens}`, x + w / 2, y + 308);

    drawPenaltyDots(x + 122, y + 342, state.homeTeam.short, shootout.homeSeq, shootout.maxKicks, state.homeTeam.colors);
    drawPenaltyDots(x + 122, y + 392, state.awayTeam.short, shootout.awaySeq, shootout.maxKicks, state.awayTeam.colors);

    ctx.fillStyle = shootout.complete ? "#8bdcd3" : "rgba(247,251,255,0.82)";
    ctx.font = "900 17px Inter, system-ui, sans-serif";
    ctx.fillText(
      shootout.complete
        ? shootout.last
        : shootout.live
          ? shootout.live.homeTurn
            ? "Live PK: your shot is flying"
            : "Live PK: your keeper is diving"
          : shootout.turn === "home"
          ? "Pick your shot direction"
          : "Pick your keeper dive",
      x + w / 2,
      y + 464
    );
    ctx.fillStyle = "rgba(247,251,255,0.54)";
    ctx.font = "800 11px Inter, system-ui, sans-serif";
    fillFittedText(shootout.log.slice(0, 3).join("  |  "), x + 90, y + 488, w - 180);

    if (shootout.complete) {
      drawButton(x + 228, y + 506, 188, 48, "Continue", () => exitPenaltyShootout(), true);
    } else if (shootout.live) {
      drawButton(x + 228, y + 506, 188, 48, "Live PK...", () => {}, false);
    } else {
      drawButton(x + 130, y + 506, 116, 48, "Left", () => takePenalty("left"), false);
      drawButton(x + 264, y + 506, 116, 48, "Center", () => takePenalty("center"), true);
      drawButton(x + 398, y + 506, 116, 48, "Right", () => takePenalty("right"), false);
    }
  }

  function drawPenaltyGoalGraphic(x, y, w, h, shootout) {
    drawRoundedRect(x, y, w, h, 18, "rgba(247,251,255,0.055)");
    ctx.strokeStyle = "rgba(247,251,255,0.34)";
    ctx.lineWidth = 3;
    strokeRoundedRect(x + 28, y + 24, w - 56, h - 42, 8);
    ctx.strokeStyle = "rgba(247,251,255,0.16)";
    ctx.lineWidth = 1.2;
    for (let i = 1; i < 3; i += 1) {
      ctx.beginPath();
      ctx.moveTo(x + 28 + ((w - 56) / 3) * i, y + 24);
      ctx.lineTo(x + 28 + ((w - 56) / 3) * i, y + h - 18);
      ctx.stroke();
    }
    PENALTY_DIRECTIONS.forEach((direction, index) => {
      ctx.fillStyle = shootout.turn === "home" ? "rgba(245,199,95,0.18)" : "rgba(139,220,211,0.16)";
      const zoneW = (w - 56) / 3;
      drawRoundedRect(x + 28 + index * zoneW + 8, y + 38, zoneW - 16, h - 76, 8, ctx.fillStyle);
      ctx.fillStyle = "#f7fbff";
      ctx.font = "900 11px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(direction.toUpperCase(), x + 28 + index * zoneW + zoneW / 2, y + h - 34);
    });
    drawLivePenaltyActors(x, y, w, h, shootout);
  }

  function smoothstep(value) {
    const t = clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
  }

  function penaltyDirectionPoint(direction, goalX, goalY, goalW, goalH, outside = false) {
    const xRatio = direction === "left" ? 0.2 : direction === "right" ? 0.8 : 0.5;
    const yRatio = outside ? 0.08 : 0.38;
    return {
      x: goalX + goalW * xRatio + (outside && direction !== "center" ? (direction === "left" ? -16 : 16) : 0),
      y: goalY + goalH * yRatio,
    };
  }

  function drawLivePenaltyActors(x, y, w, h, shootout) {
    const goalX = x + 28;
    const goalY = y + 24;
    const goalW = w - 56;
    const goalH = h - 42;
    const live = shootout.live;
    const ballStart = { x: x + w / 2, y: y + h - 8 };
    const keeperStart = { x: goalX + goalW / 2, y: goalY + goalH * 0.58 };
    const shotDirection = live?.shotDirection || "center";
    const keeperDirection = live?.keeperDirection || "center";
    const missOutside = live && !live.scored && !live.saved;
    const target = penaltyDirectionPoint(shotDirection, goalX, goalY, goalW, goalH, missOutside);
    const keeperTarget = penaltyDirectionPoint(keeperDirection, goalX, goalY, goalW, goalH, false);
    const t = live ? clamp(live.t / live.duration, 0, 1) : 0;
    const ballT = smoothstep(Math.min(1, t * 1.18));
    const keeperT = smoothstep(clamp((t - 0.08) / 0.72, 0, 1));
    const ballX = live ? lerp(ballStart.x, target.x, ballT) : ballStart.x;
    const ballY = live ? lerp(ballStart.y, target.y, ballT) : ballStart.y;
    const keeperX = live ? lerp(keeperStart.x, keeperTarget.x, keeperT) : keeperStart.x;
    const keeperY = live ? lerp(keeperStart.y, keeperTarget.y, keeperT) : keeperStart.y;
    const keeperColor = shootout.turn === "home" ? state.awayTeam.colors[2] : state.homeTeam.colors[2];

    ctx.save();
    ctx.strokeStyle = "rgba(245,199,95,0.28)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ballStart.x, ballStart.y);
    ctx.quadraticCurveTo(x + w / 2, y + h * 0.5, target.x, target.y);
    if (live) ctx.stroke();

    ctx.fillStyle = "rgba(0,0,0,0.32)";
    ctx.beginPath();
    ctx.ellipse(keeperX, keeperY + 14, 22, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = keeperColor;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    const diveLean = keeperDirection === "left" ? -14 : keeperDirection === "right" ? 14 : 0;
    ctx.beginPath();
    ctx.moveTo(keeperX - 24 + diveLean, keeperY + 4);
    ctx.lineTo(keeperX, keeperY - 8);
    ctx.lineTo(keeperX + 24 + diveLean, keeperY + 4);
    ctx.stroke();
    drawRoundedRect(keeperX - 14 + diveLean * 0.2, keeperY - 7, 28, 24, 9, "rgba(139,220,211,0.9)");
    ctx.fillStyle = "#f7fbff";
    ctx.beginPath();
    ctx.arc(keeperX + diveLean * 0.34, keeperY - 18, 8, 0, Math.PI * 2);
    ctx.fill();

    const ballR = live ? lerp(8.5, 5.8, ballT) : 8;
    ctx.fillStyle = "rgba(0,0,0,0.34)";
    ctx.beginPath();
    ctx.ellipse(ballX + 3, ballY + 9, ballR * 1.2, ballR * 0.48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f7fbff";
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#101820";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(ballX - ballR * 0.75, ballY);
    ctx.lineTo(ballX + ballR * 0.75, ballY);
    ctx.moveTo(ballX, ballY - ballR * 0.75);
    ctx.lineTo(ballX, ballY + ballR * 0.75);
    ctx.stroke();

    if (live && t > 0.66) {
      const resultColor = live.scored ? "#8bdcd3" : live.saved ? "#f5c75f" : "#f05d5e";
      ctx.font = "900 16px Inter, system-ui, sans-serif";
      const labelW = ctx.measureText(live.result).width + 28;
      drawRoundedRect(x + w / 2 - labelW / 2, y + 8, labelW, 28, 12, "rgba(6,13,17,0.78)");
      ctx.fillStyle = resultColor;
      ctx.textAlign = "center";
      ctx.fillText(live.result, x + w / 2, y + 28);
    }
    ctx.restore();
  }

  function drawPenaltyDots(x, y, label, sequence, maxKicks, colors) {
    ctx.fillStyle = "rgba(247,251,255,0.7)";
    ctx.font = "900 13px Inter, system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(label, x + 52, y + 5);
    ctx.textAlign = "left";
    const visibleSlots = Math.min(8, Math.max(5, maxKicks));
    for (let i = 0; i < visibleSlots; i += 1) {
      const cx = x + 76 + i * 28;
      ctx.beginPath();
      ctx.arc(cx, y, 8, 0, Math.PI * 2);
      if (i < sequence.length) {
        ctx.fillStyle = sequence[i] ? "#8bdcd3" : "#f05d5e";
      } else {
        ctx.fillStyle = "rgba(247,251,255,0.13)";
      }
      ctx.fill();
      ctx.strokeStyle = i < sequence.length ? colors[2] : "rgba(247,251,255,0.18)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    if (maxKicks > visibleSlots) {
      ctx.fillStyle = "rgba(247,251,255,0.54)";
      ctx.font = "900 11px Inter, system-ui, sans-serif";
      ctx.fillText(`+${maxKicks - visibleSlots}`, x + 76 + visibleSlots * 28, y + 5);
    }
  }

  function worldCupStageLabel(cup) {
    if (cup.championIndex === cup.teamIndex) return "World Champions";
    if (cup.championIndex != null) return `Champion: ${WORLD_TEAMS[cup.championIndex].short}`;
    if (cup.eliminated) return "Eliminated";
    return currentWorldCupRound()?.label || "Knockout";
  }

  function worldCupRoundShort(cup) {
    const label = worldCupStageLabel(cup);
    if (label === "Round of 16") return "R16";
    if (label === "Quarterfinal") return "QF";
    if (label === "Semifinal") return "SF";
    if (label === "Final") return "Final";
    return cup.championIndex === cup.teamIndex ? "Won" : cup.eliminated ? "Out" : "Done";
  }

  function worldCupActionLabel(cup) {
    if (cup.championIndex === cup.teamIndex) return "Champions";
    if (cup.championIndex != null || cup.eliminated) return "Tournament Over";
    return "Play Knockout";
  }

  function drawWorldCupSquad(x, y, w, team) {
    ctx.fillStyle = "#f5c75f";
    ctx.font = "900 13px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("No-trade national squad", x, y - 14);
    team.players.forEach((player, index) => {
      const rowY = y + index * 28;
      drawRoundedRect(x, rowY, w, 22, 8, index % 2 === 0 ? "rgba(247,251,255,0.06)" : "rgba(247,251,255,0.035)");
      ctx.fillStyle = "rgba(247,251,255,0.62)";
      ctx.font = "900 10px Inter, system-ui, sans-serif";
      ctx.fillText(player.role, x + 12, rowY + 15);
      ctx.fillStyle = "#f7fbff";
      ctx.font = "800 12px Inter, system-ui, sans-serif";
      fillFittedText(player.name, x + 54, rowY + 15, 238);
      ctx.textAlign = "right";
      ctx.fillStyle = team.colors[2];
      ctx.font = "900 12px Inter, system-ui, sans-serif";
      ctx.fillText(String(player.rating), x + w - 14, rowY + 15);
      ctx.textAlign = "left";
    });
  }

  function drawWorldCupBracket(x, y, w, cup) {
    ctx.fillStyle = "#f5c75f";
    ctx.font = "900 16px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("16-team knockout bracket", x, y - 18);
    ctx.fillStyle = "rgba(247,251,255,0.54)";
    ctx.font = "800 10px Inter, system-ui, sans-serif";
    ctx.fillText("Winners advance. Losers are out. No trading.", x, y + 2);
    const colW = 106;
    const gap = 14;
    const columns = [
      { label: "R16", round: cup.rounds[0], x: x, gap: 34, top: y + 22, h: 29 },
      { label: "QF", round: cup.rounds[1], x: x + colW + gap, gap: 68, top: y + 38, h: 34 },
      { label: "SF", round: cup.rounds[2], x: x + (colW + gap) * 2, gap: 136, top: y + 70, h: 38 },
      { label: "FINAL", round: cup.rounds[3], x: x + (colW + gap) * 3, gap: 1, top: y + 138, h: 42 },
    ];
    columns.forEach((column) => {
      ctx.fillStyle = "rgba(139,220,211,0.68)";
      ctx.font = "900 9.5px Inter, system-ui, sans-serif";
      ctx.fillText(column.label, column.x, y + 17);
      const matches = column.round?.matches || [];
      if (!matches.length) {
        drawRoundedRect(column.x, column.top, colW, column.h, 8, "rgba(247,251,255,0.04)");
        ctx.fillStyle = "rgba(247,251,255,0.38)";
        ctx.font = "800 9px Inter, system-ui, sans-serif";
        ctx.fillText("TBD", column.x + 10, column.top + column.h / 2 + 3);
        return;
      }
      matches.forEach((match, index) => {
        drawWorldCupMatchCard(column.x, column.top + index * column.gap, colW, column.h, match, cup);
      });
    });
  }

  function drawWorldCupMatchCard(x, y, w, h, match, cup) {
    const active = match.homeTeam === cup.teamIndex || match.awayTeam === cup.teamIndex;
    drawRoundedRect(x, y, w, h, 8, active ? "rgba(245,199,95,0.14)" : "rgba(247,251,255,0.06)");
    ctx.strokeStyle = active ? "rgba(245,199,95,0.42)" : "rgba(247,251,255,0.08)";
    ctx.lineWidth = 1;
    strokeRoundedRect(x, y, w, h, 8);
    drawWorldCupTeamLine(x + 7, y + h * 0.38, w - 14, match.homeSeed, match.homeTeam, match.winner);
    drawWorldCupTeamLine(x + 7, y + h * 0.75, w - 14, match.awaySeed, match.awayTeam, match.winner);
    if (match.played) {
      ctx.fillStyle = "rgba(247,251,255,0.56)";
      ctx.font = "800 8px Inter, system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(match.score, x + w - 6, y + h / 2 + 3);
      ctx.textAlign = "left";
    }
  }

  function drawWorldCupTeamLine(x, y, w, seed, teamIndex, winner) {
    const won = winner === teamIndex;
    ctx.fillStyle = won ? "#8bdcd3" : "rgba(247,251,255,0.72)";
    ctx.font = "900 9px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`#${seed} ${WORLD_TEAMS[teamIndex].short}`, x, y);
    if (won) {
      ctx.textAlign = "right";
      ctx.fillText("W", x + w, y);
      ctx.textAlign = "left";
    }
  }

  function clubStageLabel(career) {
    if (career.type !== "club") return `Fixture ${career.fixture}`;
    if (career.season.stage === "regular") {
      return `Regular Season ${Math.min(career.fixture, career.season.regularSeasonLength)}/${career.season.regularSeasonLength}`;
    }
    if (career.season.stage === "playoff") {
      if (career.season.playoff?.round === "quarterfinal") return "Playoff First Round";
      return career.season.playoff?.round === "final" ? "Playoff Final" : "Playoff Semifinal";
    }
    return career.season.stage === "champion" ? "Champions" : "Season Complete";
  }

  function careerActionLabel(career) {
    if (career.type !== "club") return "Play Next Match";
    if (clubSeasonComplete(career)) {
      if (goatMashupPlayable(career)) return career.goatMashup ? "Play Mashup" : "GOAT Mashup";
      return "Start Next Year";
    }
    if (hasPlayableClubMatch(career)) return career.season.stage === "regular" ? "Play Season Match" : "Play Playoff";
    return "Season Complete";
  }

  function drawClubLeaderboard(x, y, w, career) {
    const ranked = rankedStandings(career);
    const compact = ranked.length > 10;
    const ultraCompact = ranked.length > 18;
    const rowGap = ultraCompact ? 11 : compact ? 16 : 27;
    const rowH = ultraCompact ? 10 : compact ? 14 : 23;
    const rowFont = ultraCompact ? 7.6 : compact ? 9.5 : 12;
    const teamNameFont = ultraCompact ? 7 : compact ? 8.5 : 10;
    const nameLimit = ultraCompact ? 12 : compact ? 13 : 16;
    ctx.fillStyle = "#f5c75f";
    ctx.font = "900 14px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`${career.season.leagueName} leaderboard`, x, y - 18);
    if (compact) {
      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(139,220,211,0.68)";
      ctx.font = "900 10px Inter, system-ui, sans-serif";
      ctx.fillText(compactPlayoffRuleLabel(career.season), x + w, y - 18);
      ctx.textAlign = "left";
    }
    ctx.fillStyle = "rgba(247,251,255,0.48)";
    ctx.font = "800 10px Inter, system-ui, sans-serif";
    ctx.fillText("SEED", x + 6, y + 4);
    ctx.fillText("CLUB", x + 58, y + 4);
    ctx.textAlign = "right";
    ctx.fillText("PTS", x + w - 166, y + 4);
    ctx.fillText("W-D-L", x + w - 94, y + 4);
    ctx.fillText("GD", x + w - 12, y + 4);
    ctx.textAlign = "left";

    const playoffCutoff = playoffAdvanceCountForSeason(career.season);
    ranked.forEach((row, index) => {
      const rowY = y + 16 + index * rowGap;
      const team = TEAMS[row.teamIndex];
      const active = row.teamIndex === career.teamIndex;
      const qualified = row.seed <= playoffCutoff;
      drawRoundedRect(
        x,
        rowY,
        w,
        rowH,
        6,
        active ? "rgba(245,199,95,0.18)" : qualified ? "rgba(139,220,211,0.09)" : "rgba(247,251,255,0.045)"
      );
      if (index === playoffCutoff) {
        ctx.strokeStyle = compact ? "rgba(139,220,211,0.22)" : "rgba(245,199,95,0.34)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, rowY - 4);
        ctx.lineTo(x + w, rowY - 4);
        ctx.stroke();
      }
      ctx.fillStyle = active ? "#f5c75f" : qualified ? "#8bdcd3" : "rgba(247,251,255,0.66)";
      ctx.font = `900 ${rowFont}px Inter, system-ui, sans-serif`;
      ctx.fillText(`#${row.seed}`, x + 12, rowY + rowH - 4);
      ctx.fillStyle = "#f7fbff";
      ctx.font = `900 ${rowFont}px Inter, system-ui, sans-serif`;
      ctx.fillText(team.short, x + 60, rowY + rowH - 4);
      ctx.fillStyle = "rgba(247,251,255,0.62)";
      ctx.font = `700 ${teamNameFont}px Inter, system-ui, sans-serif`;
      ctx.fillText(team.name.slice(0, nameLimit), x + 104, rowY + rowH - 4);
      ctx.textAlign = "right";
      ctx.fillStyle = "#f7fbff";
      ctx.font = `900 ${rowFont}px Inter, system-ui, sans-serif`;
      ctx.fillText(String(row.points), x + w - 166, rowY + rowH - 4);
      ctx.fillStyle = "rgba(247,251,255,0.72)";
      ctx.fillText(`${row.wins}-${row.draws}-${row.losses}`, x + w - 94, rowY + rowH - 4);
      ctx.fillText(String(row.gd), x + w - 12, rowY + rowH - 4);
      ctx.textAlign = "left";
    });
    if (!compact) {
      ctx.fillStyle = "rgba(247,251,255,0.5)";
      ctx.font = "800 10.5px Inter, system-ui, sans-serif";
      ctx.fillText(playoffRuleLabel(career.season), x, y + 252);
    }
  }

  function drawCareerHistory(x, y, w, history) {
    ctx.fillStyle = "#f5c75f";
    ctx.font = "900 14px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Recent fixtures", x, y - 22);
    if (!history.length) {
      ctx.fillStyle = "rgba(247,251,255,0.62)";
      ctx.font = "800 14px Inter, system-ui, sans-serif";
      ctx.fillText("No matches played yet.", x, y + 8);
      return;
    }
    history.forEach((item, index) => {
      const rowY = y + index * 43;
      drawRoundedRect(x, rowY, w, 34, 10, "rgba(247,251,255,0.06)");
      ctx.fillStyle = item.result === "W" ? "#8bdcd3" : item.result === "D" ? "#f5c75f" : "#f05d5e";
      ctx.font = "900 16px Inter, system-ui, sans-serif";
      ctx.fillText(item.result, x + 14, rowY + 23);
      ctx.fillStyle = "#f7fbff";
      ctx.font = "800 13px Inter, system-ui, sans-serif";
      ctx.fillText(`F${item.fixture} vs ${item.opponent}  ${item.score}`, x + 50, rowY + 22);
      ctx.fillStyle = "rgba(247,251,255,0.58)";
      ctx.textAlign = "right";
      ctx.fillText(item.note, x + w - 14, rowY + 22);
      ctx.textAlign = "left";
    });
  }

  function drawPlayerCareerHub(career, team, nextOpponent) {
    const player = team.players.find((item) => item.name === career.playerName) || team.players[4];
    const overall = Math.min(100, career.baseRating + career.ratingBoost);
    drawPlayerCard(704, 190, 170, 238, team, { ...player, rating: overall });
    ctx.fillStyle = "#f7fbff";
    ctx.font = "900 30px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(career.playerName, 906, 196);
    ctx.fillStyle = "rgba(247,251,255,0.68)";
    ctx.font = "800 14px Inter, system-ui, sans-serif";
    ctx.fillText(`${career.playerRole}  |  Career goals ${career.goals}  |  Assists ${career.assists}`, 908, 224);

    drawClubMetric(908, 258, 120, "Overall", String(overall), "#f5c75f");
    drawClubMetric(1044, 258, 120, "XP", String(career.xp), "#8bdcd3");
    drawPowerBar(908, 344, 256, 10, (career.xp % 180) / 1.8, team.colors);
    ctx.fillStyle = "rgba(247,251,255,0.72)";
    ctx.font = "800 13px Inter, system-ui, sans-serif";
    wrapText(career.lastSummary, 908, 384, 270, 18, 3);
    drawCareerObjective(908, 454, "Next fixture", `${team.short} vs ${nextOpponent.short}. Difficulty ${difficultyName(upcomingCareerDifficultyIndex(career))}.`);
  }

  function drawClubCareerHub(career, team, nextOpponent) {
    drawCrest(704, 184, 108, 130, team, 1);
    ctx.fillStyle = "#f7fbff";
    ctx.font = "900 30px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`Dynasty Office`, 848, 194);
    ctx.fillStyle = "rgba(247,251,255,0.68)";
    ctx.font = "800 14px Inter, system-ui, sans-serif";
    const nextLabel = hasPlayableClubMatch(career) ? `Next ${nextOpponent.short}` : clubStageLabel(career);
    ctx.fillText(`Year ${career.year}  |  ${nextLabel}  |  ${difficultyName(upcomingCareerDifficultyIndex(career))}`, 850, 222);
    drawClubMetric(704, 342, 132, "Budget", `$${career.budget}M`, "#f5c75f");
    drawClubMetric(858, 342, 132, "Squad", String(dynastyPower(career)), "#8bdcd3");
    drawClubMetric(1012, 342, 132, "Sharpness", `+${career.sharpness}`, team.colors[2]);
    ctx.fillStyle = "rgba(247,251,255,0.72)";
    ctx.font = "800 13px Inter, system-ui, sans-serif";
    wrapText(career.lastSummary, 850, 258, 306, 18, 3);
    drawButton(850, 286, 96, 44, "Roster", () => {
      state.careerHubView = "roster";
    }, false);
    drawButton(964, 286, 188, 44, "Training $8M", () => trainClub(), false);
    drawDynastyTools(704, 408, 460, career);
    if (clubSeasonComplete(career)) drawGoatMashupPanel(704, 488, 460, career);
    else drawPlayoffBracket(704, career.season.playoff ? 488 : 508, 460, career);
  }

  function drawClubTeamRoster(career, team) {
    ensureCareerLineup(career);
    drawCrest(704, 180, 76, 92, team, 1);
    ctx.fillStyle = "#f7fbff";
    ctx.font = "900 29px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Team Roster", 802, 194);
    ctx.fillStyle = "rgba(247,251,255,0.66)";
    ctx.font = "800 13px Inter, system-ui, sans-serif";
    ctx.fillText(`${team.short} roster  |  ${career.roster.length} players  |  Budget $${career.budget}M`, 804, 222);
    drawButton(1036, 178, 116, 38, "Office", () => {
      state.careerHubView = "office";
    }, false);
    drawButton(1036, 224, 116, 38, "Auto XI", () => autoFillLineup(career), false);

    drawLineupManager(704, 294, 222, career, team);
    drawRosterManager(944, 294, 220, career, team);
    drawTradeDesk(704, 482, 460, career);
  }

  function drawLineupManager(x, y, w, career, team) {
    ctx.fillStyle = "#f5c75f";
    ctx.font = "900 13px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Starting slots", x, y - 16);
    ROLE_ORDER.forEach((role, index) => {
      const rowY = y + index * 34;
      const player = career.roster.find((item) => item.uid === career.lineup[role]);
      const active = state.selectedLineupRole === role;
      drawRoundedRect(x, rowY, w, 28, 9, active ? "rgba(245,199,95,0.2)" : "rgba(247,251,255,0.06)");
      ctx.strokeStyle = active ? team.colors[2] : "rgba(247,251,255,0.08)";
      ctx.lineWidth = 1;
      strokeRoundedRect(x, rowY, w, 28, 9);
      ctx.fillStyle = active ? "#f5c75f" : "rgba(247,251,255,0.64)";
      ctx.font = "900 11px Inter, system-ui, sans-serif";
      ctx.fillText(role, x + 12, rowY + 18);
      ctx.fillStyle = "#f7fbff";
      ctx.font = "800 12px Inter, system-ui, sans-serif";
      fillFittedText(player ? lastName(player.name) : "Open", x + 50, rowY + 18, 98);
      ctx.textAlign = "right";
      ctx.fillStyle = player?.role === role ? "rgba(247,251,255,0.74)" : "#f5c75f";
      ctx.font = "900 11px Inter, system-ui, sans-serif";
      ctx.fillText(player ? `${player.rating}` : "-", x + w - 12, rowY + 18);
      ctx.textAlign = "left";
      addHitbox(`lineup-${role}`, x, rowY, w, 28, () => {
        state.selectedLineupRole = role;
        if (player) state.selectedRosterUid = player.uid;
      });
    });
  }

  function drawRosterManager(x, y, w, career, team) {
    const selected = selectedRosterPlayer(career);
    const roster = career.roster.slice().sort((a, b) => b.rating - a.rating).slice(0, 8);
    ctx.fillStyle = "#f5c75f";
    ctx.font = "900 13px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Roster", x, y - 16);
    roster.forEach((player, index) => {
      const rowY = y + index * 22;
      const active = selected?.uid === player.uid;
      const startingRole = ROLE_ORDER.find((role) => career.lineup[role] === player.uid);
      drawRoundedRect(x, rowY, w, 18, 7, active ? "rgba(139,220,211,0.18)" : "rgba(247,251,255,0.045)");
      ctx.fillStyle = active ? "#8bdcd3" : "rgba(247,251,255,0.62)";
      ctx.font = "900 9.5px Inter, system-ui, sans-serif";
      ctx.fillText(startingRole || player.role, x + 9, rowY + 13);
      ctx.fillStyle = "#f7fbff";
      ctx.font = "800 11px Inter, system-ui, sans-serif";
      fillFittedText(lastName(player.name), x + 42, rowY + 13, 96);
      ctx.textAlign = "right";
      ctx.fillStyle = player.role === state.selectedLineupRole ? "rgba(247,251,255,0.76)" : "#f5c75f";
      ctx.font = "900 10px Inter, system-ui, sans-serif";
      ctx.fillText(`${player.rating}`, x + w - 10, rowY + 13);
      ctx.textAlign = "left";
      addHitbox(`roster-${player.uid}`, x, rowY, w, 18, () => {
        setLineupSlot(career, state.selectedLineupRole, player.uid);
      });
    });
    ctx.fillStyle = "rgba(247,251,255,0.44)";
    ctx.font = "800 9.5px Inter, system-ui, sans-serif";
    ctx.fillText("Pick a slot, then pick a player.", x, y + 192);
  }

  function drawTradeDesk(x, y, w, career) {
    const selected = selectedRosterPlayer(career);
    const offer = tradeOfferForSelected(career);
    drawRoundedRect(x, y, w, 100, 12, "rgba(247,251,255,0.07)");
    ctx.fillStyle = "#f5c75f";
    ctx.font = "900 13px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Trade desk", x + 14, y + 20);
    ctx.fillStyle = "rgba(247,251,255,0.7)";
    ctx.font = "800 11px Inter, system-ui, sans-serif";
    fillFittedText(`Selected: ${selected ? selected.name : "None"}`, x + 14, y + 41, 220);
    const dealText = offer
      ? `Offer: ${lastName(offer.outgoingName)} -> ${lastName(offer.incoming.name)}  $${offer.cost}M`
      : "No offer yet for this player.";
    fillFittedText(dealText, x + 14, y + 62, 250);
    ctx.fillStyle = "rgba(247,251,255,0.46)";
    ctx.font = "800 10px Inter, system-ui, sans-serif";
    ctx.fillText("Create an offer, then accept it if the price works.", x + 14, y + 82);
    drawButton(x + 248, y + 18, 104, 34, "Offer Trade", () => offerTradeForSelected(), false);
    drawButton(x + 366, y + 18, 78, 34, "Accept", () => applySelectedTradeOffer(), Boolean(offer));
  }

  function drawDynastyTools(x, y, w, career) {
    const offer = activeTradeOffer(career);
    const prospect = activeDraftProspect(career);
    drawRoundedRect(x, y, w, 58, 12, "rgba(247,251,255,0.07)");
    ctx.fillStyle = "#f5c75f";
    ctx.font = "900 12px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`YEAR ${career.year} DYNASTY`, x + 14, y + 17);
    ctx.fillStyle = "rgba(247,251,255,0.66)";
    ctx.font = "800 11px Inter, system-ui, sans-serif";
    ctx.fillText(`Roster ${career.roster.length}  |  Titles ${career.championships}  |  GOAT ${career.goatTitles || 0}  |  Picks ${career.draftPicks}`, x + 14, y + 34);
    fillFittedText(
      `Trade ${lastName(offer.outgoingName)} -> ${lastName(offer.incoming.name)}  |  Draft ${prospect.role} ${prospect.rating}`,
      x + 14,
      y + 51,
      260
    );

    drawButton(x + 290, y + 12, 68, 34, "Trade", () => applyTradeOffer(), false);
    drawButton(x + 374, y + 12, 68, 34, "Draft", () => draftProspect(), false);
  }

  function nextClubMatchLabel(career, nextOpponent) {
    if (!hasPlayableClubMatch(career)) return clubSeasonStatusText(career);
    const seed = career.season.stage === "playoff" ? `#${seedForTeam(career, nextOpponent === TEAMS[career.teamIndex] ? career.teamIndex : TEAMS.indexOf(nextOpponent))} ` : "";
    return `Next: ${seed}${nextOpponent.name}`;
  }

  function drawPlayoffBracket(x, y, w, career) {
    const advanceCount = playoffAdvanceCountForSeason(career.season);
    ctx.fillStyle = "#f5c75f";
    ctx.font = "900 14px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`${career.season.leagueName} playoff`, x, y - 16);
    if (!career.season.playoff) {
      const projected = rankedStandings(career).slice(0, advanceCount);
      drawRoundedRect(x, y, w, 98, 12, "rgba(247,251,255,0.06)");
      ctx.fillStyle = "rgba(247,251,255,0.66)";
      ctx.font = "800 12px Inter, system-ui, sans-serif";
      ctx.fillText(playoffRuleLabel(career.season), x + 14, y + 24);
      projected.forEach((row, index) => {
        ctx.fillStyle = row.teamIndex === career.teamIndex ? "#f5c75f" : "#8bdcd3";
        ctx.font = "900 11px Inter, system-ui, sans-serif";
        const colCount = 3;
        const colGap = 142;
        const col = index % colCount;
        const rowOffset = Math.floor(index / colCount);
        const bye = index < 2 ? " BYE" : "";
        ctx.fillText(`#${index + 1} ${TEAMS[row.teamIndex].short}${bye}`, x + 18 + col * colGap, y + 56 + rowOffset * 24);
      });
      return;
    }

    const playoff = career.season.playoff;
    const qfs = playoff.quarterfinals || [];
    const sfs = playoff.semifinals || playoff.matches || [];
    if (!qfs.length) {
      ctx.fillStyle = "rgba(247,251,255,0.46)";
      ctx.font = "900 9px Inter, system-ui, sans-serif";
      ctx.fillText("SEMIFINALS", x, y);
      ctx.fillText("FINAL", x + 248, y);
      drawBracketMatch(x, y + 10, 184, sfs[0], career, 44);
      drawBracketMatch(x, y + 62, 184, sfs[1], career, 44);
      if (playoff.final) {
        drawBracketMatch(x + 248, y + 36, 184, playoff.final, career, 44);
      } else {
        drawRoundedRect(x + 248, y + 36, 184, 44, 10, "rgba(247,251,255,0.05)");
        ctx.fillStyle = "rgba(247,251,255,0.52)";
        ctx.font = "800 11px Inter, system-ui, sans-serif";
        ctx.fillText("Final TBD", x + 262, y + 62);
      }
      return;
    }
    ctx.fillStyle = "rgba(247,251,255,0.46)";
    ctx.font = "900 9px Inter, system-ui, sans-serif";
    ctx.fillText("FIRST ROUND", x, y);
    ctx.fillText("#1/#2 BYE SEMIS", x + 154, y);
    ctx.fillText("FINAL", x + 318, y);
    drawBracketMatch(x, y + 10, 142, qfs[0], career, 44);
    drawBracketMatch(x, y + 62, 142, qfs[1], career, 44);
    if (sfs.length) {
      drawBracketMatch(x + 154, y + 10, 142, sfs[0], career, 44);
      drawBracketMatch(x + 154, y + 62, 142, sfs[1], career, 44);
    } else {
      drawByeSlot(x + 154, y + 10, 142, playoff.byes?.[0]);
      drawByeSlot(x + 154, y + 62, 142, playoff.byes?.[1]);
    }
    if (playoff.final) {
      drawBracketMatch(x + 318, y + 36, 142, playoff.final, career, 44);
    } else {
      drawRoundedRect(x + 318, y + 36, 142, 44, 10, "rgba(247,251,255,0.05)");
      ctx.fillStyle = "rgba(247,251,255,0.52)";
      ctx.font = "800 11px Inter, system-ui, sans-serif";
      ctx.fillText("Final TBD", x + 332, y + 62);
    }
  }

  function drawGoatMashupPanel(x, y, w, career) {
    const mashup = career.goatMashup;
    ctx.fillStyle = "#f5c75f";
    ctx.font = "900 14px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("GOAT Mashup", x, y - 16);
    drawRoundedRect(x, y, w, 118, 12, "rgba(247,251,255,0.07)");
    if (!mashup) {
      ctx.fillStyle = "rgba(247,251,255,0.68)";
      ctx.font = "800 12px Inter, system-ui, sans-serif";
      wrapText("After the playoffs, simulate the World Cup, Champions League, and MLS. Then play the winners.", x + 14, y + 24, w - 28, 18, 2);
      ctx.fillStyle = "#8bdcd3";
      ctx.font = "900 11px Inter, system-ui, sans-serif";
      ctx.fillText("Press GOAT Mashup to load the bracket.", x + 14, y + 88);
      return;
    }

    ctx.fillStyle = "rgba(247,251,255,0.54)";
    ctx.font = "800 9.5px Inter, system-ui, sans-serif";
    fillFittedText(
      `CL ${mashup.qualifiers.championsLeague.short}  |  WC ${mashup.qualifiers.worldCup.short}  |  MLS ${mashup.qualifiers.mls.short}`,
      x + 14,
      y + 20,
      w - 28
    );
    drawGoatMatchCard(x + 14, y + 34, 128, 50, mashup.matches[0], mashup);
    drawGoatMatchCard(x + 166, y + 34, 128, 50, mashup.matches[1], mashup);
    drawGoatMatchCard(x + 318, y + 34, 128, 50, mashup.final, mashup, "FINAL TBD");
    ctx.fillStyle = "rgba(247,251,255,0.58)";
    ctx.font = "800 10px Inter, system-ui, sans-serif";
    fillFittedText(mashup.lastSummary, x + 14, y + 103, w - 28);
  }

  function drawGoatMatchCard(x, y, w, h, match, mashup, emptyLabel = "TBD") {
    drawRoundedRect(x, y, w, h, 10, match ? "rgba(247,251,255,0.065)" : "rgba(247,251,255,0.04)");
    if (!match) {
      ctx.fillStyle = "rgba(247,251,255,0.42)";
      ctx.font = "800 10px Inter, system-ui, sans-serif";
      ctx.fillText(emptyLabel, x + 10, y + 29);
      return;
    }
    const active = match.homeTeam === 0 || match.awayTeam === 0;
    ctx.strokeStyle = active ? "rgba(245,199,95,0.42)" : "rgba(247,251,255,0.08)";
    ctx.lineWidth = 1;
    strokeRoundedRect(x, y, w, h, 10);
    const drawLine = (teamIndex, rowY) => {
      const won = match.winner === teamIndex;
      ctx.fillStyle = won ? "#8bdcd3" : teamIndex === 0 ? "#f5c75f" : "rgba(247,251,255,0.72)";
      ctx.font = "900 11px Inter, system-ui, sans-serif";
      fillFittedText(goatTeamLabel(mashup, teamIndex), x + 10, rowY, w - 44);
      if (won) {
        ctx.textAlign = "right";
        ctx.fillText("W", x + w - 10, rowY);
        ctx.textAlign = "left";
      }
    };
    drawLine(match.homeTeam, y + 19);
    drawLine(match.awayTeam, y + 37);
    if (match.played) {
      ctx.fillStyle = "rgba(247,251,255,0.5)";
      ctx.font = "800 8.5px Inter, system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(match.score, x + w - 10, y + 29);
      ctx.textAlign = "left";
    }
  }

  function drawByeSlot(x, y, w, seedRow) {
    drawRoundedRect(x, y, w, 44, 10, "rgba(139,220,211,0.08)");
    ctx.fillStyle = "#8bdcd3";
    ctx.font = "900 11px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(seedRow ? `#${seedRow.seed} ${TEAMS[seedRow.teamIndex].short}` : "Bye TBD", x + 10, y + 19);
    ctx.fillStyle = "rgba(247,251,255,0.54)";
    ctx.font = "800 9px Inter, system-ui, sans-serif";
    ctx.fillText("BYE", x + 10, y + 34);
  }

  function drawBracketMatch(x, y, w, match, career, h = 56) {
    if (!match) {
      drawRoundedRect(x, y, w, h, 10, "rgba(247,251,255,0.05)");
      return;
    }
    drawRoundedRect(x, y, w, h, 10, "rgba(247,251,255,0.065)");
    const homeActive = match.homeTeam === career.teamIndex;
    const awayActive = match.awayTeam === career.teamIndex;
    const lineW = match.played ? w - 54 : w - 20;
    drawBracketTeamLine(x + 10, y + (h === 44 ? 17 : 21), lineW, match.homeSeed, match.homeTeam, match.winner, homeActive);
    drawBracketTeamLine(x + 10, y + (h === 44 ? 34 : 43), lineW, match.awaySeed, match.awayTeam, match.winner, awayActive);
    if (match.played) {
      ctx.fillStyle = "rgba(247,251,255,0.58)";
      ctx.font = "800 9px Inter, system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(match.score, x + w - 8, y + h / 2 + 4);
      ctx.textAlign = "left";
    }
  }

  function drawBracketTeamLine(x, y, w, seed, teamIndex, winner, active) {
    const won = winner === teamIndex;
    ctx.fillStyle = won ? "#8bdcd3" : active ? "#f5c75f" : "rgba(247,251,255,0.72)";
    ctx.font = "900 10.5px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`#${seed} ${TEAMS[teamIndex].short}`, x, y);
    if (won) {
      ctx.textAlign = "right";
      ctx.fillText("W", x + w, y);
      ctx.textAlign = "left";
    }
  }

  function drawModeTabs() {
    const modes = [
      { id: "quick", label: "Quick Match" },
      { id: "player", label: "Player Career" },
      { id: "club", label: "Club Career" },
      { id: "world", label: "World Cup" },
    ];
    const x = 68;
    const y = 124;
    modes.forEach((mode, index) => {
      const w = index === 0 ? 142 : index === 3 ? 144 : 168;
      const tabX = x + index * 170;
      const active = state.menuMode === mode.id;
      drawRoundedRect(tabX, y, w, 36, 13, active ? "rgba(245,199,95,0.92)" : "rgba(247,251,255,0.08)");
      ctx.strokeStyle = active ? "rgba(255,255,255,0.42)" : "rgba(247,251,255,0.14)";
      ctx.lineWidth = 1.3;
      strokeRoundedRect(tabX, y, w, 36, 13);
      ctx.fillStyle = active ? "#101820" : "#f7fbff";
      ctx.font = "900 13px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(mode.label, tabX + w / 2, y + 23);
      addHitbox(`mode-${mode.id}`, tabX, y, w, 36, () => {
        setMenuMode(mode.id);
      });
    });
    if (state.menuMode !== "world") drawClubPoolJump(746, y, 176, 36);
    drawDifficultySelector(946, 86, 268, 36);
    drawButton(946, y, 268, 36, "Trophy Room", () => {
      state.mode = "trophyRoom";
    }, false);
  }

  function drawClubPoolJump(x, y, w, h) {
    const mlsActive = state.clubPool === "mls";
    drawRoundedRect(x, y, w, h, 13, "rgba(247,251,255,0.08)");
    ctx.strokeStyle = "rgba(247,251,255,0.14)";
    ctx.lineWidth = 1.2;
    strokeRoundedRect(x, y, w, h, 13);
    drawClubPoolButton(x + 4, y + 4, (w - 12) / 2, h - 8, "UCL", !mlsActive, () => setClubPool("ucl"));
    drawClubPoolButton(x + 8 + (w - 12) / 2, y + 4, (w - 12) / 2, h - 8, "MLS", mlsActive, () => setClubPool("mls"));
  }

  function drawClubPoolButton(x, y, w, h, label, active, action) {
    drawRoundedRect(x, y, w, h, 10, active ? "rgba(245,199,95,0.92)" : "rgba(247,251,255,0.045)");
    ctx.fillStyle = active ? "#101820" : "#f7fbff";
    ctx.font = "900 12px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, x + w / 2, y + 19);
    ctx.textAlign = "left";
    addHitbox(`club-pool-${label.toLowerCase()}`, x, y, w, h, action);
  }

  function drawDifficultySelector(x, y, w, h) {
    drawRoundedRect(x, y, w, h, 13, "rgba(247,251,255,0.08)");
    ctx.strokeStyle = "rgba(245,199,95,0.42)";
    ctx.lineWidth = 1.3;
    strokeRoundedRect(x, y, w, h, 13);
    ctx.fillStyle = "rgba(247,251,255,0.62)";
    ctx.font = "800 11px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("DIFFICULTY", x + 16, y + 22);
    ctx.fillStyle = "#f5c75f";
    ctx.font = "900 14px Inter, system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(difficultyName(), x + w - 16, y + 23);
    ctx.textAlign = "left";
    addHitbox("difficulty-selector", x, y, w, h, () => cycleDifficulty());
  }

  function drawMenuBackground() {
    const grad = ctx.createLinearGradient(0, 0, VIEW.w, VIEW.h);
    grad.addColorStop(0, "#071217");
    grad.addColorStop(0.55, "#0d2430");
    grad.addColorStop(1, "#11241c");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, VIEW.w, VIEW.h);

    const fieldGrad = ctx.createRadialGradient(640, 420, 120, 640, 420, 620);
    fieldGrad.addColorStop(0, "rgba(35, 144, 102, 0.32)");
    fieldGrad.addColorStop(1, "rgba(8, 14, 18, 0)");
    ctx.fillStyle = fieldGrad;
    ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  }

  function drawTeamCards() {
    const teams = menuTeamPool();
    const selectedIndex = menuSelectedIndex();
    const cardW = 132;
    const cardH = 98;
    const gap = 12;
    const pageSize = 8;
    const pageStart = Math.floor(selectedIndex / pageSize) * pageSize;
    const pageTeams = teams.slice(pageStart, pageStart + pageSize);
    const startX = 86;
    const y = 174;
    if (teams.length > pageSize) {
      const page = Math.floor(selectedIndex / pageSize) + 1;
      const pages = Math.ceil(teams.length / pageSize);
      drawTeamPageButton(36, y + 28, "<", () => {
        const nextPageStart = (pageStart - pageSize + teams.length) % teams.length;
        setMenuSelectedIndex(nextPageStart);
      });
      drawTeamPageButton(1238, y + 28, ">", () => {
        setMenuSelectedIndex((pageStart + pageSize) % teams.length);
      });
      ctx.fillStyle = "rgba(247,251,255,0.5)";
      ctx.font = "800 10.5px Inter, system-ui, sans-serif";
      ctx.textAlign = "right";
      const label = state.menuMode === "world" ? "NATIONS" : "CLUBS";
      ctx.fillText(`${label} ${pageStart + 1}-${pageStart + pageTeams.length} / ${teams.length}  PAGE ${page}/${pages}`, 1214, y - 10);
      ctx.textAlign = "left";
    }
    for (let slot = 0; slot < pageTeams.length; slot += 1) {
      const i = pageStart + slot;
      const team = pageTeams[slot];
      const visibleX = startX + slot * (cardW + gap);
      const selected = i === selectedIndex;
      drawRoundedRect(visibleX, y, cardW, cardH, 14, selected ? "rgba(247,251,255,0.14)" : "rgba(247,251,255,0.075)");
      ctx.strokeStyle = selected ? team.colors[2] : "rgba(247,251,255,0.14)";
      ctx.lineWidth = selected ? 3 : 1;
      strokeRoundedRect(visibleX, y, cardW, cardH, 14);

      drawCrest(visibleX + 14, y + 16, 45, 53, team, selected ? 1 : 0.85);
      ctx.fillStyle = "#f7fbff";
      ctx.font = "800 19px Inter, system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(team.short, visibleX + 68, y + 38);
      ctx.fillStyle = "rgba(247,251,255,0.62)";
      ctx.font = "600 11px Inter, system-ui, sans-serif";
      fillFittedText(state.menuMode === "world" ? "NATION" : countryCode(team.country), visibleX + 68, y + 56, 56);
      drawPowerBar(visibleX + 14, y + 78, cardW - 28, 8, teamPower(team), team.colors);
      addHitbox(`team-${i}`, visibleX, y, cardW, cardH, () => {
        setMenuSelectedIndex(i);
      });
    }
  }

  function drawTeamPageButton(x, y, label, action) {
    drawRoundedRect(x, y, 34, 42, 12, "rgba(247,251,255,0.08)");
    ctx.strokeStyle = "rgba(247,251,255,0.14)";
    ctx.lineWidth = 1.2;
    strokeRoundedRect(x, y, 34, 42, 12);
    ctx.fillStyle = "#f5c75f";
    ctx.font = "900 18px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, x + 17, y + 27);
    ctx.textAlign = "left";
    addHitbox(`team-page-${label}`, x, y, 34, 42, action);
  }

  function drawSelectedTeamPanel(team, opponent) {
    const x = 68;
    const y = 286;
    const w = 558;
    const h = 330;
    drawGlassPanel(x, y, w, h);
    drawCrest(x + 28, y + 28, 94, 112, team, 1);
    const dialX = x + w - 80;
    const dialY = y + 64;
    const dialR = 40;
    const headingMax = dialX - dialR - (x + 146) - 18;
    ctx.fillStyle = "#f7fbff";
    ctx.font = "900 36px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    fillFittedText(team.name, x + 146, y + 62, headingMax);
    ctx.font = "700 14px Inter, system-ui, sans-serif";
    ctx.fillStyle = "rgba(247,251,255,0.68)";
    fillFittedText(`${team.country}  |  ${team.tactic}`, x + 148, y + 88, headingMax);
    drawRatingDial(dialX, dialY, dialR, teamPower(team), team.colors);
    ctx.fillStyle = "rgba(247,251,255,0.7)";
    ctx.font = "700 12px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("TEAM", dialX, y + 124);

    ctx.textAlign = "left";
    ctx.font = "800 15px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#f5c75f";
    ctx.fillText("Starting five", x + 30, y + 170);

    team.players.forEach((player, index) => {
      const rowY = y + 201 + index * 23;
      ctx.fillStyle = index % 2 === 0 ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.02)";
      drawRoundedRect(x + 26, rowY - 16, w - 52, 21, 8, ctx.fillStyle);
      ctx.fillStyle = "rgba(247,251,255,0.64)";
      ctx.font = "800 11px Inter, system-ui, sans-serif";
      ctx.fillText(player.role, x + 42, rowY);
      ctx.fillStyle = "#f7fbff";
      ctx.font = "700 13px Inter, system-ui, sans-serif";
      ctx.fillText(player.name, x + 82, rowY);
      ctx.fillStyle = team.colors[2];
      ctx.font = "900 13px Inter, system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(String(player.rating), x + w - 46, rowY);
      ctx.textAlign = "left";
    });

  }

  function drawPlayerCareerPanel(team, opponent) {
    const x = 68;
    const y = 296;
    const w = 558;
    const h = 320;
    const chosen = team.players[state.careerPlayerIndex] || team.players[team.players.length - 1];
    drawGlassPanel(x, y, w, h);
    drawCrest(x + 26, y + 24, 78, 94, team, 1);
    ctx.fillStyle = "#f7fbff";
    ctx.font = "900 30px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Player Career", x + 128, y + 52);
    ctx.font = "700 14px Inter, system-ui, sans-serif";
    ctx.fillStyle = "rgba(247,251,255,0.66)";
    ctx.fillText(`${team.name} academy contract`, x + 130, y + 78);

    ctx.font = "800 13px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#f5c75f";
    ctx.fillText("Choose your pro", x + 30, y + 138);

    team.players.forEach((player, index) => {
      const rowY = y + 168 + index * 28;
      const active = index === state.careerPlayerIndex;
      drawRoundedRect(x + 26, rowY - 19, w - 52, 25, 9, active ? "rgba(245,199,95,0.18)" : "rgba(255,255,255,0.045)");
      ctx.strokeStyle = active ? team.colors[2] : "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1;
      strokeRoundedRect(x + 26, rowY - 19, w - 52, 25, 9);
      ctx.fillStyle = active ? "#f5c75f" : "rgba(247,251,255,0.68)";
      ctx.font = "900 11px Inter, system-ui, sans-serif";
      ctx.fillText(player.role, x + 44, rowY - 1);
      ctx.fillStyle = "#f7fbff";
      ctx.font = "800 13px Inter, system-ui, sans-serif";
      ctx.fillText(player.name, x + 84, rowY - 1);
      ctx.fillStyle = active ? "#f5c75f" : "rgba(247,251,255,0.75)";
      ctx.textAlign = "right";
      ctx.fillText(`${player.rating} OVR`, x + w - 46, rowY - 1);
      ctx.textAlign = "left";
      addHitbox(`career-player-${index}`, x + 26, rowY - 19, w - 52, 25, () => {
        state.careerPlayerIndex = index;
      });
    });

    const rx = 678;
    const rw = 536;
    drawGlassPanel(rx, y, rw, h);
    drawPlayerCard(rx + 36, y + 36, 168, 236, team, chosen);
    ctx.fillStyle = "#f7fbff";
    ctx.font = "900 29px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(chosen.name, rx + 230, y + 58);
    ctx.font = "800 15px Inter, system-ui, sans-serif";
    ctx.fillStyle = "rgba(247,251,255,0.72)";
    ctx.fillText(`${chosen.role}  |  #${chosen.number}  |  ${chosen.trait}`, rx + 232, y + 86);
    drawCareerObjective(rx + 232, y + 122, "Match XP", "Goals, assists, passes, tackles, and touches raise your overall.");
    drawCareerObjective(rx + 232, y + 176, "Control Lock", "You play only this footballer while your team AI supports you.");
    if (hasSavedCareer("player")) {
      drawButton(rx + 232, y + 232, 244, 42, "Continue Career", () => continueSavedCareer("player"), true);
      drawButton(rx + 232, y + 282, 244, 34, "New Player Career", () => beginPlayerCareer(), false);
    } else {
      drawButton(rx + 232, y + 244, 244, 48, "Begin Player Career", () => beginPlayerCareer(), true);
      ctx.fillStyle = "rgba(247,251,255,0.52)";
      ctx.font = "700 12px Inter, system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`Next opponent preview: ${opponent.short}`, rx + 232, y + 312);
    }
  }

  function drawClubCareerPanel(team, opponent) {
    const x = 68;
    const y = 296;
    const w = 558;
    const h = 320;
    drawGlassPanel(x, y, w, h);
    drawCrest(x + 28, y + 26, 102, 122, team, 1);
    ctx.fillStyle = "#f7fbff";
    ctx.font = "900 32px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Club Career", x + 156, y + 58);
    ctx.font = "700 14px Inter, system-ui, sans-serif";
    ctx.fillStyle = "rgba(247,251,255,0.66)";
    ctx.fillText(`${clubLeagueNameForTeam(state.selectedTeam)} ${clubLeagueIndicesForTeam(state.selectedTeam).length}-game season`, x + 158, y + 84);
    drawRatingDial(x + 466, y + 70, 52, teamPower(team), team.colors);
    ctx.fillStyle = "rgba(247,251,255,0.68)";
    ctx.font = "800 12px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SQUAD", x + 466, y + 138);

    drawClubMetric(x + 34, y + 182, 150, "Budget", "$72M", team.colors[2]);
    drawClubMetric(x + 204, y + 182, 150, "Reputation", "72", "#8bdcd3");
    drawClubMetric(x + 374, y + 182, 150, "Sharpness", "+0", "#f5c75f");
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(247,251,255,0.62)";
    ctx.font = "700 13px Inter, system-ui, sans-serif";
    wrapText(`League-only fixtures against ${clubLeagueNameForTeam(state.selectedTeam)} clubs. Win to grow budget and sharpen your squad.`, x + 34, y + 276, 500, 16, 2);

    const rx = 678;
    const rw = 536;
    drawGlassPanel(rx, y, rw, h);
    ctx.fillStyle = "rgba(247,251,255,0.72)";
    ctx.font = "900 13px Inter, system-ui, sans-serif";
    ctx.fillText("BOARD EXPECTATIONS", rx + 36, y + 40);
    ctx.fillStyle = "#f7fbff";
    ctx.font = "900 30px Inter, system-ui, sans-serif";
    ctx.fillText("Build a dynasty", rx + 36, y + 78);
    drawVersusMiniPitch(rx + 36, y + 102, rw - 72, 112, team, opponent);
    if (hasSavedCareer("club")) {
      drawButton(rx + 36, y + 244, 224, 48, "Continue Season", () => continueSavedCareer("club"), true);
      drawButton(rx + 286, y + 244, 202, 48, "New Club Career", () => beginClubCareer(), false);
    } else {
      drawCareerObjective(rx + 38, y + 240, "Training", "Spend budget between matches for permanent squad sharpness.");
      drawButton(rx + 286, y + 244, 202, 48, "Begin Club Career", () => beginClubCareer(), true);
    }
    ctx.fillStyle = "rgba(247,251,255,0.52)";
    ctx.font = "700 12px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(hasSavedCareer("club") ? `Saved: ${state.savedProgress.savedLabel}` : `Opening fixture preview: ${team.short} vs ${opponent.short}`, rx + 36, y + 312);
  }

  function drawStartPanel(team, opponent) {
    const x = 678;
    const y = 286;
    const w = 536;
    const h = 330;
    drawGlassPanel(x, y, w, h);

    ctx.fillStyle = "rgba(247,251,255,0.72)";
    ctx.font = "800 13px Inter, system-ui, sans-serif";
    ctx.fillText("MATCHUP", x + 34, y + 38);
    ctx.fillStyle = "#f7fbff";
    ctx.font = "900 34px Inter, system-ui, sans-serif";
    ctx.fillText(`${team.short}  vs  ${opponent.short}`, x + 34, y + 78);

    drawVersusMiniPitch(x + 34, y + 104, w - 68, 112, team, opponent);

    drawButton(x + 34, y + 238, 182, 48, `Difficulty: ${difficultyName()}`, () => cycleDifficulty(), false);
    drawButton(x + 228, y + 238, 142, 48, "Quick Match", () => startFreePlayMatch("quick"), false);
    drawButton(x + 382, y + 238, 120, 48, "Normal Match", () => startFreePlayMatch("match"), true);
    drawFieldCreatorButton(x + 34, y + 294, w - 68, 34, team);
  }

  function drawFieldCreatorButton(x, y, w, h, team) {
    const design = activeFieldDesign();
    const theme = fieldThemeFor(team);
    const hover = pointer.x >= x && pointer.x <= x + w && pointer.y >= y && pointer.y <= y + h;
    drawRoundedRect(x, y, w, h, 12, hover ? "rgba(247,251,255,0.16)" : "rgba(247,251,255,0.08)");
    ctx.strokeStyle = hover ? "rgba(245,199,95,0.42)" : "rgba(247,251,255,0.16)";
    ctx.lineWidth = 1.2;
    strokeRoundedRect(x, y, w, h, 12);

    ctx.fillStyle = "rgba(247,251,255,0.62)";
    ctx.font = "900 10px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("FIELD COLORS", x + 14, y + 21);
    ctx.fillStyle = "#f7fbff";
    ctx.font = "900 13px Inter, system-ui, sans-serif";
    fillFittedText(design.name, x + 118, y + 21, 160);

    const previewX = x + w - 162;
    const previewY = y + 7;
    for (let i = 0; i < 6; i += 1) {
      ctx.fillStyle = i % 2 === 0 ? theme.stripeA : theme.stripeB;
      ctx.fillRect(previewX + i * 18, previewY, 18, 20);
    }
    ctx.strokeStyle = theme.line;
    ctx.lineWidth = 1.1;
    ctx.strokeRect(previewX, previewY, 108, 20);
    team.colors.slice(0, 3).forEach((color, index) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x + w - 36 + index * 13, y + h / 2, 4.5, 0, Math.PI * 2);
      ctx.fill();
    });
    addHitbox("field-colors", x, y, w, h, () => cycleFieldDesign());
  }

  function drawWorldCupStartPanel(team, opponent) {
    const x = 678;
    const y = 286;
    const w = 536;
    const h = 330;
    drawGlassPanel(x, y, w, h);

    ctx.fillStyle = "rgba(247,251,255,0.72)";
    ctx.font = "800 13px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("WORLD CUP", x + 34, y + 38);
    ctx.fillStyle = "#f7fbff";
    ctx.font = "900 34px Inter, system-ui, sans-serif";
    ctx.fillText(`${team.short} knockout run`, x + 34, y + 78);

    drawVersusMiniPitch(x + 34, y + 104, w - 68, 112, team, opponent);
    if (hasSavedWorldCup()) {
      drawButton(x + 34, y + 238, 226, 48, "Continue Tournament", () => continueSavedWorldCup(), true);
      drawButton(x + 286, y + 238, 216, 48, "New World Cup", () => beginWorldCup(), false);
    } else {
      drawCareerObjective(x + 34, y + 240, "Single elimination", "Win to advance. Lose once and you are out.");
      drawButton(x + 286, y + 238, 216, 48, "Start World Cup", () => beginWorldCup(), true);
    }
    drawFieldCreatorButton(x + 34, y + 288, w - 68, 28, team);
    ctx.textAlign = "left";
  }

  function drawControlsStrip() {
    const x = 68;
    const y = 646;
    const w = 1146;
    const labels = [
      "WASD / arrows move",
      "Space shoot / tackle",
      "E pass",
      "Tab switch",
      "Shift sprint",
      "P pause",
      "F fullscreen",
    ];
    drawRoundedRect(x, y, w, 42, 16, "rgba(247,251,255,0.07)");
    ctx.strokeStyle = "rgba(247,251,255,0.12)";
    ctx.lineWidth = 1;
    strokeRoundedRect(x, y, w, 42, 16);
    ctx.textAlign = "center";
    labels.forEach((label, index) => {
      const segmentW = w / labels.length;
      ctx.fillStyle = index % 2 === 0 ? "rgba(245,199,95,0.95)" : "rgba(247,251,255,0.86)";
      ctx.font = "800 12px Inter, system-ui, sans-serif";
      ctx.fillText(label, x + segmentW * index + segmentW / 2, y + 27);
    });
  }

  function drawVersusMiniPitch(x, y, w, h, home, away) {
    drawRoundedRect(x, y, w, h, 16, "rgba(15, 77, 49, 0.78)");
    ctx.strokeStyle = "rgba(247,251,255,0.25)";
    ctx.lineWidth = 2;
    strokeRoundedRect(x, y, w, h, 16);
    ctx.strokeStyle = "rgba(247,251,255,0.18)";
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + 10);
    ctx.lineTo(x + w / 2, y + h - 10);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, 32, 0, Math.PI * 2);
    ctx.stroke();
    drawCrest(x + 34, y + 24, 58, 70, home, 1);
    drawCrest(x + w - 92, y + 24, 58, 70, away, 1);
    ctx.font = "900 24px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = home.colors[2];
    ctx.fillText(String(teamPower(home)), x + 148, y + 65);
    ctx.fillStyle = away.colors[2];
    ctx.fillText(String(teamPower(away)), x + w - 148, y + 65);
  }

  function drawPlayerCard(x, y, w, h, team, player) {
    const grad = ctx.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, team.colors[2]);
    grad.addColorStop(0.35, team.colors[0]);
    grad.addColorStop(1, team.colors[1]);
    drawRoundedRect(x, y, w, h, 18, grad);
    ctx.strokeStyle = "rgba(255,255,255,0.58)";
    ctx.lineWidth = 2;
    strokeRoundedRect(x, y, w, h, 18);
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.beginPath();
    ctx.moveTo(x + 18, y + h - 36);
    ctx.lineTo(x + w - 18, y + 34);
    ctx.lineTo(x + w - 18, y + h - 18);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = readableTextColor(team.colors[0]);
    ctx.font = "900 42px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(String(player.rating), x + 18, y + 52);
    ctx.font = "900 17px Inter, system-ui, sans-serif";
    ctx.fillText(player.role, x + 20, y + 78);
    drawCrest(x + w - 66, y + 18, 44, 54, team, 0.96);

    ctx.fillStyle = "rgba(255,255,255,0.24)";
    ctx.beginPath();
    ctx.arc(x + w / 2, y + 116, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = readableTextColor(team.colors[1]);
    ctx.font = "900 58px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(lastName(player.name).slice(0, 1), x + w / 2, y + 136);

    ctx.fillStyle = readableTextColor(team.colors[1]);
    ctx.font = "900 14px Inter, system-ui, sans-serif";
    ctx.fillText(lastName(player.name), x + w / 2, y + h - 54);
    ctx.font = "800 11px Inter, system-ui, sans-serif";
    ctx.fillText(player.trait.toUpperCase(), x + w / 2, y + h - 31);
  }

  function drawCareerObjective(x, y, title, body) {
    drawRoundedRect(x, y, 248, 42, 12, "rgba(247,251,255,0.07)");
    ctx.fillStyle = "#f5c75f";
    ctx.font = "900 12px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(title, x + 14, y + 17);
    ctx.fillStyle = "rgba(247,251,255,0.7)";
    ctx.font = "700 10.5px Inter, system-ui, sans-serif";
    wrapText(body, x + 14, y + 32, 220, 12, 2);
  }

  function drawClubMetric(x, y, w, label, value, color) {
    drawRoundedRect(x, y, w, 66, 14, "rgba(247,251,255,0.07)");
    ctx.fillStyle = "rgba(247,251,255,0.62)";
    ctx.font = "800 12px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(label, x + 16, y + 22);
    ctx.fillStyle = color;
    ctx.font = "900 27px Inter, system-ui, sans-serif";
    ctx.fillText(value, x + 16, y + 52);
  }

  function drawStadium() {
    const theme = fieldThemeFor();
    const grad = ctx.createLinearGradient(0, 0, 0, VIEW.h);
    grad.addColorStop(0, theme.stadiumTop);
    grad.addColorStop(0.42, theme.stadiumMid);
    grad.addColorStop(1, theme.stadiumBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, VIEW.w, VIEW.h);

    for (let row = 0; row < 5; row += 1) {
      const y = 20 + row * 17;
      const alpha = 0.12 - row * 0.013;
      ctx.fillStyle = `rgba(247,251,255,${alpha})`;
      for (let x = 20 + (row % 2) * 9; x < VIEW.w; x += 18) {
        ctx.fillRect(x, y, 5, 4);
      }
    }

    const light = ctx.createRadialGradient(FIELD.cx, 80, 80, FIELD.cx, 210, 760);
    light.addColorStop(0, theme.light);
    light.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, VIEW.w, 430);
  }

  function drawPitch() {
    const theme = fieldThemeFor();
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.55)";
    ctx.shadowBlur = 24;
    drawRoundedRect(FIELD.x - 8, FIELD.y - 8, FIELD.w + 16, FIELD.h + 16, 28, theme.border);
    ctx.shadowBlur = 0;

    for (let i = 0; i < 12; i += 1) {
      const stripeW = FIELD.w / 12;
      ctx.fillStyle = i % 2 === 0 ? theme.stripeA : theme.stripeB;
      ctx.fillRect(FIELD.x + i * stripeW, FIELD.y, stripeW + 1, FIELD.h);
    }

    const mow = ctx.createLinearGradient(FIELD.x, FIELD.y, FIELD.x, FIELD.y + FIELD.h);
    mow.addColorStop(0, "rgba(255,255,255,0.05)");
    mow.addColorStop(0.5, "rgba(255,255,255,0)");
    mow.addColorStop(1, "rgba(0,0,0,0.12)");
    ctx.fillStyle = mow;
    ctx.fillRect(FIELD.x, FIELD.y, FIELD.w, FIELD.h);

    ctx.strokeStyle = theme.line;
    ctx.lineWidth = 3;
    ctx.strokeRect(FIELD.x, FIELD.y, FIELD.w, FIELD.h);
    ctx.beginPath();
    ctx.moveTo(FIELD.cx, FIELD.y);
    ctx.lineTo(FIELD.cx, FIELD.y + FIELD.h);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(FIELD.cx, FIELD.cy, 78, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(FIELD.cx, FIELD.cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = theme.center;
    ctx.fill();

    drawBox(FIELD.x, FIELD.cy, 160, 248, "left", theme.boxLine);
    drawBox(FIELD.x + FIELD.w, FIELD.cy, 160, 248, "right", theme.boxLine);
    drawGoal(FIELD.x - FIELD.goalDepth, FIELD.goalTop, FIELD.goalDepth, FIELD.goalW, "left", theme.boxLine, theme.goalFill);
    drawGoal(FIELD.x + FIELD.w, FIELD.goalTop, FIELD.goalDepth, FIELD.goalW, "right", theme.boxLine, theme.goalFill);
    ctx.restore();
  }

  function drawBox(x, y, depth, height, side, lineColor = "rgba(247,251,255,0.72)") {
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 3;
    const left = side === "left" ? x : x - depth;
    ctx.strokeRect(left, y - height / 2, depth, height);
    ctx.strokeRect(side === "left" ? x : x - 72, y - 80, 72, 160);
    ctx.beginPath();
    const arcX = side === "left" ? x + 112 : x - 112;
    ctx.arc(arcX, y, 48, side === "left" ? -Math.PI / 2 : Math.PI / 2, side === "left" ? Math.PI / 2 : Math.PI * 1.5);
    ctx.stroke();
  }

  function drawGoal(x, y, w, h, side, lineColor = "rgba(247,251,255,0.55)", fill = "rgba(247,251,255,0.08)") {
    ctx.save();
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    ctx.strokeStyle = "rgba(247,251,255,0.2)";
    for (let yy = y + 12; yy < y + h; yy += 16) {
      ctx.beginPath();
      ctx.moveTo(x, yy);
      ctx.lineTo(x + w, yy);
      ctx.stroke();
    }
    for (let xx = x + 8; xx < x + w; xx += 8) {
      ctx.beginPath();
      ctx.moveTo(xx, y);
      ctx.lineTo(xx, y + h);
      ctx.stroke();
    }
    const postX = side === "left" ? x + w : x;
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(postX, y);
    ctx.lineTo(postX, y + h);
    ctx.stroke();
    ctx.restore();
  }

  function drawPlayers() {
    const players = allPlayers().slice().sort((a, b) => a.y - b.y);
    for (const player of players) drawPlayer(player);
  }

  function drawPlayer(player) {
    const controlled = player.side === "home" && state.homePlayers[state.controlledIndex] === player;
    const hasBall = state.ball.owner === player;
    const colors = player.team.colors;

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.shadowColor = "rgba(0,0,0,0.38)";
    ctx.shadowBlur = 14;
    ctx.fillStyle = "rgba(0,0,0,0.34)";
    ctx.beginPath();
    ctx.ellipse(0, player.r + 8, player.r * 0.92, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    if (controlled || hasBall || player.flash > 0) {
      ctx.strokeStyle = controlled ? "#f5c75f" : hasBall ? "#ffffff" : colors[2];
      ctx.lineWidth = controlled ? 4 : 3;
      ctx.globalAlpha = 0.95;
      ctx.beginPath();
      ctx.arc(0, 0, player.r + 7 + Math.sin(state.crowdPulse * 8) * 1.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    const bodyGrad = ctx.createLinearGradient(-player.r, -player.r, player.r, player.r);
    bodyGrad.addColorStop(0, colors[0]);
    bodyGrad.addColorStop(0.56, colors[0]);
    bodyGrad.addColorStop(0.57, colors[1]);
    bodyGrad.addColorStop(1, colors[1]);
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(0, 0, player.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = colors[2];
    ctx.stroke();

    ctx.fillStyle = readableTextColor(colors[0]);
    ctx.font = "900 12px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(player.number), 0, 1);

    const faceAngle = Math.atan2(player.facingY, player.facingX);
    ctx.fillStyle = colors[2];
    ctx.beginPath();
    ctx.arc(Math.cos(faceAngle) * (player.r + 2), Math.sin(faceAngle) * (player.r + 2), 4, 0, Math.PI * 2);
    ctx.fill();

    if (player.tackleTimer > 0) {
      ctx.strokeStyle = "rgba(245,199,95,0.78)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, player.r + 14, -0.4, 0.8);
      ctx.stroke();
    }

    if (controlled || hasBall) {
      ctx.textBaseline = "alphabetic";
      ctx.font = "800 11px Inter, system-ui, sans-serif";
      const label = `${lastName(player.name)} ${player.rating}`;
      const width = ctx.measureText(label).width + 18;
      drawRoundedRect(-width / 2, -player.r - 34, width, 20, 8, "rgba(6,13,17,0.72)");
      ctx.fillStyle = "#f7fbff";
      ctx.fillText(label, 0, -player.r - 20);
    }

    if (controlled) {
      drawStaminaBar(-23, player.r + 15, 46, 5, player.stamina);
    }
    ctx.restore();
  }

  function drawBallTrail() {
    for (const dot of state.trail) {
      ctx.globalAlpha = clamp(dot.life / 0.25, 0, 1) * 0.45;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawBall() {
    const ball = state.ball;
    ctx.save();
    ctx.translate(ball.x, ball.y);
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.ellipse(3, 9, 9, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.rotate(state.crowdPulse * 5 + ball.spin);
    ctx.fillStyle = "#f7fbff";
    ctx.beginPath();
    ctx.arc(0, 0, ball.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#101820";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-ball.r * 0.8, 0);
    ctx.lineTo(ball.r * 0.8, 0);
    ctx.moveTo(0, -ball.r * 0.8);
    ctx.lineTo(0, ball.r * 0.8);
    ctx.stroke();
    ctx.restore();
  }

  function drawParticles() {
    for (const particle of state.particles) {
      ctx.globalAlpha = clamp(particle.life, 0, 1);
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawScoreboard() {
    const x = 356;
    const y = 22;
    const w = 568;
    const h = 52;
    drawRoundedRect(x, y, w, h, 18, "rgba(6, 13, 17, 0.78)");
    ctx.strokeStyle = "rgba(247,251,255,0.16)";
    ctx.lineWidth = 1;
    strokeRoundedRect(x, y, w, h, 18);

    drawMiniBadge(x + 18, y + 10, state.homeTeam);
    drawMiniBadge(x + w - 50, y + 10, state.awayTeam);

    ctx.fillStyle = "#f7fbff";
    ctx.font = "900 20px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(state.homeTeam.short, x + 62, y + 32);
    ctx.textAlign = "right";
    ctx.fillText(state.awayTeam.short, x + w - 62, y + 32);

    ctx.textAlign = "center";
    ctx.font = "900 32px Inter, system-ui, sans-serif";
    ctx.fillText(`${state.score.home} - ${state.score.away}`, x + w / 2, y + 37);

    ctx.font = "800 13px Inter, system-ui, sans-serif";
    ctx.fillStyle = "rgba(247,251,255,0.7)";
    ctx.fillText(`${state.extraTime.active ? "ET " : ""}${formatTime(state.timeLeft)}`, x + w / 2, y + 14);

    const selected = state.homePlayers[state.controlledIndex];
    if (selected) {
      drawRoundedRect(42, 26, 252, 44, 14, "rgba(6,13,17,0.62)");
      ctx.fillStyle = "#f5c75f";
      ctx.font = "900 13px Inter, system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`${lastName(selected.name)}  ${selected.rating}`, 62, 53);
      drawStaminaBar(190, 45, 78, 8, selected.stamina);
    }

    const possession = state.ball.owner ? state.ball.owner.side : "loose";
    const possText = possession === "home" ? state.homeTeam.short : possession === "away" ? state.awayTeam.short : "Loose";
    drawRoundedRect(988, 26, 218, 44, 14, "rgba(6,13,17,0.62)");
    ctx.fillStyle = "rgba(247,251,255,0.72)";
    ctx.font = "800 12px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("POSSESSION", 1008, 43);
    ctx.fillStyle = "#f7fbff";
    ctx.font = "900 15px Inter, system-ui, sans-serif";
    ctx.fillText(possText, 1008, 61);
  }

  function drawMessage() {
    if (state.messageTimer <= 0 && state.mode !== "goal") return;
    const text = state.mode === "goal" ? state.message : state.message;
    const big = state.mode === "goal";
    ctx.save();
    ctx.textAlign = "center";
    ctx.font = big ? "900 76px Inter, system-ui, sans-serif" : "900 24px Inter, system-ui, sans-serif";
    const width = ctx.measureText(text).width + (big ? 78 : 44);
    const h = big ? 102 : 44;
    const x = VIEW.w / 2 - width / 2;
    const y = big ? 292 : 92;
    drawRoundedRect(x, y, width, h, 20, big ? "rgba(6,13,17,0.76)" : "rgba(6,13,17,0.62)");
    ctx.fillStyle = big ? "#f5c75f" : "#f7fbff";
    ctx.fillText(text, VIEW.w / 2, y + (big ? 70 : 29));
    if (big && state.lastScorerName) {
      ctx.fillStyle = "rgba(247,251,255,0.74)";
      ctx.font = "800 16px Inter, system-ui, sans-serif";
      ctx.fillText(lastName(state.lastScorerName), VIEW.w / 2, y + 92);
    }
    ctx.restore();
  }

  function isTouchLikeDevice() {
    const navTouch = typeof navigator !== "undefined" && navigator.maxTouchPoints > 0;
    const coarsePointer = typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)")?.matches;
    return touchInput.used || navTouch || coarsePointer;
  }

  function drawTouchPlayHints() {
    if (state.mode !== "play" || !isTouchLikeDevice()) return;
    ctx.save();
    if (touchInput.active) {
      const player = state.homePlayers[state.controlledIndex];
      const targetX = clamp(touchInput.x, FIELD.x + 24, FIELD.x + FIELD.w - 24);
      const targetY = clamp(touchInput.y, FIELD.y + 24, FIELD.y + FIELD.h - 24);
      if (player) {
        ctx.strokeStyle = "rgba(245,199,95,0.38)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(245,199,95,0.18)";
      ctx.beginPath();
      ctx.arc(targetX, targetY, 34 + Math.sin(state.crowdPulse * 9) * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(245,199,95,0.78)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(targetX, targetY, 18, 0, Math.PI * 2);
      ctx.stroke();
    }

    drawRoundedRect(468, 642, 344, 38, 16, "rgba(6,13,17,0.58)");
    ctx.fillStyle = "rgba(247,251,255,0.82)";
    ctx.font = "900 13px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Drag player to move  |  Tap to shoot", 640, 666);
    ctx.restore();
  }

  function drawPauseOverlay() {
    drawOverlayShade();
    drawRoundedRect(430, 238, 420, 208, 22, "rgba(10,22,26,0.9)");
    ctx.strokeStyle = "rgba(245,199,95,0.52)";
    ctx.lineWidth = 2;
    strokeRoundedRect(430, 238, 420, 208, 22);
    ctx.fillStyle = "#f7fbff";
    ctx.font = "900 40px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Paused", 640, 300);
    ctx.fillStyle = "rgba(247,251,255,0.68)";
    ctx.font = "700 16px Inter, system-ui, sans-serif";
    ctx.fillText("Press P or Enter to resume", 640, 336);
    drawButton(505, 370, 270, 48, "Resume", () => {
      state.mode = "play";
    }, true);
  }

  function drawEndOverlay() {
    drawOverlayShade();
    drawRoundedRect(396, 210, 488, 300, 24, "rgba(10,22,26,0.92)");
    ctx.strokeStyle = "rgba(245,199,95,0.55)";
    ctx.lineWidth = 2;
    strokeRoundedRect(396, 210, 488, 300, 24);
    ctx.textAlign = "center";
    ctx.fillStyle = "#f5c75f";
    ctx.font = "900 21px Inter, system-ui, sans-serif";
    ctx.fillText("FULL TIME", 640, 258);
    ctx.fillStyle = "#f7fbff";
    ctx.font = "900 40px Inter, system-ui, sans-serif";
    ctx.fillText(`${state.score.home} - ${state.score.away}`, 640, 314);
    ctx.font = "800 22px Inter, system-ui, sans-serif";
    ctx.fillText(state.winnerText, 640, 354);
    drawButton(452, 404, 172, 48, "Menu", () => {
      state.mode = "menu";
      pickOpponent();
    }, false);
    drawButton(656, 404, 172, 48, "Rematch", () => startFreePlayMatch(state.activeMatchKind), true);
  }

  function drawOverlayShade() {
    ctx.fillStyle = "rgba(0,0,0,0.42)";
    ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  }

  function drawButton(x, y, w, h, label, action, primary) {
    const hover = pointer.x >= x && pointer.x <= x + w && pointer.y >= y && pointer.y <= y + h;
    const fill = primary
      ? hover
        ? "rgba(245,199,95,0.98)"
        : "rgba(245,199,95,0.88)"
      : hover
        ? "rgba(247,251,255,0.16)"
        : "rgba(247,251,255,0.09)";
    drawRoundedRect(x, y, w, h, 14, fill);
    ctx.strokeStyle = primary ? "rgba(255,255,255,0.45)" : "rgba(247,251,255,0.18)";
    ctx.lineWidth = 1.5;
    strokeRoundedRect(x, y, w, h, 14);
    ctx.fillStyle = primary ? "#11161a" : "#f7fbff";
    ctx.font = "900 15px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, x + w / 2, y + h / 2 + 5);
    addHitbox(label, x, y, w, h, action);
  }

  function drawGlassPanel(x, y, w, h) {
    drawRoundedRect(x, y, w, h, 24, "rgba(8, 22, 26, 0.72)");
    const grad = ctx.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, "rgba(255,255,255,0.07)");
    grad.addColorStop(0.48, "rgba(255,255,255,0.018)");
    grad.addColorStop(1, "rgba(245,199,95,0.04)");
    ctx.fillStyle = grad;
    roundedPath(x, y, w, h, 24);
    ctx.fill();
    ctx.strokeStyle = "rgba(247,251,255,0.16)";
    ctx.lineWidth = 1.4;
    strokeRoundedRect(x, y, w, h, 24);
  }

  function drawCrest(x, y, w, h, team, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    const [primary, secondary, trim] = team.colors;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w, y + h * 0.2);
    ctx.lineTo(x + w * 0.86, y + h * 0.82);
    ctx.lineTo(x + w / 2, y + h);
    ctx.lineTo(x + w * 0.14, y + h * 0.82);
    ctx.lineTo(x, y + h * 0.2);
    ctx.closePath();
    ctx.fillStyle = primary;
    ctx.fill();
    ctx.clip();
    ctx.fillStyle = secondary;
    ctx.fillRect(x + w * 0.52, y - 4, w, h + 8);
    ctx.fillStyle = "rgba(255,255,255,0.14)";
    ctx.fillRect(x, y + h * 0.5, w, h * 0.22);
    ctx.restore();
    ctx.strokeStyle = trim;
    ctx.lineWidth = Math.max(2, w * 0.055);
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w, y + h * 0.2);
    ctx.lineTo(x + w * 0.86, y + h * 0.82);
    ctx.lineTo(x + w / 2, y + h);
    ctx.lineTo(x + w * 0.14, y + h * 0.82);
    ctx.lineTo(x, y + h * 0.2);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = readableTextColor(team.colors[0]);
    ctx.font = `900 ${Math.max(16, w * 0.34)}px Inter, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(team.short, x + w / 2, y + h * 0.52);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  }

  function drawMiniBadge(x, y, team) {
    drawCrest(x, y, 32, 34, team, 1);
  }

  function drawRatingDial(x, y, r, value, colors) {
    const pct = clamp(value / 100, 0, 1);
    ctx.save();
    ctx.translate(x, y);
    ctx.lineWidth = Math.max(7, r * 0.17);
    ctx.strokeStyle = "rgba(247,251,255,0.12)";
    ctx.beginPath();
    ctx.arc(0, 0, r, -Math.PI * 0.78, Math.PI * 0.78);
    ctx.stroke();
    ctx.strokeStyle = colors[2];
    ctx.beginPath();
    ctx.arc(0, 0, r, -Math.PI * 0.78, -Math.PI * 0.78 + Math.PI * 1.56 * pct);
    ctx.stroke();
    ctx.fillStyle = "#f7fbff";
    ctx.font = "900 30px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(value), 0, 11);
    ctx.restore();
  }

  function drawPowerBar(x, y, w, h, value, colors) {
    drawRoundedRect(x, y, w, h, h / 2, "rgba(247,251,255,0.14)");
    const fillW = w * clamp(value / 100, 0, 1);
    const grad = ctx.createLinearGradient(x, y, x + w, y);
    grad.addColorStop(0, colors[0]);
    grad.addColorStop(0.75, colors[1]);
    grad.addColorStop(1, colors[2]);
    drawRoundedRect(x, y, fillW, h, h / 2, grad);
  }

  function drawStaminaBar(x, y, w, h, value) {
    drawRoundedRect(x, y, w, h, h / 2, "rgba(247,251,255,0.2)");
    drawRoundedRect(x, y, w * clamp(value, 0, 1), h, h / 2, value > 0.25 ? "#8bdcd3" : "#f05d5e");
  }

  function drawRoundedRect(x, y, w, h, r, fillStyle) {
    ctx.fillStyle = fillStyle;
    roundedPath(x, y, w, h, Math.min(r, w / 2, h / 2));
    ctx.fill();
  }

  function strokeRoundedRect(x, y, w, h, r) {
    roundedPath(x, y, w, h, Math.min(r, w / 2, h / 2));
    ctx.stroke();
  }

  function roundedPath(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function readableTextColor(hex) {
    const raw = hex.replace("#", "");
    const r = parseInt(raw.slice(0, 2), 16);
    const g = parseInt(raw.slice(2, 4), 16);
    const b = parseInt(raw.slice(4, 6), 16);
    return r * 0.299 + g * 0.587 + b * 0.114 > 150 ? "#101820" : "#f7fbff";
  }

  function wrapText(text, x, y, maxWidth, lineHeight, maxLines = 3) {
    const words = text.split(" ");
    let line = "";
    let lines = 0;
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, y + lines * lineHeight);
        line = word;
        lines += 1;
        if (lines >= maxLines) return;
      } else {
        line = test;
      }
    }
    if (line && lines < maxLines) ctx.fillText(line, x, y + lines * lineHeight);
  }

  function fillFittedText(text, x, y, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) {
      ctx.fillText(text, x, y);
      return;
    }
    const suffix = "...";
    let clipped = text;
    while (clipped.length && ctx.measureText(`${clipped}${suffix}`).width > maxWidth) {
      clipped = clipped.slice(0, -1);
    }
    ctx.fillText(`${clipped.trimEnd()}${suffix}`, x, y);
  }

  function formatTime(seconds) {
    const total = Math.max(0, Math.ceil(seconds));
    const min = Math.floor(total / 60);
    const sec = String(total % 60).padStart(2, "0");
    return `${min}:${sec}`;
  }

  function lastName(name) {
    const parts = name.split(" ");
    return parts[parts.length - 1];
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      canvas.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  function renderGameToText() {
    const selected = state.homePlayers[state.controlledIndex];
    const possession = state.ball.owner
      ? `${state.ball.owner.side}:${state.ball.owner.name}`
      : "loose";
    const menuTeams = menuTeamPool();
    const payload = {
      mode: state.mode,
      coordinateSystem: "origin top-left; x increases right; y increases down; units are canvas pixels",
      field: FIELD,
      selectedMenuTeam: menuTeams[menuSelectedIndex()].name,
      menuMode: state.menuMode,
      selectedClubLeague: state.menuMode === "world" ? null : clubLeagueName(state.clubPool),
      selectedClubLeagueTeamCount: state.menuMode === "world" ? null : clubLeagueIndices(state.clubPool).length,
      teamCount: TEAMS.length,
      mlsTeamCount: MLS_TEAM_INDICES.length,
      worldTeamCount: WORLD_TEAMS.length,
      fieldDesign: activeFieldDesign(),
      trophyRoom: {
        count: state.trophies.length,
        latest: state.trophies.slice(0, 5).map((trophy) => ({
          title: trophy.title,
          team: trophy.teamName,
          type: trophy.type,
          wonAt: trophy.wonAt,
        })),
      },
      savedProgress: state.savedProgress,
      activeMatchKind: state.activeMatchKind,
      matchLength: state.matchLength,
      touchControls: {
        available: isTouchLikeDevice(),
        active: touchInput.active,
        used: touchInput.used,
        target: touchInput.active ? { x: round(touchInput.x), y: round(touchInput.y) } : null,
      },
      careerHubView: state.careerHubView,
      difficulty: {
        selected: difficultyName(state.difficulty),
        active: difficultyName(effectiveDifficultyIndex()),
        level: state.difficulty,
        activeLevel: effectiveDifficultyIndex(),
      },
      matchup: state.homeTeam
        ? `${state.homeTeam.name} vs ${state.awayTeam.name}`
        : `${menuTeams[menuSelectedIndex()].name} vs ${menuTeams[menuOpponentIndex()].name}`,
      career: state.career.active
        ? {
            type: state.career.type,
            fixture: state.career.fixture,
            record: `${state.career.wins}-${state.career.draws}-${state.career.losses}`,
            player:
              state.career.type === "player"
                ? {
                    name: state.career.playerName,
                    rating: Math.min(100, state.career.baseRating + state.career.ratingBoost),
                    xp: state.career.xp,
                    goals: state.career.goals,
                    assists: state.career.assists,
                  }
                : null,
            club:
              state.career.type === "club"
                ? {
                    budget: state.career.budget,
                    reputation: state.career.reputation,
                    sharpness: state.career.sharpness,
                    goalsFor: state.career.goalsFor,
                    goalsAgainst: state.career.goalsAgainst,
                    dynasty: summarizeDynasty(state.career),
                    season: summarizeClubSeason(state.career),
                    goatMashup: summarizeGoatMashup(state.career),
                  }
                : null,
            lastSummary: state.career.lastSummary,
          }
        : null,
      worldCup: state.worldCup.active ? summarizeWorldCup(state.worldCup) : null,
      score: state.score,
      timeLeft: round(state.timeLeft),
      extraTime: {
        active: state.extraTime.active,
        used: state.extraTime.used,
        seconds: state.extraTime.seconds,
      },
      penaltyShootout: state.penaltyShootout
        ? {
            context: state.penaltyShootout.context,
            complete: state.penaltyShootout.complete,
            score: `${state.penaltyShootout.homePens}-${state.penaltyShootout.awayPens}`,
            kicks: `${state.penaltyShootout.homeTaken}-${state.penaltyShootout.awayTaken}`,
            turn: state.penaltyShootout.turn,
            last: state.penaltyShootout.last,
            live: state.penaltyShootout.live
              ? {
                  progress: round(state.penaltyShootout.live.t / state.penaltyShootout.live.duration),
                  shotDirection: state.penaltyShootout.live.shotDirection,
                  keeperDirection: state.penaltyShootout.live.keeperDirection,
                  result: state.penaltyShootout.live.result,
                }
              : null,
          }
        : null,
      possession,
      selectedPlayer: selected
        ? {
            name: selected.name,
            role: selected.role,
            rating: selected.rating,
            x: round(selected.x),
            y: round(selected.y),
            stamina: round(selected.stamina),
          }
        : null,
      ball: {
        x: round(state.ball.x),
        y: round(state.ball.y),
        vx: round(state.ball.vx),
        vy: round(state.ball.vy),
        owner: state.ball.owner ? state.ball.owner.name : null,
      },
      home: state.homePlayers.map(playerText),
      away: state.awayPlayers.map(playerText),
      message: state.messageTimer > 0 || state.mode === "goal" ? state.message : "",
    };
    return JSON.stringify(payload);
  }

  function summarizeClubSeason(career) {
    if (!career.season) return null;
    return {
      stage: career.season.stage,
      league: career.season.league,
      leagueName: career.season.leagueName,
      leagueTeamCount: career.season.leagueTeamCount,
      playoffAdvanceCount: career.season.playoffAdvanceCount || playoffAdvanceCountForSeason(career.season),
      playoffRule: playoffRuleLabel(career.season),
      regularSeasonLength: career.season.regularSeasonLength,
      currentSeed: seedForTeam(career, career.teamIndex),
      champion: career.season.championIndex != null ? TEAMS[career.season.championIndex].name : null,
      standings: rankedStandings(career).map((row) => ({
        seed: row.seed,
        team: TEAMS[row.teamIndex].short,
        played: row.played,
        points: row.points,
        record: `${row.wins}-${row.draws}-${row.losses}`,
        gd: row.gd,
      })),
      playoff: summarizePlayoff(career),
    };
  }

  function summarizeDynasty(career) {
    return {
      year: career.year,
      championships: career.championships,
      playoffAppearances: career.playoffAppearances,
      goatTitles: career.goatTitles || 0,
      draftPicks: career.draftPicks,
      rosterSize: career.roster?.length || 0,
      squadPower: dynastyPower(career),
      selectedLineupRole: state.selectedLineupRole,
      selectedRoster: selectedRosterPlayer(career)
        ? {
            name: selectedRosterPlayer(career).name,
            role: selectedRosterPlayer(career).role,
            rating: selectedRosterPlayer(career).rating,
          }
        : null,
      starters: chooseStartingFive(career.roster || [], career.lineup).map((player, index) => ({
        name: player.name,
        role: ROLE_ORDER[index],
        naturalRole: player.role,
        rating: player.rating,
      })),
      tradeOffer: career.tradeOffers?.[0]
        ? {
            outgoing: career.tradeOffers[0].outgoingName,
            incoming: career.tradeOffers[0].incoming.name,
            cost: career.tradeOffers[0].cost,
          }
        : null,
      draftProspect: career.draftProspects?.[0]
        ? {
            name: career.draftProspects[0].name,
            role: career.draftProspects[0].role,
            rating: career.draftProspects[0].rating,
            potential: career.draftProspects[0].potential,
          }
        : null,
    };
  }

  function summarizePlayoff(career) {
    const playoff = career.season?.playoff;
    if (!playoff) return null;
    const summarizeMatch = (match) =>
      match
        ? {
            id: match.id,
            home: `#${match.homeSeed} ${TEAMS[match.homeTeam].short}`,
            away: `#${match.awaySeed} ${TEAMS[match.awayTeam].short}`,
            played: match.played,
            score: match.score,
            winner: match.winner != null ? TEAMS[match.winner].short : null,
          }
        : null;
    return {
      round: playoff.round,
      byes: (playoff.byes || []).map((row) => `#${row.seed} ${TEAMS[row.teamIndex].short}`),
      quarterfinals: (playoff.quarterfinals || []).map(summarizeMatch),
      semifinals: (playoff.semifinals || []).map(summarizeMatch),
      final: summarizeMatch(playoff.final),
    };
  }

  function summarizeWorldCup(cup) {
    const summarizeMatch = (match) => ({
      id: match.id,
      home: `#${match.homeSeed} ${WORLD_TEAMS[match.homeTeam].short}`,
      away: `#${match.awaySeed} ${WORLD_TEAMS[match.awayTeam].short}`,
      played: match.played,
      score: match.score,
      winner: match.winner != null ? WORLD_TEAMS[match.winner].short : null,
    });
    return {
      team: WORLD_TEAMS[cup.teamIndex].short,
      stage: worldCupStageLabel(cup),
      roundIndex: cup.roundIndex,
      eliminated: cup.eliminated,
      champion: cup.championIndex != null ? WORLD_TEAMS[cup.championIndex].short : null,
      noTrading: true,
      lastSummary: cup.lastSummary,
      rounds: cup.rounds.map((round) => ({
        label: round.label,
        matches: round.matches.map(summarizeMatch),
      })),
      currentMatch: currentWorldCupMatch() ? summarizeMatch(currentWorldCupMatch()) : null,
    };
  }

  function summarizeGoatMashup(career) {
    const mashup = career.goatMashup;
    if (!mashup) return null;
    const summarizeMatch = (match) =>
      match
        ? {
            id: match.id,
            home: goatTeamLabel(mashup, match.homeTeam),
            away: goatTeamLabel(mashup, match.awayTeam),
            played: match.played,
            score: match.score,
            winner: match.winner != null ? goatTeamLabel(mashup, match.winner) : null,
          }
        : null;
    return {
      round: mashup.round,
      champion: mashup.championIndex != null ? goatTeamLabel(mashup, mashup.championIndex) : null,
      qualifiers: mashup.qualifiers,
      entries: mashup.entries,
      semifinals: mashup.matches.map(summarizeMatch),
      final: summarizeMatch(mashup.final),
      lastSummary: mashup.lastSummary,
    };
  }

  function playerText(player) {
    return {
      name: player.name,
      role: player.role,
      rating: player.rating,
      x: round(player.x),
      y: round(player.y),
      hasBall: state.ball.owner === player,
      controlled: player.side === "home" && state.homePlayers[state.controlledIndex] === player,
    };
  }

  window.render_game_to_text = renderGameToText;
  window.advanceTime = (ms) => {
    const steps = Math.max(1, Math.round(ms / (1000 / 60)));
    for (let i = 0; i < steps; i += 1) update(1 / 60);
    draw();
    justPressed.clear();
    return renderGameToText();
  };

  function frame(timestamp) {
    const dt = lastTimestamp ? Math.min(0.033, (timestamp - lastTimestamp) / 1000) : 1 / 60;
    lastTimestamp = timestamp;
    update(dt);
    draw();
    justPressed.clear();
    requestAnimationFrame(frame);
  }

  pickOpponent();
  draw();
  requestAnimationFrame(frame);
})();
