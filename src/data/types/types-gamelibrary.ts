interface GameEntry {
  /*
  "game_id": 2,
  "path": "Kidsatthegamecenter1.05_MOD1",
  "title": "[Sakuragi Co] Moody Ichigo - Those Kids At the Game Center",
  "url": "https://f95zone.to/threads/moody-ichigo-those-kids-at-the-game-center-1-05_mod1-sakuragi-company.223836/",
  "image": "Moody Ichigo - Those Kids At the Game Center.jpg",
  "version": "1.05_MOD1",
  "description": "Everything changed when the mysterious 'Love Cupid' arrived on the scene, transforming the fiery girl who loved to fight into a charming sweetheart! As we continued our playful dates at the game center, the sparks flew, and things only grew more intense. The game includes 4 base animated scenes.",
  "program_path": "Player.exe",
  "protagonist": "Male",
  "tags": [
      "Animated",
      "Eroge",
      "Exhibitionism",
      "Gross",
      "Loli",
      "Shota"
  ],
  "status": [
      "Completed"
  ],
  "created_at": "2025-01-25 00:37:14",
  "played_at": null,
  "updated_at": null,
  "art": "Drawn",
  "engine": "RPGM",
  "genre": "Action",
  "play-status": "New"
  */
  game_id: number;
  path: string;
  title: string;
  url: string;
  image: string;
  version: string;
  description: string;
  program_path: string;
  protagonist: string;
  tags: string[];
  status: string[];
  created_at: string;
  played_at: string | null;
  updated_at: string | null;
  art: string;
  engine: string;
  genre: string;
  'play-status': string;
}
interface CategoryEntry {
  /*
  "category_id": 1,
  "category_name": "art",
  "options": [
    "Real Porn",
    "Text",
    "Pixel",
    "3D",
    "Drawn"
  ]
  */
  category_id: number;
  category_name: string;
  options: string[];
}
interface StatusEntry {
  /*
  "status_id": 1,
  "status_name": "Abandoned"
  */
  status_id: number;
  status_name: string;
}
interface TagEntry {
  /*
  "tag_id": 1,
  "tag_name": "Animated"
  */
 tag_id: number;
 tag_name: string;
}
interface StringMap {
  [key: string]: string;
}
export interface GamelibState {
  gamelib: GameEntry[];
  categories: CategoryEntry[];
  statuses: StatusEntry[];
  tags: TagEntry[];
  styleVars: StringMap;
  status: string;
  error: string | undefined;
}
