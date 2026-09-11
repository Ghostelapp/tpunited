export const EQUIPMENT_ART = [
  {
    "id": "rusty-fang",
    "name": "Rusty Fang",
    "image": "/assets/equipment/rusty-fang.svg",
    "slot": "weapon",
    "rarity": "common",
    "damage": 5,
    "armor": 0,
    "minLevel": 1,
    "description": "Rusty Fang: reclaimed wasteland equipment from Trash Town."
  },
  {
    "id": "scrap-hammer",
    "name": "Scrap Hammer",
    "image": "/assets/equipment/scrap-hammer.svg",
    "slot": "weapon",
    "rarity": "epic",
    "damage": 20,
    "armor": 0,
    "minLevel": 1,
    "description": "Scrap Hammer: reclaimed wasteland equipment from Trash Town."
  },
  {
    "id": "neon-blaster",
    "name": "Neon Blaster",
    "image": "/assets/equipment/neon-blaster.svg",
    "slot": "weapon",
    "rarity": "rare",
    "damage": 12,
    "armor": 0,
    "minLevel": 1,
    "description": "Neon Blaster: reclaimed wasteland equipment from Trash Town."
  },
  {
    "id": "wasteland-wrench",
    "name": "Wasteland Wrench",
    "image": "/assets/equipment/wasteland-wrench.svg",
    "slot": "weapon",
    "rarity": "uncommon",
    "damage": 8,
    "armor": 0,
    "minLevel": 1,
    "description": "Wasteland Wrench: reclaimed wasteland equipment from Trash Town."
  },
  {
    "id": "scavenger-hood",
    "name": "Scavenger Hood",
    "image": "/assets/equipment/scavenger-hood.svg",
    "slot": "armor",
    "rarity": "rare",
    "damage": 0,
    "armor": 4,
    "minLevel": 1,
    "description": "Scavenger Hood: reclaimed wasteland equipment from Trash Town."
  },
  {
    "id": "salvager-vest",
    "name": "Salvager Vest",
    "image": "/assets/equipment/salvager-vest.svg",
    "slot": "armor",
    "rarity": "common",
    "damage": 0,
    "armor": 2,
    "minLevel": 1,
    "description": "Salvager Vest: reclaimed wasteland equipment from Trash Town."
  },
  {
    "id": "iron-boots",
    "name": "Iron Boots",
    "image": "/assets/equipment/iron-boots.svg",
    "slot": "armor",
    "rarity": "uncommon",
    "damage": 0,
    "armor": 3,
    "minLevel": 1,
    "description": "Iron Boots: reclaimed wasteland equipment from Trash Town."
  },
  {
    "id": "king-gauntlets",
    "name": "King Gauntlets",
    "image": "/assets/equipment/king-gauntlets.svg",
    "slot": "armor",
    "rarity": "epic",
    "damage": 0,
    "armor": 7,
    "minLevel": 1,
    "description": "King Gauntlets: reclaimed wasteland equipment from Trash Town."
  }
] as const;
export function isEquipmentArt(value:string){return EQUIPMENT_ART.some(item=>item.image===value)}
export const GEAR_ART = {rusty_blade:"rusty-fang",neon_blade:"neon-blaster",king_blade:"scrap-hammer",scrap_vest:"salvager-vest",reinforced_vest:"scavenger-hood",king_armor:"king-gauntlets"} as const;
