/**
 * Category Policy - Centralized allowlist
 * 
 * Arc only supports non-sensitive categories. We do NOT allow:
 * - Sports / Fitness / Body goals
 * - Therapy / Mental Health goals  
 * - Medical / Health condition goals
 * 
 * This keeps the platform focused on learning, building, and growth.
 */

export const ALLOWED_CATEGORIES = [
  "academic",
  "career",
  "creative",
  "entrepreneurial",
  "personal-growth"
] as const;

export type AllowedCategory = typeof ALLOWED_CATEGORIES[number];

// Disallowed category keywords for detection in free text
export const DISALLOWED_KEYWORDS = [
  // Sports/Fitness/Body
  "workout", "gym", "fitness", "exercise", "weight", "muscle", "cardio", "running", "marathon",
  "bodybuilding", "crossfit", "yoga poses", "diet plan", "lose weight", "gain weight", "abs", "biceps",
  "strength training", "athletic performance", "sports training", "body transformation",
  
  // Therapy/Mental Health (note: general wellbeing/mindfulness is OK in personal-growth)
  "therapy", "therapist", "counseling", "counsellor", "depression treatment", "anxiety disorder", 
  "ptsd", "trauma treatment", "psychiatric", "mental illness", "bipolar", "medication adjustment",
  "psychologist", "mental health professional",
  
  // Medical/Health conditions
  "diagnosis", "medical treatment", "surgery", "medical condition", "doctor appointment", 
  "physician", "prescription", "injury rehab", "physical therapy", "chronic pain", 
  "disease", "symptoms", "health condition", "medical procedure", "hospital"
] as const;

/**
 * Check if a category value is in the allowlist
 */
export function isAllowedCategory(category: string): category is AllowedCategory {
  return ALLOWED_CATEGORIES.includes(category as AllowedCategory);
}

/**
 * Check if text contains disallowed category intent
 */
export function detectDisallowedIntent(text: string): boolean {
  const lowerText = text.toLowerCase();
  return DISALLOWED_KEYWORDS.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

/**
 * Validate category or throw an error
 */
export function validateCategory(category: string): asserts category is AllowedCategory {
  if (!isAllowedCategory(category)) {
    throw new Error(
      `Invalid category "${category}". Allowed categories: ${ALLOWED_CATEGORIES.join(", ")}`
    );
  }
}

