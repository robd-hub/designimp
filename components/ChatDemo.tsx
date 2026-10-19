"use client";

import { useEffect } from "react";

const CHAT_URL =
  "https://robdoughty.app.n8n.cloud/webhook/2845a9e4-4cb3-40b5-824c-67ce29b17be8/chat";
const CHAT_CDN = "https://cdn.jsdelivr.net/npm/@n8n/chat@1.42.6/dist";

// Loads the Design Imp assistant (an n8n chat widget, floating bottom right) on this page only
export default function ChatDemo() {
  useEffect(() => {
    if (document.getElementById("n8n-chat-script")) return;

    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = `${CHAT_CDN}/style.css`;
    document.head.appendChild(style);

    const script = document.createElement("script");
    script.id = "n8n-chat-script";
    script.type = "module";
    script.textContent = `
      import { createChat } from '${CHAT_CDN}/chat.bundle.es.js';
      createChat({
        webhookUrl: '${CHAT_URL}',
        mode: 'window',
        showWelcomeScreen: false,
        initialMessages: [
          "Hi! 👋 I'm the Design Imp assistant.",
          'Ask me anything about websites, AI assistants or getting a free mockup.'
        ],
        i18n: {
          en: {
            title: 'Design Imp',
            subtitle: 'Ask a question, any time',
            footer: '',
            getStarted: 'New conversation',
            inputPlaceholder: 'Type your message...'
          }
        }
      });
    `;
    document.body.appendChild(script);
  }, []);

  return (
    <style>{`
      :root, #n8n-chat {
        --chat--font-family: var(--font-dm-sans), system-ui, sans-serif;
        --chat--color--primary: #C8973A;
        --chat--color--primary-shade-50: #b5872f;
        --chat--color--primary--shade-100: #a07726;
        --chat--color--secondary: #C8973A;
        --chat--color-secondary-shade-50: #b5872f;
        --chat--color-typing: #a0a0a8;
        --chat--window--border: 1px solid #2a2a2e;
        --chat--header--background: #1a1a2e;
        --chat--header--color: #f0f0f2;
        --chat--heading--font-size: 1.5em;
        --chat--header--border-bottom: 1px solid #2a2a2e;
        --chat--body--background: #111113;
        --chat--message--bot--background: #1c1c1e;
        --chat--message--bot--color: #f0f0f2;
        --chat--message--bot--border: 1px solid #2a2a2e;
        --chat--message--user--background: #C8973A;
        --chat--message--user--color: #111113;
        --chat--message--pre--background: #2a2a2e;
        --chat--footer--background: #111113;
        --chat--footer--color: #a0a0a8;
        --chat--input--background: #1c1c1e;
        --chat--input--text-color: #f0f0f2;
        --chat--input--border: 1px solid #2a2a2e;
        --chat--input--container--background: #1c1c1e;
        --chat--input--send--button--background: transparent;
        --chat--input--send--button--color: #C8973A;
        --chat--input--send--button--background-hover: transparent;
        --chat--input--send--button--color-hover: #e0b25a;
        --chat--toggle--background: #C8973A;
        --chat--toggle--hover--background: #b5872f;
        --chat--toggle--active--background: #a07726;
        --chat--toggle--color: #111113;
      }
    `}</style>
  );
}
