# Running the Study App on Your Mac

A simple guide to open the app on your MacBook. No coding needed. About 10 minutes
the first time, then one step after that.

**Works on any Mac** (Intel or Apple Silicon M1/M2/M3/M4) running **macOS 11 or
newer**. You do not need to know your chip type. You do not need Java or a database.

**Two things to get from Vinny first:**
1. The project folder (download in Step 2).
2. A file named `.env.local` (he sends this separately). It holds the keys that make
   the app work. Keep it private.

---

## Step 1: Install Node (one time)

1. Go to **https://nodejs.org** and download the big green **LTS** button.
2. Open the downloaded file and click through: Continue, Agree, Install. Enter your
   Mac password if asked.

That is it. Node is the engine the app runs on, and the installer picks the right
version for your Mac automatically.

---

## Step 2: Download the project

1. Go to **https://github.com/vinnypronel/code-visualizer-**
2. Click the green **Code** button, then **Download ZIP**.
3. In your **Downloads** folder, double-click the ZIP to unzip it.
4. Drag the unzipped folder onto your **Desktop** so it is easy to find.

---

## Step 3: Add the settings file

Open the folder until you find the inner **`visualizer-ui`** folder (it contains a
file called `package.json`). Drag the **`.env.local`** file Vinny sent you **into
that `visualizer-ui` folder**.

---

## Step 4: Open Terminal and go to the folder

1. Open **Terminal** (press Command+Space, type `Terminal`, press Return).
2. Type `cd` and a space. Do not press Return yet.
3. Drag the **`visualizer-ui`** folder from Finder onto the Terminal window. It fills
   in the path for you.
4. Now press Return.

---

## Step 5: Start it (first time)

Copy and paste this line, then press Return:

```
npm install && npm run dev
```

Wait a minute or two. When it prints a line with **http://localhost:3000**, open
that address in your web browser (Safari or Chrome). The app loads.

**Keep the Terminal window open while you use the app.**

---

## Opening the app again on another day

You do not repeat the install. Just:
1. Open Terminal, type `cd` and a space, drag the `visualizer-ui` folder in, press Return.
2. Paste this and press Return:

```
npm run dev
```

3. Open **http://localhost:3000**.

To stop the app: click the Terminal window and press **Control+C**.

---

## Finding your way around the app

- It opens on the **consent screen**, exactly what a real participant sees.
- Click the small green **"dev"** button in the **bottom-right corner** to jump to any
  screen: consent, pre-test, the AI or static learning screen, post-test, or the end.
- On the AI learning screen: click **Begin Lesson**, then **Run This Line** to step
  through. The live AI explanation shows at the bottom under "Explanation of this line."

---

## If something goes wrong

- **"command not found: npm"** - Node did not finish installing, or Terminal needs a
  restart. Redo Step 1, then quit and reopen Terminal.
- **The page shows an error about keys or Supabase** - the `.env.local` file is missing
  or in the wrong spot. It must be inside the `visualizer-ui` folder (Step 3), named
  exactly `.env.local`.
- **It says a port is in use** - the app just picks another number. Use the exact
  address it prints instead of 3000.
- **Still stuck** - screenshot the Terminal window and send it to Vinny.
