# Machocise — Product & Technical Plan

Camera-based exercise form checker: browse the full exercise library, start a workout, and get live feedback (green flash + sound = good rep, red flash + shake + sound = bad rep) using webcam or phone camera pose tracking.

## 1. Goals

- Import the full exercise catalog from [hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset) (1,324 exercises) as a browsable library.
- Use the device camera (webcam or phone), with an explicit permission step, to track the user's body during a workout.
- For **as broad a set of exercises as possible**, automatically count reps and judge each rep as correct/incorrect form, using **generic movement-pattern heuristics** (not hand-tuned rules per exercise — see §4).
- On each rep: flash a colored overlay (green/red), shake the counter on a bad rep, play a matching sound, and update a running score.
- No backend, no accounts — everything runs client-side, session history stored locally in the browser.

## 2. Data Source

The dataset repo ships `data/exercises.json`: metadata only (name, body part, target/secondary muscle, equipment, instructions in 6 languages, a `media_id` pointing at ExerciseDB assets it does **not** include). There are **no images, GIFs, videos, or pose/angle data** in the dataset.

Implications for the plan:
- **No exercise media out of the box.** The library UI shows text/metadata; if we want thumbnails later, that's a separate sourcing task (ExerciseDB API/licensing), out of scope for this plan.
- **No ground-truth form data.** "Correct form" detection can't be looked up — it has to be computed live from pose landmarks using the generic rule engine described below.
- License note: dataset derives from ExerciseDB v1; the app should carry the same attribution and defer to ExerciseDB's terms for any future media reuse.

Ingestion: a build-time script fetches/vendors `exercises.json` into the repo, then runs it through a **classification pass** (§3) that tags each exercise with a movement-pattern archetype and stores the enriched JSON as the app's local dataset (no runtime dependency on the upstream repo).

## 3. Movement-Pattern Classification (how "broad coverage" works)

Since we can't write bespoke joint-angle rules for 1,324 exercises, each exercise is mapped to one of a small set of **movement-pattern archetypes** based on its existing metadata (name keywords, `bodyPart`, `targetMuscle`, `equipment`). The archetype — not the specific exercise — determines which generic rep/form checks apply.

| Archetype | Example exercises | Primary joints tracked |
|---|---|---|
| Squat / knee-dominant | squats, leg press | Knee & hip angle |
| Hinge / hip-dominant | deadlifts, hip thrusts | Hip angle, spine angle |
| Push (horizontal/vertical) | push-ups, presses | Elbow & shoulder angle |
| Pull / curl (single-joint) | bicep curls, rows | Elbow angle, upper-arm stability |
| Lunge / unilateral leg | lunges, step-ups | Front/back knee angle, torso lean |
| Raise / lateral | lateral raises, leg raises | Shoulder/hip abduction angle |
| Plank / static hold | planks, isometric holds | Hip-shoulder-ankle alignment over time |
| Rotation / twist | Russian twists, wood chops | Torso rotation angle |
| Cardio / plyo | jumping jacks, burpees | Full-body vertical displacement + limb spread |
| Unclassified (fallback) | anything not matched | Generic dominant-joint oscillation + ROM consistency only |

Classification is a deterministic keyword/tag lookup (fast, offline, no ML needed) with a fallback bucket so every exercise still gets *some* rep counting, even if form-judgment is weaker for it. Exercises requiring equipment the camera can't see the state of (e.g., resistance-band tension) get counted on body motion only — the plan explicitly does not attempt to infer equipment state from video.

## 4. Pose Detection Pipeline

- **MediaPipe Pose Landmarker** (Tasks Vision, WASM/WebGL), running fully client-side in the browser — video frames never leave the device.
- Camera access via `getUserMedia`, gated behind an explicit **"Enable camera" consent screen** (works identically for desktop webcam and phone browser camera; no native app needed).
- Landmark smoothing (One-Euro or EMA filter) to reduce jitter before angle math.
- Shared utility: compute the angle at any joint from 3 landmarks (e.g., hip-knee-ankle for knee angle). Reused across all archetypes.

## 5. Generic Rep & Form Scoring Engine

Per movement-pattern archetype, a shared state machine drives rep counting and form judgment — this is what lets one engine cover most of the 1,324 exercises without per-exercise tuning:

1. **Calibration** — first ~2 seconds of a set capture the user's neutral/starting joint angles as a baseline (accounts for body proportions/camera angle).
2. **Rep detection** — the archetype's primary joint angle is tracked through phases (e.g., extension → contraction → extension); a full phase cycle = one rep.
3. **Form checks** (generic, apply across exercises in an archetype):
   - **ROM sufficiency** — did the rep reach near-full contraction/extension relative to calibrated baseline (catches "half reps").
   - **Symmetry** — for bilateral movements, left vs. right joint angle deviation within tolerance (catches favoring one side).
   - **Tempo/smoothness** — velocity spikes flag jerky/momentum-assisted reps instead of controlled ones.
   - **Torso/spine stability** — excessive lean or rotation during standing lifts flags compensation/cheating.
   - **Static-hold alignment** (plank archetype) — hip/shoulder/ankle stay roughly colinear over the hold duration.
4. Each rep gets a pass/fail from the weighted combination of applicable checks → drives the green/red feedback event.

**Explicit limitation to carry into the prototype:** generic heuristics are inherently less precise than exercise-specific rules. Expect weaker accuracy for unusual/isolation movements, and for "unclassified" fallback exercises the app should be upfront in the UI that it's only counting motion, not fully judging form.

## 6. Feedback System

- **Correct rep:** brief green full-screen overlay flash, score +1, plays `correct.mp3`.
- **Incorrect rep:** brief red overlay flash, rep counter shakes (CSS animation), plays `incorrect.mp3`.
- **Sound assets:** the two reference clips (myinstants.com meme sounds) are copyrighted third-party audio and shouldn't be scraped/hotlinked into the app. Plan ships with **freely-licensed placeholder sounds** (a short success chime + a negative buzzer) wired through a single `playFeedbackSound(type)` abstraction; you can drop your own downloaded mp3s into `/public/sounds/correct.mp3` and `/public/sounds/incorrect.mp3` later to swap them — no code changes needed.

## 7. App Structure

- **Library / Home** — search & filter the 1,324 exercises by body part, equipment, target muscle (data straight from the dataset).
- **Exercise Detail** — instructions, muscle/equipment info, archetype badge (shows what kind of form-checking it'll get), "Start Workout" button.
- **Live Workout view** — camera feed with pose-skeleton overlay, rep counter, running score, color-flash/shake feedback layer.
- **Session Summary** — reps correct vs. incorrect, accuracy %, duration.
- **History** — locally stored list of past sessions (localStorage/IndexedDB), no login.

## 8. Tech Stack

- Next.js + React + TypeScript
- MediaPipe Pose Landmarker (`@mediapipe/tasks-vision`) for client-side pose estimation
- Local persistence: `localStorage`/IndexedDB (no backend)
- Deployed as a static/PWA-capable web app — same codebase serves desktop webcam and mobile browser camera use cases

## 9. Data Model (local storage)

```
Exercise {
  id, name, bodyPart, equipment, targetMuscle, secondaryMuscles[],
  instructions: { en, es, it, tr, ru, zh },
  archetype: "squat" | "hinge" | "push" | "pull" | "lunge" | "raise" | "plank" | "rotation" | "cardio" | "unclassified"
}

WorkoutSession {
  id, exerciseId, startedAt, endedAt,
  reps: { correct: number, incorrect: number },
  score: number
}
```

## 10. Phased Milestones

1. **MVP** — dataset import + classification pass, library browsing, camera permission flow, pose pipeline wired up, rep counting + form scoring for 2–3 archetypes (squat, push, plank), full feedback loop (color/shake/sound/score) with placeholder sounds, local session history.
2. **Broaden coverage** — implement remaining archetypes (hinge, pull, lunge, raise, rotation, cardio), tune generic thresholds, handle the "unclassified" fallback gracefully in UI.
3. **Polish** — swap in final audio, add pose-skeleton visual overlay, accuracy/UX tuning from real-device testing (lighting, camera angle, mobile performance), PWA install support.

## 11. Open Risks

- Generic (non-exercise-specific) form rules will misjudge some movements — especially unusual equipment or highly technical lifts; the UI should be honest about confidence per archetype.
- Camera angle, lighting, and clothing affect MediaPipe landmark accuracy; the app can't fully control for this, so calibration + on-screen positioning guidance is worth including early.
- Mobile browser performance of pose estimation needs real-device testing; may need a lower-resolution/frame-rate mode for older phones.
- Final sound assets and any exercise media are follow-up sourcing tasks, not covered by this plan.
