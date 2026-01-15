![Harian Muslim Preview](public/og-images.webp)
# Harian Muslim — Daily Islamic Worship Companion

**[Live App](https://harian-muslim.vercel.app/)** | **[GitHub Repository](https://github.com/caseinn/harian-muslim)**

A **daily worship platform** for Muslims: Qur’an reading, prayer times, and daily supplications — designed to support spiritual consistency with intentionality and ease.

> 🌙 **Human devotion over automation** — We don’t track streaks. We preserve presence, reflection, and sacred moments.

---

## 🌙 Purpose & Vision

**Harian Muslim** is built for those who seek to anchor their day in remembrance of Allah — through structured yet serene access to the Qur’an, accurate prayer schedules, and meaningful daily prayers.

Worship often unfolds in quiet mornings, rushed commutes, or late-night reflections.  
Harian Muslim preserves that rhythm — **in practice**, not metrics.

> **Core Philosophy**  
> *“We do not gamify your ibadah. We help you return to it — gently, consistently, and with clarity.”*

---

## ✨ Key Features

- **Qur’an Module**  
  Browse surahs, read in mushaf page mode, listen to recitations per surah or page, and resume from your last reading (saved in `localStorage`).

- **Prayer Times**  
  Accurate sholat schedules based on manual or auto-detected location, with live countdown timers and optional push notifications.

- **Daily Du'a**  
  Curated list of essential daily prayers, grouped by occasion, with Arabic script, Latin transliteration, and Indonesian translation — paginated for calm reading.

- **User Experience Enhancements**  
  - Theme switch (light/dark)
  - Persistent bottom navigation
  - Floating sedekah button (QR + DANA link)

---

## 🧪 How It Works

1. **Static Content** (Qur’an & Doa) is pre-snapshotted into `public/snapshots/` for fast, SSG-friendly delivery.
   - Includes: `quran-surah-list.json`, `quran-surah-detail.json`, `quran-page-index.json`, `doa.json`
   - Generated via `snapshot-content.mjs` using official sources (`equran.id`, `quran.com`)

2. **Prayer Times** are fetched at runtime from [`https://equran.id/api/v2/shalat`](https://equran.id/api/v2/shalat) based on user location.

3. **Push Notifications** for prayer reminders:
   - Subscriptions stored securely in Supabase
   - Triggered via cron job calling `/api/push/cron`
   - Sent using `web-push` with VAPID keys

4. **UI Interactivity** handled selectively via React 19 islands (e.g., audio players, theme toggle), embedded in Astro’s SSR output.

No ads. No distractions.  
Only **intentional acts of worship**.

---

## 🧩 Core Modules

### 📖 Qur’an
- Surah list (`/quran`)
- Surah detail (`/quran/[id]`)
- Mushaf page view (`/quran/halaman/[id]`)
- Per-surah/page audio recitation
- “Last read” persistence via `localStorage`

### 🕋 Prayer Times (`/sholat`)
- Location-based schedule (manual or geolocation)
- Real-time countdown to next prayer
- Push notification opt-in/out

### 🤲 Daily Du'a (`/doa`)
- Grouped by context (morning, evening, travel, etc.)
- Trilingual display: Arabic, Latin, Terjemahan
- Pagination for focused reading

### 🏠 Landing Page (`/`)
- Hero section
- “Today at a Glance” (next prayer, current hijri date)
- Feature highlights

---

## 🎨 Design & Experience

- **Calm-first interface** optimized for spiritual focus
- **Font stack**:
  - `Amiri` (Arabic script)
  - `Crimson Pro` & `Lora` (serif for Latin/translation)
  - All served locally as `woff2` for privacy and speed
- **Responsive & mobile-first** — built for use on the go
- **View Transitions** (Astro 5) for smooth navigation
- **Persistent navbar** with quick access to core features

Every pixel serves **khushu’**, not engagement.

---

## 🔒 Security & Reliability

- **Security Headers** enforced via `middleware.ts` (CSP, HSTS, X-Frame-Options)
- **Push Subscriptions** stored in Supabase with service role key (server-only)
- **Input Validation** on all API routes
- **No third-party trackers** — fully self-contained PWA

Built to be **lightweight, private, and trustworthy**.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Astro 5 (SSR output via `@astrojs/vercel`)
- **Interactive Islands**: React 19 (for audio, theme, notifications)
- **Styling**: Tailwind CSS v4 + `tw-animate-css`
- **UI Components**: Radix UI, `cmdk`, `lucide-react`, `react-icons`
- **PWA**: `site.webmanifest`, custom `sw.js` for push support

### Backend / Server
- **API Routes**: Astro-native (`src/pages/api/*`)
- **Database**: Supabase (for push subscription storage)
- **Notifications**: `web-push` + external cron scheduler
- **Data Sources**: `equran.id` (prayer times), `quran.com` (page index)

---

## 🌐 SEO & Metadata

- Auto-generated `sitemap.xml` and `robots.txt`
- Full OpenGraph & Twitter Card support
- Semantic HTML for accessibility
- Static snapshots ensure crawlability of Qur’an and doa content

---

## 🚫 What Harian Muslim Is *Not*

- Not a gamified habit tracker
- Not a social media platform
- Not a fatwa or tafsir service
- Not reliant on external CDNs for core content

There are no leaderboards, badges, or analytics.  
Only **space for your ibadah**.

---

## 💡 Why Harian Muslim Exists

In a world of noise and urgency, daily worship can feel fragmented.  
Harian Muslim exists to **slow down the rhythm of remembrance** — offering a clean, reliable, and spiritually considerate space to connect with Allah.

> Think of it as your **digital mus'haf and prayer mat** —  
> always ready, always respectful.

---

## 📄 License

MIT License — free to use, adapt, or share for personal, educational, or community projects.

> Created by **[Dito Rifki Irawan](https://instagram.com/ditorifkii)** (@caseinn)  
> 🌙 For those who seek to begin and end their day with *bismillah*.

---

## ❤️ Support

If this app brings peace to your daily routine:
- ⭐ Star the repo
- 🔗 Follow [@ditorifkii on Instagram](https://instagram.com/ditorifkii) or explore more on [GitHub @caseinn](https://github.com/caseinn)

---

Read with tarteel. Pray with khushu’. Du'a with certainty.