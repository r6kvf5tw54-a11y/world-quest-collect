import louvreHero from "@/assets/louvre-hero.jpg";
import coffeeHero from "@/assets/coffee-hero.jpg";
import monaLisa from "@/assets/stop-mona-lisa.jpg";
import cana from "@/assets/stop-cana.jpg";
import liberty from "@/assets/stop-liberty.jpg";
import coronation from "@/assets/stop-coronation.jpg";
import venus from "@/assets/stop-venus.jpg";
import substance from "@/assets/stop-substance.jpg";
import motors from "@/assets/stop-motors.jpg";
import kb from "@/assets/stop-kb.jpg";

export type ContentBlock = { heading: string; body: string };

export type Stop = {
  id: string;
  title: string;
  subtitle: string; // artist / roaster / owner
  meta: string; // dates / neighbourhood
  venue: string;
  city: string;
  image: string;
  distance: string;
  audioLength: string;
  videoCta: string;
  blocks: ContentBlock[];
};

export type Experience = {
  id: string;
  title: string;
  shortTitle: string;
  creatorId: string;
  creatorName: string;
  category: "Art" | "Coffee";
  categoryLabel: string;
  price: number;
  duration: string;
  venue: string;
  hero: string;
  blurb: string;
  completionAchievement: string;
  stops: Stop[];
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
};

export const ACHIEVEMENTS: Record<string, Achievement> = {
  "first-discovery": {
    id: "first-discovery",
    title: "First Discovery",
    description: "You discovered your first artwork.",
  },
  "museum-starter": {
    id: "museum-starter",
    title: "Museum Starter",
    description: "Two stops checked in inside one museum.",
  },
  "louvre-explorer": {
    id: "louvre-explorer",
    title: "Louvre Explorer",
    description: "Completed Vladimir Raevsky's 5 Paintings in the Louvre.",
  },
  "coffee-explorer": {
    id: "coffee-explorer",
    title: "Paris Coffee Explorer",
    description: "Completed Jules Martin's 3 Specialty Coffee Shops in Paris.",
  },
  "explorer-subscriber": {
    id: "explorer-subscriber",
    title: "Explorer Subscriber",
    description: "Joined Atlas Explorer.",
  },
};

export const CREATORS = [
  {
    id: "vladimir-raevsky",
    name: "Vladimir Raevsky",
    tagline: "Art, architecture & culture",
    followers: "12.4K followers",
    initials: "VR",
    experiences: [
      { title: "5 Paintings in the Louvre", note: "€9.99", experienceId: "louvre" },
      { title: "Modern Paris Architecture", note: "Coming soon" },
      { title: "Musée d'Orsay Essentials", note: "Coming soon" },
    ],
  },
  {
    id: "jules-martin",
    name: "Jules Martin",
    tagline: "Coffee, bakeries & neighbourhood finds",
    followers: "4.8K followers",
    initials: "JM",
    experiences: [
      { title: "3 Specialty Coffee Shops in Paris", note: "€4.99", experienceId: "coffee" },
      { title: "Paris Bakery Route", note: "Coming soon" },
    ],
  },
];

export const EXPERIENCES: Experience[] = [
  {
    id: "louvre",
    title: "5 Paintings in the Louvre",
    shortTitle: "Louvre: 5 Paintings with Vladimir Raevsky",
    creatorId: "vladimir-raevsky",
    creatorName: "Vladimir Raevsky",
    category: "Art",
    categoryLabel: "Art / Museum",
    price: 9.99,
    duration: "~60 min",
    venue: "Louvre Museum",
    hero: louvreHero,
    blurb: "Five works. One hour. A completely different way to walk through the Louvre.",
    completionAchievement: "louvre-explorer",
    stops: [
      {
        id: "mona-lisa",
        title: "Mona Lisa",
        subtitle: "Leonardo da Vinci",
        meta: "c. 1503–1519 · Oil on poplar · Salle des États",
        venue: "Louvre Museum",
        city: "Paris",
        image: monaLisa,
        distance: "350 m away",
        audioLength: "2:14",
        videoCta: "Watch Vladimir explain this work",
        blocks: [
          {
            heading: "Why this matters",
            body: "Stand slightly to the left and the face changes. Leonardo built the portrait out of dozens of translucent glazes, each thinner than a sheet of paper, so the edges of the mouth and eyes never fully resolve. Your own eye finishes the expression — which is why nobody agrees on what she is doing.",
          },
          {
            heading: "What to look at",
            body: "Ignore the smile for thirty seconds and look past her shoulders. The landscape splits: a calm bridge and road on one side, jagged unfinished peaks on the other. It is not a real place. It is geology as mood.",
          },
          {
            heading: "The part nobody mentions",
            body: "She was a private commission of a Florentine merchant's wife, not a royal icon. Her fame is partly an accident of a 1911 theft that put an empty wall on the front page of every newspaper in Europe.",
          },
        ],
      },
      {
        id: "cana",
        title: "The Wedding Feast at Cana",
        subtitle: "Paolo Veronese",
        meta: "1563 · Oil on canvas · 6.77 × 9.94 m",
        venue: "Louvre Museum",
        city: "Paris",
        image: cana,
        distance: "40 m away",
        audioLength: "3:02",
        videoCta: "Watch Vladimir explain this work",
        blocks: [
          {
            heading: "Why this matters",
            body: "It hangs directly opposite the Mona Lisa and almost nobody turns around. This is the largest painting in the Louvre — roughly 67 square metres of Venetian party — and it dwarfs the crowd photographing the small portrait behind them.",
          },
          {
            heading: "What to look at",
            body: "Veronese dressed a biblical miracle as a sixteenth-century Venetian wedding: silk, glassware, dogs, a dwarf with a parrot, and a quartet of musicians in the foreground said to be the painters of the age, Veronese himself among them.",
          },
          {
            heading: "The part nobody mentions",
            body: "Napoleon's army cut it from the wall of a Venetian monastery in 1797 and rolled it up for the journey. It has been restored so many times that conservators now describe it as a painting with a biography.",
          },
        ],
      },
      {
        id: "liberty",
        title: "Liberty Leading the People",
        subtitle: "Eugène Delacroix",
        meta: "1830 · Oil on canvas · Denon wing",
        venue: "Louvre Museum",
        city: "Paris",
        image: liberty,
        distance: "120 m away",
        audioLength: "2:41",
        videoCta: "Watch Vladimir explain this work",
        blocks: [
          {
            heading: "Why this matters",
            body: "This is a news report painted months after the event. Delacroix watched the July Revolution of 1830 from his window and produced the image that France still uses to picture itself.",
          },
          {
            heading: "What to look at",
            body: "Liberty is not a goddess floating above the fight — her feet are on rubble and bodies, her clothes are dirty. Behind her, the towers of Notre-Dame place the barricade on a specific street, not in myth.",
          },
          {
            heading: "The part nobody mentions",
            body: "The state bought it, then hid it for years: a painting that celebrates people building barricades is awkward to own once you are the government.",
          },
        ],
      },
      {
        id: "coronation",
        title: "The Coronation of Napoleon",
        subtitle: "Jacques-Louis David",
        meta: "1805–1807 · Oil on canvas · 6.21 × 9.79 m",
        venue: "Louvre Museum",
        city: "Paris",
        image: coronation,
        distance: "60 m away",
        audioLength: "2:55",
        videoCta: "Watch Vladimir explain this work",
        blocks: [
          {
            heading: "Why this matters",
            body: "Political spin, executed in oil. David painted the moment Napoleon crowns Joséphine rather than himself — softer, more chivalrous, and far easier to hang in a palace.",
          },
          {
            heading: "What to look at",
            body: "Find the seated woman in the gallery above: Napoleon's mother, who refused to attend the ceremony and was painted in anyway. Half of this room is edited history.",
          },
          {
            heading: "The part nobody mentions",
            body: "The Pope was initially shown with his hands in his lap. Napoleon asked for a blessing gesture — so the Church appears to endorse a crown Napoleon had placed on his own head.",
          },
        ],
      },
      {
        id: "venus",
        title: "Venus de Milo",
        subtitle: "Unknown, attributed to Alexandros of Antioch",
        meta: "c. 130–100 BC · Parian marble · Sully wing",
        venue: "Louvre Museum",
        city: "Paris",
        image: venus,
        distance: "210 m away",
        audioLength: "2:08",
        videoCta: "Watch Vladimir explain this work",
        blocks: [
          {
            heading: "Why this matters",
            body: "Walk a full circle. This work was made to be read in the round, and the spiral twist of the hips only makes sense once you have seen the back.",
          },
          {
            heading: "What to look at",
            body: "The drapery is doing structural work: it holds the figure together where the marble is jointed at the waist, and it stops just where the modelling of the stomach is most confident.",
          },
          {
            heading: "The part nobody mentions",
            body: "France promoted her hard in the 1820s, partly because the Venus the Louvre had previously boasted about was returned to Italy. A missing pair of arms turned out to be excellent branding.",
          },
        ],
      },
    ],
  },
  {
    id: "coffee",
    title: "3 Specialty Coffee Shops in Paris",
    shortTitle: "3 Specialty Coffee Shops in Paris",
    creatorId: "jules-martin",
    creatorName: "Jules Martin",
    category: "Coffee",
    categoryLabel: "Coffee",
    price: 4.99,
    duration: "~2 hours",
    venue: "Right Bank, Paris",
    hero: coffeeHero,
    blurb: "Three Paris coffee shops worth crossing town for.",
    completionAchievement: "coffee-explorer",
    stops: [
      {
        id: "substance",
        title: "Substance Café",
        subtitle: "Joachim Morceau",
        meta: "18 rue de Chaillot · 16th arrondissement",
        venue: "Substance Café",
        city: "Paris",
        image: substance,
        distance: "400 m away",
        audioLength: "1:48",
        videoCta: "Watch Jules order here",
        blocks: [
          {
            heading: "Why this place",
            body: "A tiny room with a competition-level bar. The roasting is light and precise, and the staff will happily talk you through the lot on the grinder if you ask a real question.",
          },
          { heading: "What to order", body: "The single-origin espresso, then a filter of whatever is newest on the bar. Skip milk on the first cup." },
          { heading: "Best time", body: "Weekday mornings before 10:00. Ten seats total, and they fill fast." },
          { heading: "Don't miss", body: "The bottle shelf by the door — bags roasted for competition rarely make it to the shelf twice." },
        ],
      },
      {
        id: "motors",
        title: "Motors Coffee",
        subtitle: "Aurélie & Tom",
        meta: "3 rue Saint-Sabin · 11th arrondissement",
        venue: "Motors Coffee",
        city: "Paris",
        image: motors,
        distance: "1.2 km away",
        audioLength: "1:36",
        videoCta: "Watch Jules order here",
        blocks: [
          {
            heading: "Why this place",
            body: "Half neighbourhood café, half garage nostalgia. The house blend is built for milk, and the room is one of the few in Paris where sitting for an hour is genuinely welcome.",
          },
          { heading: "What to order", body: "A flat white and the banana bread. If it's warm, the batch brew over ice." },
          { heading: "Best time", body: "Late morning, or 16:00 when the lunch crowd clears out." },
          { heading: "Don't miss", body: "The corner table by the window — the best seat for watching the 11th walk past." },
        ],
      },
      {
        id: "kb",
        title: "KB CaféShop",
        subtitle: "Nicolas Piégay",
        meta: "53 avenue Trudaine · 9th arrondissement",
        venue: "KB CaféShop",
        city: "Paris",
        image: kb,
        distance: "900 m away",
        audioLength: "2:02",
        videoCta: "Watch Jules order here",
        blocks: [
          {
            heading: "Why this place",
            body: "One of the originals of the Paris specialty wave, and still the benchmark for consistency. The terrace catches South Pigalle light all afternoon.",
          },
          { heading: "What to order", body: "Cappuccino and a pain suisse. The cold brew is unusually clean in summer." },
          { heading: "Best time", body: "Saturday around 09:30, before the brunch queue forms." },
          { heading: "Don't miss", body: "The view up avenue Trudaine — a quietly perfect Paris street with no monument in sight." },
        ],
      },
    ],
  },
];

export function getExperience(id: string) {
  return EXPERIENCES.find((e) => e.id === id);
}

export function getCreator(id: string) {
  return CREATORS.find((c) => c.id === id);
}

export const DEMO_DATE = "8 Sep 2026";
export const XP_PER_STOP = 100;
export const XP_PER_COMPLETION = 500;
export const BASE_XP = 850;
