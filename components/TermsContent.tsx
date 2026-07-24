const SECTIONS = [
  {
    title: "1. Agreement to Terms",
    content: `By accessing or using the services provided by Design Imp ("Company," "we," "us"), you agree to be bound by these Terms of Service. If you do not agree, do not use our services.`,
  },
  {
    title: "2. Services",
    content: `Design Imp provides website design, build, and related digital services for small and medium businesses. The scope of work for each engagement is defined in a separate Statement of Work or service agreement.`,
  },
  {
    title: "3. Client Obligations",
    content: `You agree to: provide accurate and complete information; grant reasonable access to systems and data necessary for service delivery; make timely payments as outlined in your service agreement; designate a point of contact for communications.`,
  },
  {
    title: "4. Intellectual Property",
    content: `Unless otherwise stated in a service agreement: custom work product created specifically for you is assigned to you upon full payment; pre-existing tools, frameworks, and methodologies remain the property of Design Imp; we retain the right to use general knowledge and techniques gained during engagements.`,
  },
  {
    title: "5. Payment Terms",
    content: `Payment terms are specified in individual service agreements. Late payments may incur interest at 1.5% per month. We reserve the right to suspend services for overdue accounts.`,
  },
  {
    title: "6. Confidentiality",
    content: `Both parties agree to keep confidential any proprietary or sensitive information shared during the engagement. This obligation survives termination of the agreement.`,
  },
  {
    title: "7. Limitation of Liability",
    content: `To the maximum extent permitted by law, Design Imp' total liability for any claim arising from our services shall not exceed the fees paid by you in the twelve months preceding the claim. We are not liable for indirect, incidental, or consequential damages.`,
  },
  {
    title: "8. Termination",
    content: `Either party may terminate a service engagement with 30 days written notice. Upon termination, you are responsible for payment for all services rendered up to the termination date.`,
  },
  {
    title: "9. Governing Law",
    content: `These Terms are governed by the laws of England and Wales. Any disputes shall be resolved in the courts of England and Wales.`,
  },
  {
    title: "10. Changes to Terms",
    content: `We may update these Terms from time to time. Continued use of our services after changes constitutes acceptance of the revised Terms.`,
  },
  {
    title: "11. Contact",
    content: `Questions about these Terms? Contact us at:\nDesign Imp\nrob@designimp.com`,
  },
];

export default function TermsContent() {
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
