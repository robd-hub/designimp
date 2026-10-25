import * as THREE from "three";
import { FOOTPATH_ROUTE, ROUNDABOUT } from "./colliders";

// Townsfolk who stroll the streets. Walk up to one and press E to chat.
export type Npc = {
  id: string;
  name: string;
  shirt: number;
  legs: number;
  skin: number;
  hat?: number;
  hair?: number;
  dog?: number; // walks a dog of this colour on a lead
  path: [number, number][]; // walked as a loop
  speed: number;
  lines: string[];
};

export const NPCS: Npc[] = [
  {
    id: "christine",
    name: "Christine",
    shirt: 0x1d1c20,
    legs: 0x1a1320,
    skin: 0xd9a37a,
    hair: 0x2a1c18,
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
    id: "elizabeth",
    name: "Elizabeth",
    shirt: 0x1f2a4a,
    legs: 0x2b3a8c,
    skin: 0xf2d0b5,
    hair: 0xe3c37e,
    dog: 0x8a5a3c, // a brown cavapoo
    path: [[3.7, -8], [3.7, -90], [-3.7, -90], [-3.7, -8]],
    speed: 2.2,
    lines: [
      "Morning! Have you been up to the cathedral yet? Keep walking north.",
      "They say there's a little stone imp hiding up there. I've never spotted him.",
    ],
  },
  {
    id: "alan",
    name: "Alan",
    shirt: 0x1c2340,
    legs: 0xd9d3c3,
    skin: 0xf2d0b5,
    hat: 0xc9c4b2,
    // Elizabeth's loop the other way round, so the two of them keep meeting for a chat
    path: [[3.7, -90], [3.7, -8], [-3.7, -8], [-3.7, -90]],
    speed: 2.2,
    lines: [
      "Afternoon! Lovely day for a stroll up the High Street.",
      "Mind how you go on Steep Hill. It's called that for a reason.",
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
    path: [[-8, -3.7], [-52, -3.7], [-52, 3.7], [-8, 3.7]], // turning back short of the roundabout
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
    path: [[-3.7, 8], [-3.7, 124], [3.7, 124], [3.7, 8]],
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
      // round the pavement on the outside of the tank's roundabout
      return [ROUNDABOUT.x + Math.cos(a) * 7.5, ROUNDABOUT.z + Math.sin(a) * 7.5] as [number, number];
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
    path: [[18, -97], [32, -97]],
    speed: 1.2,
    lines: [
      "Lovely, isn't she? Building started on this cathedral over 900 years ago.",
      "Good-looking websites stop people leaving. 38% of people stop engaging with an unattractive layout.",
    ],
  },
  {
    id: "maya",
    name: "Maya",
    shirt: 0x7a1f3d,
    legs: 0x2b3a8c,
    skin: 0xc68a5e,
    hair: 0x1a1320,
    // there and back along the footpath, from the main road up to the castle gate
    path: [...FOOTPATH_ROUTE, ...FOOTPATH_ROUTE.slice(1, -1).reverse()],
    speed: 1.8,
    lines: [
      "Lectures are done for the day, so I'm off for a wander. This path goes past the Brayford all the way up to the castle.",
      "You can walk right round the castle walls up there. Best view in Lincoln.",
    ],
  },
  {
    id: "frank",
    name: "Frank",
    shirt: 0x5b6b7a,
    legs: 0x1a1320,
    skin: 0xffc39e,
    hat: 0x8a5a33,
    dog: 0xf4efe4,
    path: [...FOOTPATH_ROUTE.slice().reverse(), ...FOOTPATH_ROUTE.slice(1, -1)],
    speed: 1.3,
    lines: [
      "Just been up to the castle. My knees prefer the walk back down.",
      "I like to stop by the Brayford on the way and say hello to the swans.",
    ],
  },
];

// What townsfolk say when they stop to chat with each other, by speaker then listener. Anyone else
// just says hello.
const CHATS: Record<string, Record<string, string>> = {
  elizabeth: { alan: "There you are, Alan! Shall we stop for a coffee at High Bridge?" },
  alan: { elizabeth: "Go on then, Elizabeth. I'll get the cakes." },
  frank: { maya: "Morning, Maya! Mind the hill, it's steeper than it looks." },
  maya: { frank: "Thanks, Frank! Say hello to the swans for me." },
};
export const chatLine = (from: Npc, to: Npc, first: boolean) =>
  CHATS[from.id]?.[to.id] ?? (first ? `Morning, ${to.name}!` : `Hello, ${to.name}! Lovely day for a walk.`);

// Live positions, written every frame by each townsperson.
export const npcPos = new Map(NPCS.map((n) => [n.id, new THREE.Vector3(n.path[0][0], 0, n.path[0][1])]));
