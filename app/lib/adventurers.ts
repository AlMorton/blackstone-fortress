/** The twelve explorers, ported from Models/AdventurersConstants.cs. */
export const ADVENTURERS = [
  "Janus Drake",
  "Espern Locarno",
  "Taddeus The Purifier",
  "Pious Vorne",
  "Amallyn Shadowguide",
  "Dahyak Grekh",
  "UR-025",
  "Rein & Raus",
  "Neyam Shai Murad",
  "Gotfret de Montbard",
  "Aradia Madellan",
  "Daedalosus",
] as const;

export type AdventurerName = (typeof ADVENTURERS)[number];
