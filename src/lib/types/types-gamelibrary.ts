// helper type for objects of unknown length with {string: string} key-values
interface StringMap {
  [key: string]: string;
}

interface Timestamps {
  created_at: string;
  updated_at: string | null;
  played_at: string | null;
}
interface TimestampsSec {
  created_at: number;
  updated_at: number;
  played_at: number;
}
interface GameEntry {
  /*
  "game_id": 1,
  "path": "GamePath0",
  "title": "[ad eiusmod 0",
  "url": "https://itch.io",
  "image": ["game0.jpg"],
  "version": "81.60",
  "description": "Nulla elit esse officia anim cupidatat ullamco exercitation dolore officia fugiat do fugiat ipsum minim. In voluptate duis aute quis adipisicing qui consequat laborum. Fugiat dolor cillum. Laborum commodo quis deserunt ullamco fugiat elit irure laboris excepteur eiusmod culpa magna cupidatat. Consectetur aute in adipisicing sit qui ad. Fugiat fugiat proident culpa ut irure id. Cillum deserunt fugiat adipisicing duis. Ad irure deserunt anim.",
  "program_path": {
      "": "game.exe"
  },
  "tags": [
      "Animated",
      "Singleplayer",
      "Multiplayer",
      "Fantasy",
      "Cute",
      "Retro",
      "PvP",
      "Racing",
      "Mystery",
      "Horror",
      "Magic",
      "Building",
      "Atmospheric",
      "Turn-based"
  ],
  "status": [
      "Abandoned"
  ],
  "categories": {
      "protagonist": "Male",
      "art": "3D",
      "engine": "HTML",
      "genre": "Platformer",
      "play-status": "Playing"
  },
  "timestamps": {
      "created_at": "2024-10-04 17:35:05",
      "updated_at": null,
      "played_at": null
  },
  "timestamps_sec": {
      "created_at": 1728077705000,
      "updated_at": null,
      "played_at": null
  }
  */
  game_id: number;
  path: string;
  title: string;
  url: string;
  image: string[]; // if the array has length 2, the first item is an image and the second item is a gif
  version: string;
  description: string;
  program_path: StringMap;
  tags: string[];
  status: string[];
  categories: StringMap;
  timestamps: Timestamps;
  timestamps_sec: TimestampsSec;
}
interface SortedGamelib {
  recentlyPlayed: GameEntry[];
  recentlyAdded: GameEntry[];
  recentlyUpdated: GameEntry[];
  alphabetical: GameEntry[];
}
type SortOrders = keyof SortedGamelib
interface CategoryEntry {
  /*
  "category_id": 1,
  "category_name": "art",
  "options": [
    "Text",
    "Pixel",
    "3D",
    "Drawn"
  ],
  "default_option": "Text"
  */
  category_id: number;
  category_name: string;
  options: string[];
  default_option: string | null
  [key: string]: number | string | string[] | null;
}
interface StatusEntry {
  /*
  "status_id": 1,
  "status_name": "Abandoned",
  "status_priority": 1,
  "status_color": #000011,
  "status_color_applies_to": "title"
  */
  status_id: number;
  status_name: string;
  status_priority: number;
  status_color: string;
  status_color_applies_to: string;
  [key: string]: number | string;
}
interface TagEntry {
  /*
  "tag_id": 1,
  "tag_name": "Animated"
  */
  tag_id: number;
  tag_name: string;
  [key: string]: number | string;
}
interface SearchRestraints {
  include: {
    tags: string[];
    status: string[];
    categories: StringMap;
  };
  exclude: {
    tags: string[];
    status: string[];
    categories: StringMap;
  };
}
interface SettingsType {
  games_folder: string;
  locale_emulator: string;
  file_types: {
    Images: string[];
    Executables: string[];
    [key: string]: string[];
  };
  ignored_exes: string[];
  site_scrapers: {
    base_url: string;
    selectors: {
      type: string; // title/description/version/tags | category_<cat_name>/status
      selector: string; // the selector to pass to document.querySelectorAll
      queryAll: boolean; // whether to only look at the first matched result or all of them
      regex: string | null; // if type is tags: if queryAll, will be run on all SELECTOR matches and returns an array of strings if the string.length > 0; otherwise, returns an array of the matches of the pattern
                            // else: if queryAll, will be run on all SELECTOR matches and return the first regexMatch; otherwise, just returns the regexMatch of the textcontent
      limit_text: boolean; // if true, will only get text from the SELECTOR element. Otherwise, gets text from the SELECTOR and all its children
      remove_regex: string | null; // run against the regex match(es), removes the matching text
    }[];
  }[];
  site_scraper_aliases: {
    tags: {
      [base_url: string]: [string, string][];
    };
    categories: {
      [base_url: string]: [string, string][];
    };
    statuses: {
      [base_url: string]: [string, string][];
    };
    [key: string]: {[base_url: string]: [string, string][]};
  };
  [key: string]: string | string[] | {[key: string]: string[] | {[base_url: string]: [string, string][]}} | {
    base_url: string;
    selectors: {
      type: string;
      selector: string;
      queryAll: boolean;
      regex: string | null;
      limit_text: boolean;
      remove_regex: string | null;
    }[];
  }[];
}
type MissingGamesType = {
  game_id: number,
  title: string,
  path: string
}[]
interface DislikedGamesType {
  dislike_id: number,
  game_title: string,
  dislike_reason: string
}
interface GamelibState {
  gamelib: GameEntry[];
  editGame: { [K in keyof GameEntry]?: GameEntry[K] } | null;
  editGameType: 'edit' | 'update' | 'new';
  missingGames: MissingGamesType;
  newGames: string[];
  dislikedGames: DislikedGamesType[];
  sortedGamelib: SortedGamelib;
  sortOrder: SortOrders;
  searchRestraints: SearchRestraints;
  categories: CategoryEntry[];
  statuses: StatusEntry[];
  tags: TagEntry[];
  styleVars: StringMap;
  settings: SettingsType;
  status: string;
  error: string | undefined;
}

export {
  StringMap,
  GamelibState,
  GameEntry,
  Timestamps,
  CategoryEntry,
  StatusEntry,
  TagEntry,
  SearchRestraints,
  SettingsType,
  MissingGamesType,
  DislikedGamesType,
}
