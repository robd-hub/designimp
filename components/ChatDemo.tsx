"use client";

import { useEffect } from "react";

const CHAT_URL =
  "https://robdoughty.app.n8n.cloud/webhook/15fccbc0-8412-4d29-9af4-f5bbb1b5a2f6/chat";
const CHAT_CDN = "https://cdn.jsdelivr.net/npm/@n8n/chat@1.42.6/dist";

// Loads the n8n chat widget (a floating bubble, bottom right) on this page only
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
          'Hi! 👋 I can answer questions or book you a free quote visit.',
          'What can we help with today?'
        ],
        i18n: {
          en: {
            title: 'Smith Plumbing & Heating',
            subtitle: 'Ask a question or book a free quote visit',
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
      :root {
        --chat--color-primary: #C8973A;
        --chat--color-primary-shade-50: #b5872f;
        --chat--color-primary-shade-100: #a07726;
        --chat--color-secondary: #C8973A;
        --chat--toggle--background: #C8973A;
        --chat--toggle--hover--background: #b5872f;
        --chat--toggle--active--background: #a07726;
      }
    `}</style>
  );
}
