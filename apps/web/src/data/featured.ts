/** A player shown on the home page. Name and portrait are fixed here; their numbers stream from the API. */
export type FeaturedPlayer = {
  discriminator: string;
  prefix: string | null;
  gamerTag: string;
  profilePictureUrl: string | null;
};

/** The character select, in this order. */
export const FEATURED_PLAYERS: FeaturedPlayer[] = [
  {
    discriminator: "830dec1e",
    prefix: "ZETA",
    gamerTag: "あcola",
    profilePictureUrl:
      "https://images.start.gg/images/user/1787719/image-35fd5b39c6aaedb64a3aefce818370c2-optimized.jpg?ehk=X%2FEHj7gWLTCd9d8AatiRAHg7ohd2%2FtruyLEalBfmdhs%3D&ehkOptimized=pdf7tlJy0ZqW6An9C6TUbZJ8jkLSM9Ajfd77fVgJ6a0%3D",
  },
  {
    discriminator: "82f63ee2",
    prefix: "AREA310",
    gamerTag: "ドラ右",
    profilePictureUrl: "https://images.start.gg/images/user/1815290/image-675a07379209748e2b05ae1cbf76b48b-optimized.jpg",
  },
  {
    discriminator: "9b4e3c26",
    prefix: "E36",
    gamerTag: "Hurt",
    profilePictureUrl: "https://images.start.gg/images/user/836465/image-173c141bebd6550805471ebc98b42874-optimized.jpg",
  },
  {
    discriminator: "0301d9f0",
    prefix: null,
    gamerTag: "Sonix",
    profilePictureUrl:
      "https://images.start.gg/images/user/165614/image-64335482a7321b28adea06c00abf5d8c.JPG?ehk=uyfO6nrb%2FH55YwJh1NI%2FgUTwXQFkpJvc1%2FHv2NJfShc%3D&ehkOptimized=pnK84V2A%2Bxwbgjm0dYkZXrNkz%2FggLgMamXFZwWCpw24%3D",
  },
  {
    discriminator: "880cbc79",
    prefix: "CTG",
    gamerTag: "Zomba",
    profilePictureUrl: "https://images.start.gg/images/user/252388/image-741e9bc3c6e603751437db8ee51109d5-optimized.jpg",
  },
  {
    discriminator: "d8016ec8",
    prefix: "FENNEL",
    gamerTag: "Miya",
    profilePictureUrl: "https://images.start.gg/images/user/1002311/image-1cfa44fda16c7d373c2942481aaea1bd-optimized.jpg",
  },
  {
    discriminator: "9e3d38c6",
    prefix: null,
    gamerTag: "カルメロ",
    profilePictureUrl: "https://images.start.gg/images/user/2262042/image-4968f20f0a6832d803013039372fd032-optimized.jpg",
  },
  {
    discriminator: "b5230de8",
    prefix: "FaZe",
    gamerTag: "Sparg0",
    profilePictureUrl:
      "https://images.start.gg/images/user/94369/image-6586d2783cd1fe8a1ed41c181517ad98.jpg?ehk=hoSixWUStu024T0vaQOBWGH08JVsiqWf9Kp6S4tVE3g%3D&ehkOptimized=p1A7xRzbvqo%2BvZ1UvuaWUh4ag8iTvcbxJOXgzemSVbc%3D",
  },
  {
    discriminator: "9160966b",
    prefix: "WU",
    gamerTag: "Peabnut",
    profilePictureUrl: "https://images.start.gg/images/user/37364/image-34bd862ac6385b1d82a904669d7f13fb-optimized.jpg",
  },
];

/** Whose numbers fill "What's in your recap" on the player tab. */
export const MENU_EXAMPLE_PLAYER = FEATURED_PLAYERS.find((p) => p.gamerTag === "Sparg0")!;

/** Whose numbers fill "What's in your recap" on the organiser tab. */
export const MENU_EXAMPLE_ORGANIZER = { discriminator: "541f04fd", prefix: "ARK", gamerTag: "Licane" };
