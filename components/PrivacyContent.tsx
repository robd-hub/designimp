const SECTIONS = [
  {
    title: "1. Introduction",
    content: `Design Imp ("we," "our," or "us") respects your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website designimp.com or engage our services.`,
  },
  {
    title: "2. Information We Collect",
    content: `Personal Information: When you book a call, fill out a form, or contact us, we may collect your name, email address, phone number, company name, and job title.\n\nUsage Data: We automatically collect information about your device, browser, IP address, pages visited, and referring URLs through cookies and similar technologies.\n\nCommunications: If you email us or use our chat, we retain the content of those communications.`,
  },
  {
    title: "3. How We Use Your Information",
    content: `We use collected information to: provide and improve our services; respond to inquiries and schedule calls; send relevant updates (with your consent); analyze website usage and optimize performance; comply with legal obligations.`,
  },
  {
    title: "4. Sharing of Information",
    content: `We do not sell your personal information. We may share data with: service providers who assist our operations (hosting, analytics, scheduling); professional advisors (legal, accounting); as required by law or to protect our rights.`,
  },
  {
    title: "5. Cookies",
    content: `We use essential cookies for site functionality and analytics cookies to understand usage patterns. You can control cookie preferences through your browser settings.`,
  },
  {
    title: "6. Data Security",
    content: `We implement appropriate technical and organizational measures to protect your information. However, no electronic transmission or storage is 100% secure.`,
  },
  {
    title: "7. Data Retention",
    content: `We retain personal information only as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law.`,
  },
  {
    title: "8. Your Rights",
    content: `Depending on your jurisdiction, you may have the right to: access, correct, or delete your personal information; opt out of marketing communications; request data portability. To exercise these rights, contact us at rob@designimp.com.`,
  },
  {
    title: "9. Changes to This Policy",
    content: `We may update this policy from time to time. Changes will be posted on this page with an updated revision date.`,
  },
  {
    title: "10. Contact",
    content: `If you have questions about this Privacy Policy, contact us at:\nrob@designimp.com`,
  },
];

export default function PrivacyContent() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <div className="space-y-12">
        {SECTIONS.map((s) => (
          <div key={s.title}>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">{s.title}</h2>
            <div className="space-y-4">
              {s.content.split("\n\n").map((para, i) => (
                <p key={i} className="text-base text-muted leading-loose">
                  {para}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
