import assert from "node:assert/strict";

const moodLineRegex = /^Mood: (?:[A-Za-z]+(?:-[A-Za-z]+)?)(?: (?:[A-Za-z]+(?:-[A-Za-z]+)?)){4,9}$/;

const samples = [
  "Mood: energetic but introspective late-night focus",
  "Mood: calm hopeful and quietly determined",
  "Mood: bittersweet nostalgia with forward momentum",
  "Mood: dreamy nocturnal synth-pop with restless optimism",
];

const failures = [];

for (const [index, sample] of samples.entries()) {
  try {
    assert.equal(moodLineRegex.test(sample), true);
  } catch {
    failures.push(`Sample ${index + 1} failed format: ${sample}`);
  }
}

const invalidSamples = [
  "Mood: too short",
  "Mood: this sentence has way too many words for the required output format here",
  "mood: lowercase prefix is invalid",
  "Mood: includes emoji 😅 in output",
  "Mood: trailing punctuation should fail.",
];

for (const [index, sample] of invalidSamples.entries()) {
  try {
    assert.equal(moodLineRegex.test(sample), false);
  } catch {
    failures.push(`Invalid sample ${index + 1} unexpectedly passed: ${sample}`);
  }
}

if (failures.length > 0) {
  console.error("LastFM mood eval failed:\n" + failures.map((f) => `- ${f}`).join("\n"));
  process.exit(1);
}

console.log("LastFM mood eval passed.");
