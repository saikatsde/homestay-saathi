# 🏡 Homestay Saathi: Homestay Helper for Garden Villages 🟠
# **Offline Toolkit for First-Time Homestay Hosts**

This project is an essential, offline-first mobile application designed to empower tea-garden families, particularly women who make up most of the tea workforce, to successfully utilize homestays as a reliable second source of income.

It serves as a comprehensive toolkit for first-time hosts, bridging communication gaps, managing finances, and marketing effectively, all while running reliably on low-end Android phones without needing a continuous internet data plan.

---

### ✨ Key Features

**🌍 Multilingual Communication:**
*   **Nepali ↔ Hindi/Bengali/English:** Facilitates clear communication between hosts and guests across major local languages.
*   **On-Device Translation:** Enables guests to interact using native languages even when offline.

**💰 Financial Management:**
*   **Simple Bookings & Cash Ledger:** A local, secure ledger (using IndexedDB) to track all bookings, payments received, and expenses. No cloud syncing required for basic operation.

**📝 Listing & Pricing Assistant:**
*   **Listing Generation:** AI assistance to help users write compelling, marketable property listings (suitable for platforms like Airbnb or local portals).
*   **Smart Pricing:** Tools to help calculate and suggest competitive pricing models based on local data and occupancy.
*   **Web Share Integration:** Allows users to easily generate and share optimized listings when they are temporarily in an area with connectivity.

**✅ Host Checklist & Guidance:**
*   **Hosting Checklist:** A step-by-step guide for first-time hosts covering everything from guest arrival protocols to local regulations.

---

### ⚙️ Technical Deep Dive

This application is built with an **offline-first, resource-constrained environment** in mind:

*   **Offline Core:** All core functionalities (ledger, checklists, basic translation) operate entirely on the device (IndexedDB).
*   **On-Device AI:** Utilizes on-device Large Language Models (LLMs) for privacy and guaranteed functionality without constant data usage.
*   **Platform Target:** Optimized to run smoothly on low-end Android devices.

---
### 🚀 Getting Started

Since this is a Next.js application, follow the standard setup process:

1.  **Install Dependencies:**
    ```bash
    npm install
    # or yarn install / pnpm install
    ```

2.  **Run Development Server:**
    ```bash
    npm run dev
    # or yarn dev
    ```

3.  **View App:**
    Open `http://localhost:3000` in your browser. The app will auto-update as you make changes to the source code.

### 🧱 Project Structure Highlights

*   `src/lib/ai/`: Contains the logic for on-device AI features (translation, generation, pricing).
*   `src/lib/db.ts`: Manages the local, persistent IndexedDB ledger.
*   `src/components/sections/`: Houses the modular UI components for different sections (Ledger, Dashboard, Listing Assistant).
*   `src/app/`: Defines the routing structure for the mobile interface.

### 📚 Learn More

*   **Next.js Documentation:** For general Next.js features: [https://nextjs.org/docs](https://nextjs.org/docs)
*   **Development:** Feel free to explore and modify the source files within the `homestay-saathi/src` directory.

---
*Project Developed with a focus on empowering communities through technology.*

