// First-login seed data, transcribed from the user's trainer-app
// screenshots: "UPPER 2 - BLOCK 1 (2026)".

export const SEED_EXERCISES: string[] = [
  'Dumbbell Bench Press',
  'Dumbbell Single Arm Row',
  'Barbell Standing Shoulder Press',
  'Assisted Parallel Close Grip Pull Up',
  'Machine Chest Fly',
  'Machine Reverse Fly',
  'Tricep Pushdown (Rope)',
  'Barbell Biceps Curl',
]

export type SeedTemplateItem = {
  exercise_name: string
  label: string
  target_sets: number
  target_reps: string
}

export const SEED_TEMPLATE: { name: string; items: SeedTemplateItem[] } = {
  name: 'Upper 2 – Block 1',
  items: [
    { exercise_name: 'Dumbbell Bench Press', label: 'A1', target_sets: 3, target_reps: '8-10' },
    { exercise_name: 'Dumbbell Single Arm Row', label: 'A2', target_sets: 3, target_reps: '8-10' },
    { exercise_name: 'Barbell Standing Shoulder Press', label: 'B1', target_sets: 3, target_reps: '8-10' },
    { exercise_name: 'Assisted Parallel Close Grip Pull Up', label: 'B2', target_sets: 3, target_reps: '5-8' },
    { exercise_name: 'Machine Chest Fly', label: 'C1', target_sets: 3, target_reps: '10-12' },
    { exercise_name: 'Machine Reverse Fly', label: 'C2', target_sets: 3, target_reps: '10-12' },
    { exercise_name: 'Tricep Pushdown (Rope)', label: 'D1', target_sets: 2, target_reps: '12-15' },
    { exercise_name: 'Barbell Biceps Curl', label: 'D2', target_sets: 2, target_reps: '12-15' },
  ],
}
