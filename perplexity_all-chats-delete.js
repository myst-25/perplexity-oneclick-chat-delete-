// ==UserScript==
// @name         Perplexity Auto Delete All Chats
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Adds a floating button to seamlessly navigate to the library and clear Perplexity chat history.
// @match        https://www.perplexity.ai/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // --- Configuration ---
    const CONFIG = {
        sessionKey: 'pplx-auto-delete-pending',
        debug: true, // Set to false to hide console logs
    };

    const log = (...args) => {
        if (CONFIG.debug) console.log('[Auto-Delete]', ...args);
    };

    // --- DOM Interaction Helpers ---

    /**
     * Dispatches a sequence of events to a DOM element.
     */
    const dispatchEvents = (element, eventTypes, EventClass, options = {}) => {
        eventTypes.forEach(type => {
            element.dispatchEvent(new EventClass(type, {
                view: window,
                bubbles: true,
                cancelable: true,
                ...options
            }));
        });
    };

    /**
     * Bypasses React's synthetic event system by simulating full user interaction.
     */
    const triggerReactInteraction = (element, requireKeyboardFallback = false) => {
        if (!element || !document.body.contains(element)) return;

        // 1. Accessibility focus
        try { element.focus(); } catch (e) {}

        // 2. Target inner text wrappers (Perplexity often attaches onClick to inner divs)
        const target = element.querySelector('div') || element;

        // 3. Simulate standard mouse flow
        dispatchEvents(target, ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'], MouseEvent, { buttons: 1 });

        // 4. Simulate Space/Enter keys for stubborn React modals
        if (requireKeyboardFallback) {
            dispatchEvents(element, ['keydown', 'keypress', 'keyup'], KeyboardEvent, { key: 'Enter', code: 'Enter', keyCode: 13 });
            dispatchEvents(element, ['keydown', 'keypress', 'keyup'], KeyboardEvent, { key: ' ', code: 'Space', keyCode: 32 });
        }

        // 5. Native click as a final safety net
        try { target.click(); } catch (e) {}
        if (target !== element) {
            try { element.click(); } catch (e) {}
        }
    };

    /**
     * Polls the DOM until an element appears, optionally matching specific text.
     */
    const waitForElement = async (selector, expectedTexts = [], timeoutMs = 5000) => {
        const startTime = Date.now();

        while (Date.now() - startTime < timeoutMs) {
            const elements = Array.from(document.querySelectorAll(selector));

            if (expectedTexts.length > 0) {
                const match = elements.find(el => {
                    const text = el.textContent.trim();
                    return expectedTexts.some(expected => text.includes(expected));
                });
                if (match) return match;
            } else if (elements.length > 0) {
                return elements[0];
            }

            // Wait 200ms before checking again
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        return null;
    };


    // --- Core Application Logic ---

    /**
     * Executes the UI click sequence to delete all threads.
     */
    const clearChatHistory = async () => {
        log('Initiating chat clearance sequence...');

        // Step 1: Open options menu
        const menuBtn = await waitForElement('button[aria-label="Thread options"]');
        if (!menuBtn) return log('Error: Thread options menu not found.');
        triggerReactInteraction(menuBtn);

        await new Promise(resolve => setTimeout(resolve, 400)); // Allow dropdown to render

        // Step 2: Select "Delete All..."
        const deleteOption = await waitForElement('[role="menuitem"]', ['Delete All...']);
        if (!deleteOption) return log('Error: Delete menu item not found.');
        triggerReactInteraction(deleteOption);

        await new Promise(resolve => setTimeout(resolve, 800)); // Allow modal to animate fully

        // Step 3: Confirm deletion
        const confirmBtn = await waitForElement('button', ['Delete Threads', 'Yes, Delete']);
        if (!confirmBtn) return log('Error: Final confirmation button not found.');

        log('Confirmation modal detected. Bypassing animation lock...');

        // Fire the interaction multiple times to pierce through modal fade-in UI locks
        [0, 250, 500].forEach(delay => {
            setTimeout(() => triggerReactInteraction(confirmBtn, true), delay);
        });

        log('Clearance payload delivered successfully.');
    };


    // --- UI Injection & Initialization ---

    const injectFloatingButton = () => {
        // Prevent duplicate buttons in SPAs
        if (document.getElementById('pplx-auto-delete-btn')) return;

        const btn = document.createElement('button');
        btn.id = 'pplx-auto-delete-btn';
        btn.textContent = '🗑️ Auto Delete';
        btn.title = 'Delete all Perplexity chats';

        // Styling
        Object.assign(btn.style, {
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: '999999',
            backgroundColor: '#ef4444',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 16px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            transition: 'background-color 0.2s ease',
        });

        btn.addEventListener('mouseover', () => btn.style.backgroundColor = '#dc2626');
        btn.addEventListener('mouseout', () => btn.style.backgroundColor = '#ef4444');

        // Click handler
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            // If already on the library page, execute. Otherwise, route there first.
            if (window.location.pathname.startsWith('/library')) {
                clearChatHistory();
            } else {
                sessionStorage.setItem(CONFIG.sessionKey, 'true');
                window.location.href = 'https://www.perplexity.ai/library';
            }
        });

        document.body.appendChild(btn);
    };

    const bootstrap = () => {
        injectFloatingButton();

        // Check if we arrived here via a redirect from the auto-delete button
        if (sessionStorage.getItem(CONFIG.sessionKey)) {
            sessionStorage.removeItem(CONFIG.sessionKey);
            // Allow SPA hydration to finish before interacting with the DOM
            setTimeout(clearChatHistory, 1000);
        }

        // MutationObserver ensures the button persists as the user navigates the SPA
        const observer = new MutationObserver(() => {
            if (!document.getElementById('pplx-auto-delete-btn')) {
                injectFloatingButton();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    };

    // Initialize script safely
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }

})();