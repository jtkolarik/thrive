# How to View the Thrive App (Simple Guide)

This is a **mobile app**, so you'll view it on your phone or computer. Here are the easiest ways:

---

## Option 1: View on Your Phone (Easiest!)

### What You Need:
- A smartphone (iPhone or Android)
- The "Expo Go" app (free to download)

### Steps:

1. **Download Expo Go on your phone:**
   - iPhone: Open the App Store and search for "Expo Go"
   - Android: Open the Google Play Store and search for "Expo Go"
   - Install the free app

2. **On your computer, open a Terminal/Command Prompt:**
   - Mac: Press `Command + Space`, type "Terminal", press Enter
   - Windows: Press `Windows Key`, type "Command Prompt", press Enter

3. **Type these commands (press Enter after each one):**
   ```
   cd thrive/apps/mobile
   ```
   Then:
   ```
   npm install
   ```
   (This installs what the app needs - may take a few minutes)

4. **Start the app:**
   ```
   npm start
   ```

5. **A QR code will appear in your Terminal**
   - iPhone: Open your Camera app and point it at the QR code. Tap the notification that appears.
   - Android: Open the Expo Go app, tap "Scan QR Code", and scan the code

6. **The app will open on your phone!**

---

## Option 2: View on Your Computer

### What You Need:
- A computer
- An iPhone/Android simulator (this is more technical)

### Steps:

1. **Open Terminal/Command Prompt** (see instructions above)

2. **Type these commands:**
   ```
   cd thrive/apps/mobile
   npm install
   npm start
   ```

3. **When it starts, press one of these keys:**
   - Press `i` if you have an iPhone simulator
   - Press `a` if you have an Android emulator
   - Press `w` to open in a web browser (limited features)

---

## Troubleshooting

**If you see "npm: command not found":**
- You need to install Node.js first
- Go to https://nodejs.org
- Download and install the "LTS" version
- Then try again

**If the app won't start:**
- Make sure you're in the right folder (`thrive/apps/mobile`)
- Try closing the Terminal and starting over

**If you get stuck:**
- Share the error message and I can help troubleshoot!

---

## Quick Summary

The **simplest way** is:
1. Install "Expo Go" on your phone
2. Run `npm start` on your computer
3. Scan the QR code with your phone

That's it! The app will appear on your phone and you can interact with it like any other app.
