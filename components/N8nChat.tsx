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
    </>
  );
}
