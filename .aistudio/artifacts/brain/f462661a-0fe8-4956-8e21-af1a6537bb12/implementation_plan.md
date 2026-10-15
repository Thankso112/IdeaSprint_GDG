# Structured Pickup Windows & Emergency Contact System

Integrate structured 30-minute pickup time slot selection across Morning, Afternoon, and Evening schedules with an Emergency/Urgent Rescue contact flow in the FoodBridge surplus food redistribution platform.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following design choices were confirmed during Phase 1 clarification:
> - **Interactive Slot UI**: Interactive time slot buttons grouped by time of day (Morning, Afternoon, Evening) rather than a plain dropdown or raw text input.
> - **Emergency / Urgent Contact Flow**: Immediate pickup badge with priority contact phone and instant broadcast alert generation for time-critical food rescue (< 30 mins).

- **Confirmed Decision 1**: Morning slots (7:00–7:30 AM, 8:00–8:30 AM, 10:00–10:30 AM, 11:00–11:30 AM), Afternoon slots (2:00–2:30 PM, 3:00–3:30 PM), and Evening slots (5:00–5:30 PM, 6:00–6:30 PM, 7:00–7:30 PM, 8:00–8:30 PM, 9:00–9:30 PM, 10:00–10:30 PM).
- **Confirmed Decision 2**: Emergency / Urgent Pickup option with instant badge, direct phone dispatch line, and priority alert broadcasting.
- **Custom Time Fallback**: Donors can still toggle "Custom Window" if they have an irregular operational window.

---

## 1. Overview & Core Concept

Currently, the "Pickup Window" in `DonorPostForm.tsx` uses a freeform single-line text input (`"Available now until 5:00 PM"`). While flexible, freeform text leads to vague handovers and uncertain arrival windows for NGOs and volunteer drivers.

This enhancement introduces:
1. **Curated Time Slot Architecture**: Distinct period tabs (Morning, Afternoon, Evening) containing 30-minute pickup blocks spaced by 30-minute gaps.
2. **Emergency / Urgent Rescue Mode**: A dedicated "Immediate / Emergency Handover" selector that flags food that must be claimed and collected within 30 minutes, automatically attaching an emergency contact line and priority warning on receiver cards.
3. **End-to-End Alignment**: Reflecting the structured time window across Receiver cards, Map pins, My Pickups, and Gemini Multilingual WhatsApp/SMS alert generation.

---

## 2. User Experience & Visual Design

### Key User Flows

#### A. Donor Posting Flow (`DonorPostForm.tsx`)
1. Donor uploads or analyzes food photo (or selects a demo preset).
2. Under "Step 3: Pickup Location & Contact Info", the freeform pickup window is replaced by an **interactive time slot selector**:
   - **Emergency Mode**: A red/amber priority option `"🚨 Immediate Pickup (< 30 Mins)"`. Selecting this reveals an `"Emergency Dispatch Phone"` field.
   - **Period Groups**:
     - 🌅 **Morning (7:00 AM – 12:00 PM)**: `7:00 – 7:30 AM`, `8:00 – 8:30 AM`, `10:00 – 10:30 AM`, `11:00 – 11:30 AM`
     - ☀️ **Afternoon (2:00 PM – 4:00 PM)**: `2:00 – 2:30 PM`, `3:00 – 3:30 PM`
     - 🌙 **Evening (5:00 PM – 11:00 PM)**: `5:00 – 5:30 PM`, `6:00 – 6:30 PM`, `7:00 – 7:30 PM`, `8:00 – 8:30 PM`, `9:00 – 9:30 PM`, `10:00 – 10:30 PM`
   - **Custom Toggle**: Link for entering a custom schedule if needed.
3. Live preview shows selected slot: e.g. `Today: 5:00 PM – 5:30 PM` with clock icon.

#### B. Receiver View & Dispatch Alert (`ReceiverFeed.tsx`, `AlertModal.tsx`)
1. Receiver cards display the exact 30-minute window pill: e.g. `⏰ 5:00 PM – 5:30 PM`.
2. Listings marked with Emergency mode show a vibrant pulsing `"🚨 Emergency Rescue (<30m)"` badge with a direct click-to-call emergency button.
3. When generating WhatsApp/SMS alerts, the alert generator highlights the exact 30-minute pickup window and emergency coordinator line.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Interactive Slot Buttons vs. Native Select Dropdown**
  - *Chosen Approach*: Grouped visual buttons with time-of-day tabs.
  - *Why*: Visual buttons require 1 tap on mobile devices, prevent formatting mistakes, and visually convey available handover periods.
- **Decision 2: 30-Min Duration with 30-Min Gap Pattern**
  - *Chosen Approach*: Strictly implement the user's requested schedule (7–9, 10–12, 2–4, 5–11 with 30m slots: e.g. 4:00–4:30 then 5:00–5:30).
  - *Why*: Allows food prep/packing between windows and prevents driver congestion at donor kitchens.
- **Decision 3: Dedicated Emergency Mode**
  - *Chosen Approach*: Flag listings as `isEmergency: boolean` with optional `emergencyPhone: string`.
  - *Why*: Hot buffet surplus expiring under 1.5 hours requires immediate volunteer dispatch rather than a scheduled evening slot.

---

## 4. Technical Architecture & Component Mapping

```
┌─────────────────────────────────────────────────────────────┐
│                    FoodBridge Application                   │
└──────────────────────────────┬──────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
     ┌──────────────────┐            ┌──────────────────┐
     │  Donor Workflow  │            │ Receiver Workflow│
     └─────────┬────────┘            └─────────┬────────┘
               │                               │
       ┌───────▼────────┐              ┌───────▼────────┐
       │DonorPostForm   │              │ReceiverFeed    │
       │- Slot Grid     │              │- Time Window   │
       │- Urgent Toggle │              │- Urgent Pill   │
       │- Emergency Tel │              │- Direct Call   │
       └───────┬────────┘              └───────┬────────┘
               │                               │
               └───────────────┬───────────────┘
                               ▼
               ┌───────────────────────────────┐
               │    Shared State / Storage     │
               │- FoodListing.pickupWindow     │
               │- FoodListing.isEmergency      │
               │- FoodListing.emergencyPhone   │
               └───────────────────────────────┘
```

### Data Model Updates in `src/types.ts`
- Extend `FoodListing`:
  - `pickupWindow: string` (stores selected 30-min slot or custom window)
  - `isEmergency?: boolean` (true if emergency/urgent pickup)
  - `emergencyPhone?: string` (direct hotline for rapid collection)

### Files to Update
1. `src/types.ts`: Add optional `isEmergency` and `emergencyPhone` fields.
2. `src/components/DonorPostForm.tsx`: Replace freeform text input with structured slot button selector, time-of-day tabs (Morning, Afternoon, Evening), and Emergency Mode toggle.
3. `src/components/ReceiverFeed.tsx` & `src/components/FoodMap.tsx`: Render emergency rescue badge and formatted time window.
4. `src/components/MyPickups.tsx`: Show emergency coordinator call button and pickup window.
5. `src/components/AlertModal.tsx`: Integrate emergency window into WhatsApp/SMS alert text.
