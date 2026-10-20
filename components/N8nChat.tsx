"use client";

import { useEffect } from "react";

const CHAT_CDN = "https://cdn.jsdelivr.net/npm/@n8n/chat@1.42.6/dist";

type Props = {
  id: string;
  webhookUrl: string;
  title: string;
  subtitle: string;
  initialMessages: string[];
};

// Loads the n8n chat widget (a floating bubble, bottom right) into its own
// container, so it goes away when the component unmounts
export default function N8nChat({ id, webhookUrl, title, subtitle, initialMessages }: Props) {
  useEffect(() => {
    if (!document.getElementById("n8n-chat-style")) {
      const style = document.createElement("link");
      style.id = "n8n-chat-style";
      style.rel = "stylesheet";
      style.href = `${CHAT_CDN}/style.css`;
      document.head.appendChild(style);
    }

    const options = {
      webhookUrl,
      target: `#${id}`,
      mode: "window",
      showWelcomeScreen: false,
      initialMessages,
      i18n: {
        en: { title, subtitle, footer: "", getStarted: "New conversation", inputPlaceholder: "Type your message..." },
      },
    };

    const script = document.createElement("script");
    script.type = "module";
    script.textContent = `
      import { createChat } from '${CHAT_CDN}/chat.bundle.es.js';
      createChat(${JSON.stringify(options)});
    `;
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [id, webhookUrl, title, subtitle, initialMessages]);

  return (
    <>
      <div id={id} />
      <style>{`
      :root {
        --chat--font-family: var(--font-dm-sans), system-ui, sans-serif;
        --chat--color--primary: #C8973A;
        --chat--color--primary-shade-50: #b5872f;
        --chat--color--primary--shade-100: #a07726;
        --chat--color--secondary: #C8973A;
        --chat--color-secondary-shade-50: #b5872f;
        --chat--color-typing: #a0a0a8;
        --chat--spacing: 1rem;
        --chat--window--width: 380px;
        --chat--window--height: 580px;
        --chat--window--border: 1px solid #2a2a2e;
        --chat--window--border-radius: 20px;
        --chat--header-height: auto;
        --chat--header--padding: 1rem 1.25rem 1rem 4.25rem;
        --chat--header--background: #1c1c1e;
        --chat--header--color: #f0f0f2;
        --chat--heading--font-size: 1rem;
        --chat--subtitle--font-size: 0.8125rem;
        --chat--subtitle--line-height: 1.4;
        --chat--header--border-bottom: 1px solid #2a2a2e;
        --chat--body--background: #111113;
        --chat--messages-list--padding: 1.25rem 1rem;
        --chat--message--font-size: 0.9375rem;
        --chat--message-line-height: 1.5;
        --chat--message--padding: 0.625rem 0.875rem;
        --chat--message--border-radius: 16px;
        --chat--message--margin-bottom: 0.5rem;
        --chat--message--bot--background: #1c1c1e;
        --chat--message--bot--color: #f0f0f2;
        --chat--message--bot--border: 1px solid #2a2a2e;
        --chat--message--user--background: #C8973A;
        --chat--message--user--color: #111113;
        --chat--message--user--border: none;
        --chat--message--pre--background: #2a2a2e;
        --chat--footer--background: #111113;
        --chat--footer--color: #a0a0a8;
        --chat--footer--border-top: 1px solid #2a2a2e;
        --chat--input--background: #1c1c1e;
        --chat--input--text-color: #f0f0f2;
        --chat--input--border: none;
        --chat--input--border-active: none;
        --chat--input--font-size: 0.9375rem;
        --chat--input--container--background: #1c1c1e;
        --chat--input--container--border: 1px solid #2a2a2e;
        --chat--input--container--border-radius: 14px;
        --chat--input--container--padding: 0;
        --chat--input--button--border-radius: 10px;
        --chat--input--send--button--background: #C8973A;
        --chat--input--send--button--color: #111113;
        --chat--input--send--button--background-hover: #e0b25a;
        --chat--input--send--button--color-hover: #111113;
        --chat--toggle--size: 60px;
        --chat--toggle--background: #C8973A;
        --chat--toggle--hover--background: #e0b25a;
        --chat--toggle--active--background: #b5872f;
        --chat--toggle--color: #111113;
      }
      .chat-window-wrapper .chat-window {
        box-shadow: 0 24px 60px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(200, 151, 58, 0.08);
      }
      .chat-window-wrapper .chat-window-toggle {
        box-shadow: 0 10px 30px -6px rgba(200, 151, 58, 0.5);
      }
      .chat-header { position: relative; gap: 0.125rem; }
      .chat-header::before {
        content: "";
        position: absolute;
        left: 1.25rem;
        top: 50%;
        transform: translateY(-50%);
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background-image: url("/logo-icon.png");
        background-size: cover;
        background-position: center;
      }
      .chat-header::after {
        content: "";
        position: absolute;
        left: calc(1.25rem + 27px);
        top: calc(50% + 9px);
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #4ade80;
        border: 2px solid #1c1c1e;
      }
      .chat-header h1 { font-weight: 600; letter-spacing: -0.01em; }
      .chat-header p { color: #a0a0a8; }
      .chat-close-button { color: #a0a0a8; }
      .chat-message { max-width: 85%; }
      .chat-message.chat-message-from-bot { border-bottom-left-radius: 4px; }
      .chat-message.chat-message-from-user { border-bottom-right-radius: 4px; font-weight: 500; }
      .chat-footer .chat-input-left-panel { display: none; }
      .chat-footer .chat-inputs { overflow: hidden; }
      .chat-footer .chat-inputs textarea { padding: 0.75rem 0.875rem; background: transparent; }
      .chat-footer .chat-inputs {
        margin: 0.75rem;
        width: calc(100% - 1.5rem);
        align-items: center;
        transition: border-color 0.15s ease;
      }
      .chat-footer .chat-inputs:focus-within { border-color: #C8973A; }
      .chat-inputs textarea::placeholder { color: #6b6b73; }
      .chat-footer .chat-input-send-button { width: 38px; height: 38px; margin: 0 0.375rem 0 0; font-size: 18px; }
      .chat-footer .chat-input-send-button[disabled] { background: #2a2a2e; color: #6b6b73; }
      @media (max-width: 480px) {
        :root { --chat--window--height: calc(100dvh - 7rem); }
      }
    `}</style>
    </>
  );
}
