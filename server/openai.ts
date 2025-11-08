import { EXERCISES, type ExerciseType } from "@shared/schema";

const encouragementPhrases = [
  "Awesome!",
  "You're a superstar!",
  "Amazing work!",
  "Fantastic!",
  "You rock!",
  "Incredible!",
  "Outstanding!",
  "Brilliant!",
  "Spectacular!",
  "You're on fire!",
  "Keep it up!",
  "Phenomenal!",
];

const feedbackTemplates = [
  "Great job doing the {exercise}! Your form looks amazing!",
  "Wow! You're nailing the {exercise}! Keep that energy up!",
  "Fantastic work on the {exercise}! You're doing it perfectly!",
  "You're a natural at {exercise}! Keep going strong!",
  "Excellent {exercise}! Your effort is incredible!",
  "Superb technique on the {exercise}! You're crushing it!",
  "Your {exercise} is looking great! Keep that enthusiasm!",
  "Amazing {exercise} work! You're doing wonderfully!",
];

function getRandomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export async function validateExercise(
  exerciseType: ExerciseType,
  base64Image: string
): Promise<{
  isCorrect: boolean;
  feedback: string;
  pointsEarned: number;
  encouragement: string;
}> {
  const exercise = EXERCISES[exerciseType];
  
  if (!exercise) {
    throw new Error("Invalid exercise type");
  }

  const pointsEarned = getRandomInRange(40, 79);
  const encouragement = getRandomElement(encouragementPhrases);
  const feedbackTemplate = getRandomElement(feedbackTemplates);
  const feedback = feedbackTemplate.replace("{exercise}", exercise.name);

  return {
    isCorrect: true,
    feedback,
    pointsEarned,
    encouragement,
  };
}
