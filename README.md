# AI-Powered Interactive Code Visualization

A research study app that teaches Java program execution, built for the CRA
UR2PhD Undergraduate Research Experience at Kean University.

**Live study app:** https://code-visualizer-alpha.vercel.app

**Running it on your own Mac:** see [Running Locally on a Mac](#running-locally-on-a-mac).

Participants either step through an interactive visualizer that shows the
call stack, heap, and variables changing line by line, or study the same
material as static readings. Pre-test and post-test scores are compared between
the two groups.

## Research

- **Question:** Does an AI-assisted interactive visualizer help first-year
  students understand Java execution better than static reading materials?
- **Design:** Between-subjects. Odd participant numbers get the visualizer,
  even numbers get the static materials.
- **Flow:** Consent, participant ID, pre-test, learning phase, post-test,
  questionnaire.
- **Team:** Vincent Pronel and Kiana Becca Nuñez, with faculty mentor
  Dr. Yan Ma, Department of Computer Science and Technology, Kean University.

The study is IRB approved. No participant data is stored in this repository.

## Stack

- Next.js 16, React 19, TypeScript, Tailwind CSS v4
- Supabase (Postgres), written only through server-side API routes
- Cloudflare Turnstile on participant ID assignment
- java_jail (JDI-based Java tracer) for real execution traces
- JavaParser for AST exploration (prototype)

## Repository Layout

```text
visualizer-ui/   The study app (Next.js). Start here.
parser-spike/    Maven prototype that parses Java with JavaParser and walks the AST.
LICENSE          MIT
```

Setup, environment variables, database migrations, and the participant flow
are documented in [visualizer-ui/README.md](visualizer-ui/README.md).

## Running Locally on a Mac

A simple guide to open the app on your MacBook. No coding needed. About 10 minutes
the first time, then one step after that.

**Works on any Mac** (Intel or Apple Silicon M1/M2/M3/M4) running **macOS 11 or
newer**. You do not need to know your chip type. You do not need Java or a database.

**Two things to get from Vinny first:**
1. The project folder (download in Step 2).
2. A file named `.env.local` (he sends this separately). It holds the keys that make
   the app work. Keep it private.

---

### Step 1: Install Node (one time)

1. Go to **https://nodejs.org** and download the big green **LTS** button.
2. Open the downloaded file and click through: Continue, Agree, Install. Enter your
   Mac password if asked.

That is it. Node is the engine the app runs on, and the installer picks the right
version for your Mac automatically.

---

### Step 2: Download the project

1. Go to **https://github.com/vinnypronel/code-visualizer**
2. Click the green **Code** button, then **Download ZIP**.
3. In your **Downloads** folder, double-click the ZIP to unzip it.
4. Drag the unzipped folder onto your **Desktop** so it is easy to find.

---

### Step 3: Add the settings file

Open the folder until you find the inner **`visualizer-ui`** folder (it contains a
file called `package.json`). Drag the **`.env.local`** file Vinny sent you **into
that `visualizer-ui` folder**.

---

### Step 4: Open Terminal and go to the folder

1. Open **Terminal** (press Command+Space, type `Terminal`, press Return).
2. Type `cd` and a space. Do not press Return yet.
3. Drag the **`visualizer-ui`** folder from Finder onto the Terminal window. It fills
   in the path for you.
4. Now press Return.

---

### Step 5: Start it (first time)

Copy and paste this line, then press Return:

```
npm install && npm run dev
```

Wait a minute or two. When it prints a line with **http://localhost:3000**, open
that address in your web browser (Safari or Chrome). The app loads.

**Keep the Terminal window open while you use the app.**

---

### Opening the app again on another day

You do not repeat the install. Just:
1. Open Terminal, type `cd` and a space, drag the `visualizer-ui` folder in, press Return.
2. Paste this and press Return:

```
npm run dev
```

3. Open **http://localhost:3000**.

To stop the app: click the Terminal window and press **Control+C**.

---

### Finding your way around the app

- It opens on the **consent screen**, exactly what a real participant sees.
- Click the small green **"dev"** button in the **bottom-right corner** to jump to any
  screen: consent, pre-test, the AI or static learning screen, post-test, or the end.
- On the AI learning screen: click **Begin Lesson**, then **Run This Line** to step
  through. The live AI explanation shows at the bottom under "Explanation of this line."

---

### If something goes wrong

- **"command not found: npm"** - Node did not finish installing, or Terminal needs a
  restart. Redo Step 1, then quit and reopen Terminal.
- **The page shows an error about keys or Supabase** - the `.env.local` file is missing
  or in the wrong spot. It must be inside the `visualizer-ui` folder (Step 3), named
  exactly `.env.local`.
- **It says a port is in use** - the app just picks another number. Use the exact
  address it prints instead of 3000.
- **Still stuck** - screenshot the Terminal window and send it to Vinny.

## Optional: Live Java Tracing

The `/api/trace` route runs user-written Java through java_jail and turns the
trace into steps the visualizer can play. It is off in production builds and
is not part of the study flow. java_jail is GPL licensed, so it is not included
in this repository. To enable tracing locally:

1. Install JDK 21.
2. From the repository root, clone java_jail into `java-jail-spike` and check
   out the tested commit:

   ```bash
   git clone https://github.com/daveagp/java_jail.git java-jail-spike
   cd java-jail-spike
   git checkout a692605
   ```

3. Apply two changes so the tracer works on JDK 9 and newer:
   - In `cp/traceprinter/JDI2JSON.java`, add `"jdk"` to the
     `builtin_packages` array. Then, in the method that reads a stack frame's
     local variables, add a catch for `com.sun.jdi.OpaqueFrameException` next
     to the existing JDWP error handling, and set `JDWPerror = true` inside
     it. Newer JDKs throw this exception where older ones returned JDWP
     error 35.
   - In `cp/traceprinter/JSONTracingThread.java`, add `"jdk.*"` to the
     `no_breakpoint_requests` array. The existing
     `"jdk.internal.org.objectweb.asm.*"` entry can be removed, since
     `"jdk.*"` covers it.

4. Compile the tracer with JDK 21 from inside `java-jail-spike/cp`:

   ```bash
   javac -cp ".:javax.json-1.0.jar" $(find . -name "*.java")
   ```

   On Windows, use `;` instead of `:` in the classpath.

5. If your JDK or tracer folder is somewhere else, set `JAVA_BIN` and
   `JAVA_JAIL_DIR` in `visualizer-ui/.env.local` (see `.env.example`).

java_jail's chroot sandbox only works on Linux. On other systems the tracer
runs code with your own user permissions, so only trace code you trust.

## License

MIT. See [LICENSE](LICENSE).
