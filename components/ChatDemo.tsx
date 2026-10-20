"use client";

import N8nChat from "@/components/N8nChat";

// The Design Imp assistant on the demo page
export default function ChatDemo() {
  return (
    <N8nChat
      id="demo-chat"
      webhookUrl="https://robdoughty.app.n8n.cloud/webhook/2845a9e4-4cb3-40b5-824c-67ce29b17be8/chat"
      title="Design Imp"
      subtitle="Ask a question, any time"
      initialMessages={[
        "Hi! 👋 I'm the Design Imp assistant.",
        "Ask me anything about websites, AI assistants, automated lead generation, or getting a free mockup.",
      ]}
    />
  );
}
