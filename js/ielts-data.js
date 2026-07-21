/* ==========================================================================
   IELTS journey — data file
   This is the ONLY file to edit after each practice test.
   Append one record to `mocks`, commit, push — the page recomputes itself.
   ========================================================================== */

window.IELTS_DATA = {
  module: "Academic",

  /* Working target per skill. Adjust anytime. */
  target: { listening: 7.0, reading: 7.0, writing: 7.0, speaking: 7.0 },

  /* The official baseline — the real test. */
  official: {
    date: "2026",                       /* set the exact date if you want it shown, e.g. "2026-06-14" */
    label: "Official IELTS Academic",
    bands: { listening: 8.5, reading: 9.0, writing: 6.5, speaking: 6.5 }
  },

  /* Timed practice tests go here, newest last. Full example (copy, uncomment, edit):
  {
    date: "2026-08-03",
    source: "Cambridge 19 · Test 2",
    bands: { listening: 8.5, reading: 8.5, writing: 7.0, speaking: 6.5 },

    // Receptive-skill error taxonomy — count what LOST marks:
    errors: {
      reading:   { "T/F/NG traps": 3, "paraphrase miss": 2, "timed out (sec 3)": 1 },
      listening: { "spelling": 2, "distractor reversal": 1 }
    },

    // Productive skills, self-scored per criterion against the public band descriptors:
    writing:  { t1: { TA: 7, CC: 7, LR: 7, GRA: 6.5 }, t2: { TR: 7, CC: 7, LR: 7, GRA: 6.5 } },
    speaking: { FC: 7, LR: 6.5, GRA: 6.5, PRON: 7 },

    // The one thing carried into next week:
    fixAction: "Drill map-labelling; T2 thesis on paper inside 3 minutes."
  },
  */
  mocks: []
};
