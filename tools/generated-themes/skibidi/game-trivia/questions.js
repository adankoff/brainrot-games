/**
 * SKIBIDI TOILET TRIVIA -- Question Bank (auto-generated)
 */

export const questions = [
  {
    question: "Who created the Skibidi Toilet series?",
    answers: ["Alexey Gerasimov", "DaFuq!?Boom!", "MrBeast", "PewDiePie"],
    correct: 1,
    difficulty: 1,
    category: "history",
  },
  {
    question: "What engine is Skibidi Toilet made in?",
    answers: ["Unreal Engine", "Unity", "Source Filmmaker", "Blender"],
    correct: 2,
    difficulty: 2,
    category: "history",
  },
  {
    question: "What does the Cameraman have for a head?",
    answers: ["TV", "Camera", "Speaker", "Satellite"],
    correct: 1,
    difficulty: 1,
    category: "characters",
  },
  {
    question: "What is the Titan Cameraman's main weapon?",
    answers: ["Laser eyes", "Camera flash", "Sound waves", "Teleportation"],
    correct: 0,
    difficulty: 2,
    category: "characters",
  },
  {
    question: "What does G-Man Toilet wear?",
    answers: ["Crown", "Top hat", "Glasses", "Tie"],
    correct: 1,
    difficulty: 1,
    category: "characters",
  },
  {
    question: "What platform was Skibidi Toilet first posted on?",
    answers: ["TikTok", "YouTube", "Instagram", "Twitter"],
    correct: 1,
    difficulty: 1,
    category: "history",
  },
];

/**
 * Fisher-Yates shuffle.
 */
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build a question queue ordered by difficulty (easy first).
 */
export function buildQuestionQueue() {
  const easy = shuffle(questions.filter(q => q.difficulty === 1));
  const med = shuffle(questions.filter(q => q.difficulty === 2));
  const hard = shuffle(questions.filter(q => q.difficulty === 3));
  return [...easy, ...med, ...hard];
}
