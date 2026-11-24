# Study data: what gets collected and how it looks

Companion to `SAMPLE_study-data_ILLUSTRATIVE.csv`.

> The rows in that CSV are ILLUSTRATIVE / synthetic, made to show the format. They are
> not real participants. No real data has been collected yet. Numbers and answers were
> invented only to show the column shape.

## How you get the data

Everything a participant does is stored in one Supabase table (`sessions`), one row per
person who consents. To pull it out:

1. Go to the live app at `/admin` and log in with the researcher password.
2. Click **Export CSV**. The file matches the sample exactly, same columns, same order.

You can also read the table directly in the Supabase dashboard (Table editor to `sessions`),
but the CSV export is the clean, analysis-ready version with scoring and timings already
computed.

## What each column means

| Column | Meaning |
| --- | --- |
| `participant_id` | Anonymous ID shown to the participant, e.g. P001. The only identifier stored. |
| `seq` | Enrollment order (1, 2, 3, ...). Odd goes to AI, even goes to static. |
| `condition` | `ai` (interactive visualizer) or `static` (text learning module). |
| `study_completed` | `yes` only after the final questionnaire is done. This is what counts toward the target. |
| `furthest_stage` | How far they got: consent, pretest, learning, posttest, or questionnaire. |
| `pretest_correct` / `pretest_percent` | Score on the pre-test (count and percent). |
| `posttest_correct` / `posttest_percent` | Score on the post-test (count and percent). |
| `gain_percent` | Post-test percent minus pre-test percent. The main learning measure. |
| `pretest_minutes` | Time spent on the pre-test. |
| `learning_minutes` | Time spent in the learning activity (visualizer or static module). |
| `posttest_minutes` | Time spent on the post-test. |
| `study_minutes` | Total time across the whole session. |
| `pretest_ended_by` / `posttest_ended_by` | `manual` (they clicked continue) or `timer` (time ran out). |
| `lesson_completed` | `yes` if they finished the learning activity. |
| `examples_tried` | Which lesson examples they opened. Currently just `linkedlist`. |
| `measured_lesson_id` | The lesson the scores are tied to (`linkedlist`). |
| `consent_version` | Which consent text they agreed to, for the record. |
| `pretest_responses_json` | Their raw typed answers on the pre-test (see below). |
| `posttest_responses_json` | Their raw typed answers on the post-test. |
| `consent_completed_at` | Timestamp they agreed to participate (UTC). |

## The response JSON

`pretest_responses_json` and `posttest_responses_json` hold exactly what the participant
typed, keyed by field. For the object-reference trace question the keys look like:

- `q1.table.step2.col_a` ... `q1.table.step5.col_c` - one per table cell (steps 2 to 5,
  three columns each). Row 1 is pre-filled and not stored.
- `q1.output.line1`, `q1.output.line2` - the two "what does this print" answers.

Example (one participant's pre-test):

```json
{
  "q1.table.step2.col_a": "\"Rex\" / 3",
  "q1.table.step2.col_b": "\"Bella\" / 5",
  "q1.table.step2.col_c": "not yet created",
  "q1.output.line1": "Max, 5",
  "q1.output.line2": "Max, 5"
}
```

A missing key means the participant left that cell blank. The pre-test uses a Dog example
and the post-test a parallel Book example, so the two are scored on the same concepts
without reusing the exact question.

## Privacy

No names, emails, student IDs, or anything identifying is stored. The participant ID is the
only key, and it is not linked to identity anywhere in the app. The end-of-study
questionnaire (hosted outside the app) and the gift-card form (email only, separate) are the
only places a participant types anything personal, and both are kept apart from this table.
