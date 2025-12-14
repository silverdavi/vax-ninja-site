/**
 * Doctor taunts - sarcastic phrases mocking anti-vaxxer beliefs
 * These float from doctor to patient as speech bubbles
 */
export const DOCTOR_TAUNTS = [
  // 5G/Microchip conspiracy
  "Free 5G upgrade included! 📶",
  "Your tracking chip awaits!",
  "Bill Gates says hi! 👋",
  "Microchip installation time!",
  "Better reception guaranteed!",
  
  // RFK/Conspiracy theorists
  "RFK approved this message!",
  "Don't trust science, trust me!",
  "I read it on Facebook!",
  "My research says so!",
  "Do your own research... like me!",
  
  // Autism myth
  "Jenny McCarthy warned you!",
  "The study was real... trust me!",
  "1998 called, wants its hoax back!",
  
  // Natural immunity
  "Natural immunity is so last century!",
  "Your essential oils won't help!",
  "Crystals can't save you now!",
  "Have you tried thoughts & prayers?",
  
  // Big Pharma
  "Big Pharma loves you! 💕",
  "It's all about the profits!",
  "Free healthcare, what's the catch?",
  "The government cares about you!",
  
  // General sarcasm
  "Just a little prick!",
  "This won't hurt... much!",
  "Doctor knows best!",
  "Trust the science... or else!",
  "Resistance is futile!",
  "Your immune system is overrated!",
  "One jab to rule them all!",
  "Needle time! 💉",
  "Boosters forever!",
  "Your arm is looking lonely!",
  
  // Pandemic references
  "Flatten the curve... of your escape!",
  "Social distance THIS!",
  "Mask mandate incoming!",
  "New variant, new jab!",
  "Two weeks to stop the spread!",
  
  // More sarcasm
  "FDA approved this chase!",
  "Side effects? What side effects?",
  "You'll feel a slight pinch!",
  "I'm from the government, I'm here to help!",
  "Consent is optional!",
  "Your body, my choice!",
  "Just following orders!",
  "The science is settled!",
  "Experts agree: get jabbed!",
  "Your freedom ends here!",
];

/**
 * Get a random taunt
 */
export function getRandomTaunt(): string {
  return DOCTOR_TAUNTS[Math.floor(Math.random() * DOCTOR_TAUNTS.length)];
}
