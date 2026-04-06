# StreamAsian Codebase Documentation

This document provides an overview of the key client-side source files for the StreamAsian platform, detailing their specific purposes, functionalities, and interactions.

## 1. `admin_app.js` (Admin Dashboard Logic)
**Purpose:** Serves as the core logic for the administrative control panel.
**Key Features:**
- **Authentication Guard:** Runs on load (`requireAuth()`) to ensure the session in `localStorage` has admin privileges. Unauthorized access routes back to `login_page.html`.
- **Data Hydration:** Uses Firebase Firestore to fetch both `users` and `videos`. It maps User IDs to human-readable names and emails so that videos display context about their uploaders.
- **Search & Filtering:** Stores current view states (`currentCategory` and `searchQuery`). The dashboard dynamically updates its grid without a full page refresh based on these parameters.
- **Video Management System:** Enables admins to execute a hard delete on any video. During deletion, it forces the admin to explain *why* the video was removed, which then dispatches a custom Firestore message object directly to the uploader's `notifications` collection.

## 2. `login_page.js` (Authentication Module)
**Purpose:** Drives the behavior of the authentication gateway (sign-in and sign-up).
**Key Features:**
- **Dynamic Form Toggling:** Swaps viewing states between the Login and Registration forms.
- **Admin Configuration Override:** Contains hardcoded credential checks (`vinodmane4746@gmail.com`) designed to bypass standard login processes, directly creating an admin `localStorage` session and redirecting to the admin view.
- **Standard Authentication Flow:** Validates existing user credentials by querying the `users` Firestore collection or creates a new document upon registration. It tracks user attributes including Name, Email, Student ID, and Department.

## 3. `player.js` (Video Player Module)
**Purpose:** Operates the dedicated video playback interface.
**Key Features:**
- **Authentication Guard:** Defends video playback from unauthenticated guests (`localStorage` check).
- **Video Loading & Selection:** Fetches all available videos and parses the browser url (`?id=`) to mount the correct video into the main playback window alongside its title and description.
- **Sidebar Integration:** Generates a dynamic sidebar queue that populates with all remaining videos. Clicking a sidebar item replaces the main video dynamically.

## 4. `user_panel.html` (User Profile Interface)
**Purpose:** Provides a comprehensive single-page application layout for account management and personal details.
**Key Features:**
- **In-page Navigation Loop:** Contains isolated tabs corresponding to separate sections: Overview, Bio, My Videos, Security, and Personalization.
- **Extensive UI Design Elements:** Houses a large block of embedded CSS. It utilizes modern design paradigms—including fully CSS-driven dark/light mode toggling, toast notification animations, and complex grid structures.
- **Feature-Rich Components:** Contains the markup templates needed for diverse actions such as:
  - Checking a custom styled Notification Bell dropdown.
  - Interactive "Banner" and "Avatar" upload regions.
  - A comprehensive "Security" form with password strength meters, dummy 2FA SMS inputs, and profile visibility (Public, Friends, Private) selection cards.

## 5. `style.css` (Global Stylesheet)
**Purpose:** The central stylesheet bridging the design aesthetic for core platform pages, such as the homepage and index directory.
**Key Features:**
- **Theme Definition:** Relies on CSS Custom Properties (Variables) to establish color palettes, mainly prioritizing a stark dark mode (`--bg:#0a0a0f`) mixed with "Netflix-like" primary red highlights (`--red:#e50914`).
- **Interactive Header:** Implements a sticky, transparent blur navigation bar holding dynamic floating login/upload buttons.
- **Upload Modal Overlay:** Outlines the styling for the "Upload Video" pop-up. Defines the dimensions, animations (`popIn`), and drop-zone visual cues.
- **Video Grid Display:** Includes a flexible column grid (`auto-fit`, `minmax`) equipped with video-card interactions (subtle 3D hover lifting and thumbnail scaling) to deliver a modern media browsing experience.
