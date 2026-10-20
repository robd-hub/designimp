"use client";

import { usePathname } from "next/navigation";
import N8nChat from "@/components/N8nChat";

const CHAT_URL =
  "https://robdoughty.app.n8n.cloud/webhook/2845a9e4-4cb3-40b5-824c-67ce29b17be8/chat";
const INITIAL_MESSAGES = [
  "Hi! 👋 I'm the Design Imp assistant.",
  "Ask me about websites, AI assistants, automated lead generation, or getting a free mockup.",
];
// /demo loads its own copy of the assistant, and the chat bubble would sit on top of /play's controls
const HIDDEN_ON = ["/demo", "/play"];

// The Design Imp assistant, shown on every other page
export default function SiteChat() {
  const pathname = usePathname();
  if (HIDDEN_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;

  return (
    <N8nChat
      id="site-chat"
      webhookUrl={CHAT_URL}
      title="Design Imp"
      subtitle="Questions about your new website? Ask away"
      initialMessages={INITIAL_MESSAGES}
    />
  );
}
