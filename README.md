# Neurobelle — Booking v2 (PatientSky integration)

Mode 1: Service landing in our plum/beige design → patient clicks "Fortsett til PatientSky" → PatientSky's official booking iframe slides in below.

## Files

```
sq_patch_v2/
├── README.md
├── preview.html                        ← LOCAL preview (double-click)
├── custom-css/
│   └── booking.css                     ← styles
└── code-injection/
    └── booking-footer.html             ← UI logic + PatientSky integration
```

## Configure your PatientSky provider ID

Open `code-injection/booking-footer.html` and find:

```js
const PS_PROVIDER_ID = (window.NB_PS_PROVIDER_ID || 'YOUR-PROVIDER-ID-HERE').trim();
```

Replace `YOUR-PROVIDER-ID-HERE` with your real `serviceProviderId` (UUID format, e.g. `568db2f2-f092-11ec-afa8-0279e8a60d81`).

You get this from PatientSky admin (ask their support if you can't find it — it's the same UUID that appears in their embedded URLs).

**Until the real ID is configured**, the page falls back gracefully:
- Shows a "Visuell prototype" banner at top
- Clicking "Fortsett" opens a "Online booking er på vei" panel with an email contact button instead of a broken iframe

## Optional: per-service deep links

Once each service has its own `timeslotTypeId` UUID in PatientSky, fill them into the `SERVICES` array in `booking-footer.html`. The patient will then land directly on the right slot type instead of needing to pick again inside PatientSky.

## Local preview

Open `preview.html` directly (double-click in Finder, or open via `http://127.0.0.1:8765/preview.html` if you have the local server running).

## Deploy to Squarespace

1. **Custom CSS panel** — paste `custom-css/booking.css` (append to whatever you already have). Save.
2. **Settings → Advanced → Code Injection → FOOTER** — paste `code-injection/booking-footer.html`. Save.
3. Create a Squarespace page (e.g. `/bestill`). Add one **Code block** containing only:
   ```html
   <div id="nb-booking"></div>
   ```
4. Save the page. Open in incognito.

The booking UI only renders on pages with that `<div>`, so leaving the footer code site-wide is safe.

## Notes / caveats

- PatientSky's iframe requires modern browsers and may need to whitelist your domain on their side once you go live. Ask their support if the iframe shows a blank/refused state.
- The iframe height is fixed at 820px desktop / 640px mobile. PatientSky should handle internal scrolling fine, but if you want it taller adjust `.nb-frame { height: ... }` in `booking.css`.
- The "Lukk" button closes the iframe without confirming a booking — useful if the patient changes their mind.
