const adjectives = [
  "Brave",
  "Silent",
  "Lucky",
  "Crazy",
  "Wild",
  "Swift",
  "Happy",
  "Cool"
];

const animals = [
  "Tiger",
  "Falcon",
  "Wolf",
  "Panda",
  "Lion",
  "Eagle",
  "Fox",
  "Shark"
];

export function generateUsername() {

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const number = Math.floor(Math.random() * 100);

  return `${adj}${animal}${number}`;
}