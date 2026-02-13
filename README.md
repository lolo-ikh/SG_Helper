# 🏛️ SG Helper
> The Central Operating System for the EBEC Secretary General.

**SG Helper** is a bespoke administrative platform built to streamline the operations of the **ENSIA Business Entrepreneurship Club (EBEC)**. It transitions the Secretariat from manual paperwork to a digital-first, automated ecosystem.

---

## ✨ Core Pillars

### 📅 Meeting & Report Management
- **Minute-Taking Interface:** A clean editor to write and format meeting reports in real-time.
- **Auto-Reference Engine:** Automatically generates and tracks unique reference numbers (e.g., `1\26`) for every official document.
- **Calendar Sync:** One-click scheduling for board and general assembly meetings.

### 👥 Attendance & Accountability
- **Manager Tracking:** A dedicated portal to log attendance for all club managers.
- **Visual Analytics:** Real-time percentage tracking to monitor engagement across different departments.

### 📩 The Mailroom Dispatch
- **Inbox Management:** Track the status of the official EBEC email.
- **Smart Delegation:** Log and assign incoming inquiries to the correct department heads with priority flagging.

---

## 🎨 Design Language
Designed with an **Apple-inspired UI/UX** philosophy:
- **Primary Color:** `#1A237E` (EBEC Navy)
- **Accent Color:** `#FFD700` (EBEC Gold)
- **Typography:** Clean, sans-serif hierarchy for maximum readability during high-pressure meetings.

---

## 🛠️ Technical Architecture

**Frontend:**
- **React.js** (Vite)
- **State Management:** React Context API / Hooks
- **Styling:** Custom CSS3 with Bento-Grid layouts

**Backend:**
- **Node.js & Express**
- **API Architecture:** RESTful
- **Database:** MongoDB (Planned for document persistence)

---

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone [https://github.com/lolo-ikh/SG_Helper.git](https://github.com/lolo-ikh/SG_Helper.git)
   ```
2. **Install Dependencies**
   ```bash
   # For Frontend
    cd client && npm install

    # For Backend
    cd server && npm install
   ```
3. **Run the Development Environment**
   ```bash
   # Terminal 1 (Client)
    npm run dev

    # Terminal 2 (Server)
    node index.js
   ```
## 🛡️ Legacy & Impact
Built by the Secretary General to ensure administrative continuity. This tool is designed not just for current tasks, but as a framework to be passed down to future EBEC administrations.

**Developed for the ENSIA Business Entrepreneurship Club.**
