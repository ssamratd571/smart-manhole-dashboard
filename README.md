# Smart Manhole Monitoring Dashboard

React + Vite dashboard for the ESP32 Smart Manhole Firebase data.

## Firebase data expected

```text
SmartManhole/
  Manhole_01/
    current/
      temperature
      humidity
      water_level_cm
      gas_raw
      water_status
      gas_status
      timestamp
    history/
      20260929_100023/
        ...
```

## 1. Open in VS Code

Open this folder:

`smart-manhole-dashboard`

## 2. Install packages

```bash
npm.cmd install
```

If PowerShell blocks npm, use `npm.cmd` as above.

## 3. Configure Firebase

Open:

`src/firebase.js`

Replace:

- `YOUR_FIREBASE_WEB_API_KEY`
- `YOUR_MESSAGING_SENDER_ID`
- `YOUR_FIREBASE_APP_ID`

Keep the database URL for project `smart-manhole-466a8`.

## 4. Run

```bash
npm.cmd run dev
```

Open the Vite address shown in the terminal.

## 5. Firebase Realtime Database rules

For the current prototype, the ESP32 and dashboard need read/write access according to your project setup. Do not leave a production database publicly writable; use Firebase Authentication and security rules before deployment.

## Notes

The MQ-135 value is displayed as a raw ADC reading, not ppm.

The dashboard uses `current` for live values and `history` for charts and the recent-reading table.
