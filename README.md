# 🗑️ Perplexity Auto Delete All Chats

A lightweight, robust userscript that adds a floating button to Perplexity.ai, allowing you to completely wipe your chat history with a single click. 

Built to handle Perplexity's Single Page Application (SPA) architecture and bypass stubborn React/Radix UI modal restrictions.

## ✨ Features
* **One-Click Wipe:** Adds a fixed, unobtrusive "🗑️ Auto Delete" button to the bottom right of your screen.
* **Smart Routing:** If you click the button from the home page, it automatically navigates you to the `/library` and waits for the page to hydrate before executing.
* **React/Radix UI Bypass:** Uses advanced synthetic event dispatching to interact with Perplexity's dynamic DOM, bypassing animation locks and "ghost" elements.
* **SPA Persistent:** Uses a `MutationObserver` to ensure the button stays on your screen even as you navigate around Perplexity without refreshing the page.

## 🛠️ How It Works (Under the Hood)
Modern React-based sites like Perplexity use synthetic event listeners and UI libraries (like Radix UI) that often ignore standard JavaScript `element.click()` commands. 

To overcome this, this script utilizes a custom `triggerReactInteraction` sequence that mimics genuine human interaction:
1. **Focus:** Forces accessibility focus on the element.
2. **Inner Targeting:** Locates the specific `div` wrapper where Perplexity binds its `onClick` events.
3. **Pointer Simulation:** Dispatches a full sequence of `pointerdown`, `mousedown`, `pointerup`, and `mouseup` events.
4. **Keyboard Fallbacks:** For stubborn confirmation modals, it simulates pressing both the `Enter` and `Spacebar` keys to pierce through animation UI locks.

## 📦 Installation Guide

You can install this script on **any browser** (Chrome, Firefox, Safari, Edge, Brave) using a Userscript Manager.

### Step 1: Install a Userscript Manager
Choose one of the following browser extensions and install it:
* **[Tampermonkey](https://www.tampermonkey.net/)** (Most popular - Chrome, Firefox, Safari, Edge)
* **[Violentmonkey](https://violentmonkey.github.io/)** (Open source - Chrome, Firefox, Edge)
* **[Greasemonkey](https://www.greasespot.net/)** (Firefox only)

### Step 2: Install the Script
**Option A: Install via GreasyFork (Recommended)**
1. Go to the script's GreasyFork page: `[Insert your GreasyFork link here]`
2. Click the green **"Install this script"** button.
3. Your userscript manager will prompt you to confirm the installation. Click **Install**.

**Option B: Manual Installation**
1. Click on your userscript manager extension icon and select **"Create a new script"** (or "Add new script").
2. Delete any template code provided.
3. Copy the entire contents of the `script.js` file from this repository and paste it into the editor.
4. Save the script (`Ctrl + S` or `Cmd + S`).

## 🚀 Usage
1. Log into your [Perplexity.ai](https://www.perplexity.ai) account.
2. You will see a red **"🗑️ Auto Delete"** button floating in the bottom right corner.
3. Click it. 
4. Sit back while the script automatically opens the thread options, selects "Delete All...", and confirms the deletion. 

**⚠️ Disclaimer:** *This action is permanent. Perplexity does not have a trash bin, and deleting your library will also empty out any saved Collections. Use with caution.*

## 📝 License
This project is open-source and available under the [MIT License](LICENSE).
