export type GalleryScene = {
  id: string;
  filename: string;
  caption: string;
  prompt: string;
};

const stylePrefix =
  "Editorial historical illustration for a teen philosophy learning app. Painterly digital art, cinematic lighting, deep charcoal and warm gold palette, dignified and respectful, no text, no watermarks, no logos. ";

const mobileStylePrefix =
  "Vertical 9:16 portrait illustration for a mobile learning app. Subject centered with headroom, full-bleed cinematic frame, painterly digital art, deep charcoal and warm gold palette, dignified and respectful, no text, no watermarks, no logos. ";

export function getMobilePrompt(prompt: string): string {
  return prompt.replace(stylePrefix, mobileStylePrefix);
}

export function getSceneWebpFilename(filename: string): string {
  return filename.replace(/\.(png|jpe?g|webp)$/i, ".webp");
}

export const THINKER_GALLERY_SCENES: Record<string, GalleryScene[]> = {
  socrates: [
    {
      id: "agora",
      filename: "01-agora.png",
      caption: "Socrates in the busy Athenian agora, observing the crowd.",
      prompt: `${stylePrefix}Ancient Athens marketplace, Socrates as an older barefoot Greek philosopher in simple robes, curious expression, marble columns, warm sunset light.`,
    },
    {
      id: "questioning",
      filename: "02-questioning.png",
      caption: "Socrates questioning a citizen about their beliefs.",
      prompt: `${stylePrefix}Socrates in dialogue with a wealthy Athenian citizen, gesturing thoughtfully, public square, tense intellectual atmosphere.`,
    },
    {
      id: "students",
      filename: "03-students.png",
      caption: "Young Athenians learning through dialogue with Socrates.",
      prompt: `${stylePrefix}Socrates seated with young students under stone columns, Socratic dialogue, scrolls nearby, classical Athens.`,
    },
    {
      id: "street",
      filename: "04-street.png",
      caption: "Socrates walking the streets of Athens, barefoot and plain.",
      prompt: `${stylePrefix}Socrates walking through narrow Athens street, humble clothing, citizens passing by, philosophical wanderer mood.`,
    },
    {
      id: "debate",
      filename: "05-debate.png",
      caption: "A public debate where Socrates challenges common opinions.",
      prompt: `${stylePrefix}Socrates debating in open public forum, animated hand gestures, mixed reactions from listeners, dramatic shadows.`,
    },
    {
      id: "trial",
      filename: "06-trial.png",
      caption: "The trial of Socrates before the citizens of Athens.",
      prompt: `${stylePrefix}Athenian trial scene, Socrates standing calmly before judges and crowd, tense moral drama, classical architecture.`,
    },
    {
      id: "prison",
      filename: "07-prison.png",
      caption: "Socrates in prison, choosing integrity over escape.",
      prompt: `${stylePrefix}Dim stone prison cell, elderly Socrates seated calmly on bench, shaft of light, contemplative dignity, symbolic not graphic.`,
    },
    {
      id: "hemlock",
      filename: "08-hemlock.png",
      caption: "The final choice: truth over comfort.",
      prompt: `${stylePrefix}Symbolic scene of ancient cup on stone table beside scroll, soft golden light, solemn atmosphere, no violence shown.`,
    },
    {
      id: "parthenon",
      filename: "09-parthenon.png",
      caption: "Socrates silhouetted against the Parthenon at dusk.",
      prompt: `${stylePrefix}Silhouette of Socrates before the Parthenon at dusk, purple and gold sky, reflective heroic composition.`,
    },
    {
      id: "legacy",
      filename: "10-legacy.png",
      caption: "The questioner whose method outlived his death.",
      prompt: `${stylePrefix}Abstract legacy scene with ghostly circle of philosophers in discussion, Socrates at center, timeless intellectual atmosphere.`,
    },
  ],
  buddha: [
    {
      id: "palace",
      filename: "01-palace.png",
      caption: "The young Siddhartha living in palace comfort.",
      prompt: `${stylePrefix}Young prince Siddhartha in ornate ancient Indian palace garden, lush greenery, golden light, peaceful but contemplative.`,
    },
    {
      id: "suffering",
      filename: "02-suffering.png",
      caption: "Encountering sickness, aging, and death outside the palace.",
      prompt: `${stylePrefix}Prince Siddhartha outside palace gates witnessing sick and elderly people, emotional awakening, muted compassionate tones.`,
    },
    {
      id: "renunciation",
      filename: "03-renunciation.png",
      caption: "Leaving comfort to search for the cause of suffering.",
      prompt: `${stylePrefix}Siddhartha leaving palace at night on horseback, servant holding torch, dramatic decision moment.`,
    },
    {
      id: "meditation",
      filename: "04-meditation.png",
      caption: "Deep meditation beneath the Bodhi tree.",
      prompt: `${stylePrefix}Buddha meditating under large Bodhi tree, serene face, dawn mist, golden rays, tranquil forest.`,
    },
    {
      id: "enlightenment",
      filename: "05-enlightenment.png",
      caption: "The moment of awakening and clarity.",
      prompt: `${stylePrefix}Buddha seated in meditation with soft radiant halo, lotus pond nearby, sunrise, spiritual clarity.`,
    },
    {
      id: "teaching",
      filename: "06-teaching.png",
      caption: "Teaching monks and seekers in the forest.",
      prompt: `${stylePrefix}Buddha teaching seated group of monks in forest clearing, gentle hand gesture, attentive listeners.`,
    },
    {
      id: "begging-bowl",
      filename: "07-begging-bowl.png",
      caption: "Walking peacefully with simplicity and humility.",
      prompt: `${stylePrefix}Buddha walking village path holding begging bowl, orange robes, morning light, humble compassion.`,
    },
    {
      id: "lotus",
      filename: "08-lotus.png",
      caption: "The lotus as a symbol of growth through difficulty.",
      prompt: `${stylePrefix}Close symbolic scene of lotus flowers rising from water, Buddha silhouette in background, metaphorical composition.`,
    },
    {
      id: "monastery",
      filename: "09-monastery.png",
      caption: "A quiet monastery at dawn.",
      prompt: `${stylePrefix}Hillside monastery at dawn, monks in distance, misty mountains, calm discipline and reflection.`,
    },
    {
      id: "compassion",
      filename: "10-compassion.png",
      caption: "Seeing suffering clearly before reacting.",
      prompt: `${stylePrefix}Buddha listening compassionately to distressed person in village, warm empathetic atmosphere, soft focus.`,
    },
  ],
  ambedkar: [
    {
      id: "childhood-study",
      filename: "01-childhood-study.png",
      caption: "A young Ambedkar studying by lamplight against the odds.",
      prompt: `${stylePrefix}Young Indian boy Ambedkar studying books by oil lamp in modest home, determination, warm intimate lighting, historical India.`,
    },
    {
      id: "education",
      filename: "02-education.png",
      caption: "Pursuing education when society tried to deny him dignity.",
      prompt: `${stylePrefix}Young Ambedkar in school uniform with stack of books, confident posture, colonial-era classroom, dignified portrait.`,
    },
    {
      id: "law-books",
      filename: "03-law-books.png",
      caption: "Becoming a scholar, lawyer, and voice for justice.",
      prompt: `${stylePrefix}Ambedkar in suit with law books and spectacles, library setting, intellectual strength, early 20th century India.`,
    },
    {
      id: "columbia",
      filename: "04-columbia.png",
      caption: "Studying abroad and sharpening his ideas.",
      prompt: `${stylePrefix}Ambedkar as student at university abroad, winter coat, books, academic ambition, respectful historical portrait.`,
    },
    {
      id: "speaking",
      filename: "05-speaking.png",
      caption: "Speaking to crowds about dignity and equal rights.",
      prompt: `${stylePrefix}Ambedkar speaking at public rally with microphone, attentive crowd, banners implied without text, moral courage.`,
    },
    {
      id: "constitution",
      filename: "06-constitution.png",
      caption: "Helping shape the constitution of a new democracy.",
      prompt: `${stylePrefix}Ambedkar at desk with constitutional documents and pen, formal office, historic democratic moment, India 1940s.`,
    },
    {
      id: "justice",
      filename: "07-justice.png",
      caption: "Justice as dignity protected by fair systems.",
      prompt: `${stylePrefix}Symbolic scales of justice on desk with Ambedkar in background reviewing papers, systems thinking mood.`,
    },
    {
      id: "library",
      filename: "08-library.png",
      caption: "A life built on reading, reasoning, and reform.",
      prompt: `${stylePrefix}Ambedkar surrounded by towering bookshelves, reading intensely, scholar-activist atmosphere.`,
    },
    {
      id: "debate",
      filename: "09-debate.png",
      caption: "Challenging unfair rules with moral clarity.",
      prompt: `${stylePrefix}Ambedkar in formal debate setting, pointing to document, composed intensity, historical Indian assembly hall.`,
    },
    {
      id: "legacy",
      filename: "10-legacy.png",
      caption: "A legacy of justice that asks who the system protects.",
      prompt: `${stylePrefix}Dignified portrait of elderly Ambedkar before parliament building silhouette, golden hour, inspirational legacy composition.`,
    },
  ],
  einstein: [
    {
      id: "child-compass",
      filename: "01-child-compass.png",
      caption: "A child Einstein fascinated by a compass.",
      prompt: `${stylePrefix}Curious boy Einstein holding compass in hand, wide-eyed wonder, Victorian-era room, warm nostalgic light.`,
    },
    {
      id: "patent-office",
      filename: "02-patent-office.png",
      caption: "Working at the patent office while dreaming in physics.",
      prompt: `${stylePrefix}Young Einstein at cluttered patent office desk with papers and clock, thoughtful expression, early 1900s Europe.`,
    },
    {
      id: "thought-experiment",
      filename: "03-thought-experiment.png",
      caption: "Riding a beam of light in imagination.",
      prompt: `${stylePrefix}Abstract thought experiment scene, Einstein imagining light beam through space, surreal scientific visualization, elegant not cartoonish.`,
    },
    {
      id: "chalkboard",
      filename: "04-chalkboard.png",
      caption: "Equations on a chalkboard and a mind at work.",
      prompt: `${stylePrefix}Einstein writing equations on chalkboard, chalk dust, intense focus, university lecture room.`,
    },
    {
      id: "relativity",
      filename: "05-relativity.png",
      caption: "Bending light and rethinking time and space.",
      prompt: `${stylePrefix}Symbolic curved spacetime grid with stars and light bending, Einstein profile silhouette, cosmic gold and navy palette.`,
    },
    {
      id: "eclipse",
      filename: "06-eclipse.png",
      caption: "An eclipse expedition that tested a bold idea.",
      prompt: `${stylePrefix}Scientists with telescopes during solar eclipse expedition, Einstein figure among them, dramatic sky, historical science.`,
    },
    {
      id: "violin",
      filename: "07-violin.png",
      caption: "Einstein playing violin, where imagination meets feeling.",
      prompt: `${stylePrefix}Einstein playing violin in cozy study, messy hair, books and pipe nearby, warm intimate portrait.`,
    },
    {
      id: "princeton",
      filename: "08-princeton.png",
      caption: "An iconic thinker at Princeton.",
      prompt: `${stylePrefix}Older Einstein walking leafy university campus path, cardigan, gentle smile, autumn light, Princeton mood.`,
    },
    {
      id: "blackboard-imagination",
      filename: "09-blackboard-imagination.png",
      caption: "Using imagination before calculation.",
      prompt: `${stylePrefix}Einstein staring at star field through window with notebook, imagination and science combined, night sky.`,
    },
    {
      id: "legacy-universe",
      filename: "10-legacy-universe.png",
      caption: "A mind that changed how we see the universe.",
      prompt: `${stylePrefix}Einstein portrait blended with galaxy and equation symbols, legacy composition, awe and curiosity.`,
    },
  ],
  tagore: [
    {
      id: "bengal-countryside",
      filename: "01-bengal-countryside.png",
      caption: "Tagore shaped by the landscapes of Bengal.",
      prompt: `${stylePrefix}Young Tagore in Bengal countryside with rice fields and monsoon clouds, poetic atmosphere, soft greens and golds.`,
    },
    {
      id: "writing",
      filename: "02-writing.png",
      caption: "Writing poetry by windowlight.",
      prompt: `${stylePrefix}Tagore writing at wooden desk by open window, manuscript pages, gentle evening breeze, literary mood.`,
    },
    {
      id: "shantiniketan",
      filename: "03-shantiniketan.png",
      caption: "Founding an open-air school rooted in freedom.",
      prompt: `${stylePrefix}Tagore teaching students outdoors under trees at Shantiniketan, open-air school, humanistic education scene.`,
    },
    {
      id: "music",
      filename: "04-music.png",
      caption: "Art, music, and humanity intertwined.",
      prompt: `${stylePrefix}Tagore with musicians and poets in courtyard, classical Indian instruments, creative harmony, warm cultural scene.`,
    },
    {
      id: "monsoon",
      filename: "05-monsoon.png",
      caption: "Monsoon rain and the feeling of renewal.",
      prompt: `${stylePrefix}Tagore standing on veranda watching monsoon rain over Bengal landscape, reflective poetic composition.`,
    },
    {
      id: "manuscript",
      filename: "06-manuscript.png",
      caption: "Crafting words that travel beyond borders.",
      prompt: `${stylePrefix}Close scene of Tagore hand writing Bengali manuscript with ink pen, candle and books, intimate creator portrait.`,
    },
    {
      id: "students",
      filename: "07-students.png",
      caption: "Teaching that treats students as full human beings.",
      prompt: `${stylePrefix}Tagore seated in circle with diverse students discussing literature, open dialogue, humanistic classroom under trees.`,
    },
    {
      id: "nobel",
      filename: "08-nobel.png",
      caption: "Global recognition for a poet of humanity.",
      prompt: `${stylePrefix}Tagore in elegant formal attire receiving literary honor, dignified celebration, early 20th century stage, no readable text.`,
    },
    {
      id: "sunset-fields",
      filename: "09-sunset-fields.png",
      caption: "Beauty beyond utility.",
      prompt: `${stylePrefix}Tagore walking through golden rice fields at sunset, long shadow, freedom and beauty mood.`,
    },
    {
      id: "library-poet",
      filename: "10-library-poet.png",
      caption: "A poet who asked what makes life fully human.",
      prompt: `${stylePrefix}Tagore in personal library surrounded by books and art objects, serene elder poet portrait, warm lamp light.`,
    },
  ],
};

export function getGalleryPaths(slug: string): string[] {
  const scenes = THINKER_GALLERY_SCENES[slug] ?? [];
  return scenes.map((scene) => `/assets/thinkers/${slug}/${scene.filename}`);
}
