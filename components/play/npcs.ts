import * as THREE from "three";

// Townsfolk who stroll the streets. Walk up to one and press E to chat.
export type Npc = {
  id: string;
  name: string;
  shirt: number;
  legs: number;
  skin: number;
  hat?: number;
  hair?: number;
  path: [number, number][]; // walked as a loop
  speed: number;
  lines: string[];
};

export const NPCS: Npc[] = [
  {
    id: "christine",
    name: "Christine",
    shirt: 0xff6fa8,
    legs: 0x1a1320,
    skin: 0xd9a37a,
    hair: 0x1a1320,
    path: [[-19, -6], [-16.8, -6]],
    speed: 0.9,
    lines: [
      "Welcome to Ayuri Beauty! Customers can book their appointments online now, no phone call needed.",
      "Working with Rob was really easy. He listened to all my suggestions and put together a really pretty website.",
      "Three months after the new website went live, we were full most days. I'm even planning a second salon.",
    ],
  },
  {
    id: "justyna",
    name: "Justyna",
    shirt: 0x9b6bff,
    legs: 0x1a1320,
    skin: 0xf2d0b5,
    hair: 0x8a5a33,
    path: [[16.8, -6], [19, -6]],
    speed: 0.9,
    lines: [
      "Hello! I teach ballroom, Latin and Salsa Fit classes here in Lincoln, for adults and children.",
      "I didn't have a website before. Now new students can find my classes, prices and how to join.",
      "I'm really happy with what Rob made for me. The colour scheme and the layout of the website were just what I needed.",
    ],
  },
  {
    id: "priya",
    name: "Priya",
    shirt: 0xff5a3c,
    legs: 0x2b3a8c,
    skin: 0x9a6a4a,
    hair: 0x1a1320,
    path: [[3.7, -8], [3.7, -40], [-3.7, -40], [-3.7, -8]],
    speed: 2.2,
    lines: [
      "Morning! Have you been up to the cathedral yet? Keep walking north.",
      "They say there's a little stone imp hiding up there. I've never spotted him.",
    ],
  },
  {
    id: "tom",
    name: "Tom",
    shirt: 0x3d8bff,
    legs: 0x4a3a2a,
    skin: 0xffc39e,
    hat: 0x2f8f5b,
    path: [[8, 3.7], [64, 3.7], [64, -3.7], [8, -3.7]],
    speed: 2.6,
    lines: [
      "I run a shop out of town. Did you know 75% of people judge a business by its website alone?",
      "I'm thinking of grabbing that empty plot down the road. Free mockup, apparently.",
    ],
  },
  {
    id: "elsie",
    name: "Elsie",
    shirt: 0x3fae9f,
    legs: 0x1a1320,
    skin: 0xf2d0b5,
    hair: 0xd6cfe0,
    path: [[-8, -3.7], [-64, -3.7], [-64, 3.7], [-8, 3.7]],
    speed: 1.6,
    lines: [
      "Over half of visitors give up on a website if it takes more than 3 seconds to load. I'd give up too!",
      "WellSway Dance is just up there. I go to the Salsa Fit class on Tuesdays.",
    ],
  },
  {
    id: "sam",
    name: "Sam",
    shirt: 0xffb627,
    legs: 0x2b2633,
    skin: 0x6b4a32,
    hat: 0xff5a3c,
    path: [[-3.7, 8], [-3.7, 64], [3.7, 64], [3.7, 8]],
    speed: 2.4,
    lines: [
      "88% of people won't come back after a bad experience on a website. Harsh, but fair.",
      "The Workshop's where all the websites get built. You can hear the hammering from here.",
    ],
  },
  {
    id: "bea",
    name: "Bea",
    shirt: 0xff6fa8,
    legs: 0x2b3a8c,
    skin: 0xffc39e,
    hair: 0xc8973a,
    path: Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return [Math.cos(a) * 5.6, Math.sin(a) * 5.6] as [number, number];
    }),
    speed: 1.4,
    lines: [
      "See the tank? The first tanks were built right here in Lincoln, back in 1915.",
      "I just had my nails done at Ayuri Beauty. You can book online now, no phone call!",
      "Got a question about getting a website? The Town Hall has all the answers.",
    ],
  },
  {
    id: "ollie",
    name: "Ollie",
    shirt: 0x1fb5a8,
    legs: 0x4a3a2a,
    skin: 0xf2d0b5,
    hat: 0x1a1320,
    path: [[-10, -43], [10, -43]],
    speed: 1.2,
    lines: [
      "Lovely, isn't she? Building started on this cathedral over 900 years ago.",
      "Good-looking websites stop people leaving. 38% of people stop engaging with an unattractive layout.",
    ],
  },
];

// Live positions, written every frame by each townsperson.
export const npcPos = new Map(NPCS.map((n) => [n.id, new THREE.Vector3(n.path[0][0], 0, n.path[0][1])]));
