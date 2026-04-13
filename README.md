# WorkHop 🚀

WorkHop is a hyperlocal micro-job platform that connects college students with nearby businesses for short-duration (1–3 hour) tasks. 
Whether you're a student looking to earn some extra cash between classes, or a local business needing temporary help during a rush, WorkHop bridges the gap instantly and reliably.

---

## ⚡ Quick Start (One Command)

We've provided run scripts to install all requirements and launch the application locally with a single command.

**For Windows:**
Double-click `run.bat` or run the following in your terminal:
```cmd
run.bat
```

**For macOS/Linux:**
```bash
./run.sh
```
*(Note: You may need to run `chmod +x run.sh` first to make it executable).*

This will automatically navigate into the `workhop` directory, install all Node dependencies, and start the Next.js development server at [http://localhost:3000](http://localhost:3000).

---

## 🎯 The Problem We Solve

- **For Students:** Finding flexible, short-term work that fits around a hectic class schedule is nearly impossible through traditional job boards.
- **For Businesses:** Finding reliable, immediate help for unexpected rushes (like holiday sales or event setups) is stressful and expensive through full-time hiring or temp agencies.

## 💡 The Solution

WorkHop enables businesses to post a micro-job in seconds. Nearby students receive instant notifications, can apply with one tap, and get hired in minutes. Features like QR code check-ins and mutual rating systems ensure trust and reliability.

---

## ✨ Key Features

- **Hyperlocal Matching:** Jobs and students are matched within a tight radius for maximum convenience.
- **Dual Dashboards:** Custom experiences tailored for both **Students** (job seeking, history, earnings) and **Businesses** (job posting, applicant management, spend tracking).
- **Instant Apply & Hire:** No cover letters, no interviews. Review profiles, select a candidate, and get the job done.
- **Real-Time Job Execution:** Includes worker check-in via QR code and status tracking (Assigned ➔ Checked-In ➔ Completed ➔ Paid).
- **Availability Toggle:** Students can flip their status to "Available" to get matched faster when they have free time.
- **Ratings & Trust System:** Mutual rating ensures high-quality interactions on both sides.
- **High Performance:** Optimized with aggressive frontend caching (Zustand) and efficient Firebase queries for an instant (<300ms) navigation experience.

---

## 🛠️ Tech Stack

- **Frontend Framework:** Next.js (App Router), React
- **Styling:** Tailwind CSS, Framer Motion (for smooth animations and transitions)
- **State Management:** Zustand (for global caching and state)
- **Backend/Database:** Firebase (Firestore, Authentication)
- **Icons:** Lucide React

---

## 🚀 Manual Setup 

If you prefer to set up manually instead of using the quick start script:

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Hyprup_Harrington/workhop
   ```

2. **Install dependencies:**
   For reference, we have included a `requirements.txt` at the root of the project which lists all the core packages. 
   Since this is a Node.js project, you can install all required packages natively with a single command (which acts just like `pip install -r requirements.txt`):
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env.local` file in the root of the `workhop` directory and add your Firebase configuration variables:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

---

## 🏗️ Project Structure Highlights

- `/src/app`: Contains the Next.js App Router structure, including role-specific routes (`/business`, `/student`) and their respective layouts, loading, and error states.
- `/src/components`: Reusable UI components, including the animated landing page, dashboards, layout wrappers, and robust `LoadingSkeleton` and `Toast` components.
- `/src/hooks`: Custom React hooks for standardized Firebase data fetching, caching (`useJobs`, `useUserData`), and authentication (`useAuth`).
- `/src/store`: Global Zustand store for client-side caching to guarantee lightning-fast page transitions without unnecessary database reads.

---

## 🏆 Designed for Hackathons & Beyond

Built with an emphasis on **speed**, **reliability**, and **premium UX**. The platform utilizes dark modern UI aesthetics, glassmorphism, and seamless page transitions to provide an enterprise-grade feel from day one.
