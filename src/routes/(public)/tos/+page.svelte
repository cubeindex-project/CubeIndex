<script>
  import LegalLayout from "$lib/components/legal/legalLayout.svelte";

  const lastUpdated = "September 14, 2025";
  const historyURL =
    "https://github.com/cubeindex-project/CubeIndex/blob/main/src/routes/(public)/tos/%2Bpage.svelte";

  // Array of TOS sections
  const sections = [
    {
      title: "Acceptance of Terms",
      content: `
        By accessing or using CubeIndex (“the Service”), you agree to be bound by these
        Terms of Service (“Terms”). If you do not agree, do not use the Service.
      `,
    },
    {
      title: "Description of Service",
      content: `
        CubeIndex provides a database for speedcubing products and tools for managing cube
        collections, viewing product information, and participating in community features
        such as profiles and achievements. The Service is offered for
        <strong>personal, non-commercial use</strong> unless we give you prior written permission.
      `,
    },
    {
      title: "Eligibility & Age",
      content: `
        You must be at least <strong>13 years old</strong> to use CubeIndex. We do not knowingly
        collect personal data from children under 13. If you believe a child under 13 has provided
        personal data, please contact us at
        <a href="mailto:thecubeindex@gmail.com">thecubeindex@gmail.com</a>.
      `,
    },
    {
      title: "Accounts & Responsibility",
      content: `
        <ul>
          <li>You are responsible for all activity under your account.</li>
          <li>You must keep your login credentials secure.</li>
          <li>You agree to provide and maintain an <strong>accurate and valid email address</strong>.</li>
          <li>
            Account deletion <strong>from within the app is not yet available</strong>. You may request deletion by emailing
            <a href="mailto:thecubeindex@gmail.com">thecubeindex@gmail.com</a>.
          </li>
          <li>
            There is currently <strong>no policy on inactive accounts</strong>. If this changes, we will update these Terms and notify you.
          </li>
        </ul>
      `,
    },
    {
      title: "User Content & License to CubeIndex",
      content: `
        You retain ownership of the content you submit (e.g., reviews, images, comments).
        By submitting content, you grant CubeIndex a worldwide, non-exclusive, royalty-free
        license to use, host, reproduce, modify (for formatting/display), publicly display,
        and distribute your content within the Service and in materials that promote the
        Service. This license ends when your content is removed, except for necessary backups.
      `,
    },
    {
      title: "Content Moderation",
      content: `
        CubeIndex may, at its sole discretion, <strong>remove or restrict any user content without prior notice</strong>
        if we believe it violates these Terms or applicable law, or to protect users or the Service.
      `,
    },
    {
      title: "Community Guidelines",
      content: `
        <ul>
          <li>No harassment, hate speech, or threats.</li>
          <li>No spam, scams, deceptive practices, or mass unsolicited messaging.</li>
          <li>No illegal content, malware, or attempts to gain unauthorized access.</li>
          <li>No sexually explicit or pornographic content.</li>
          <li>Respect intellectual property; do not upload copyrighted materials without permission.</li>
        </ul>
      `,
    },
    {
      title: "Prohibited Security Abuse",
      content: `
        <ul>
          <li>Impersonating others or misrepresenting your identity or affiliation.</li>
          <li>Interfering with or overloading the Service (e.g., DDoS, abusive rate-limiting circumvention).</li>
          <li>Reverse engineering or probing to bypass security or access controls, except as permitted by law.</li>
        </ul>
      `,
    },
    {
      title: "Open-Source License & CubeIndex IP",
      content: `
        The CubeIndex software is open source and made available under the
        <strong>Apache License, Version 2.0</strong>. See
        <a href="https://www.apache.org/licenses/LICENSE-2.0" target="_blank" rel="noopener">apache.org/licenses/LICENSE-2.0</a>.
        <br /><br />
        <strong>Trademarks & hosted service:</strong> CubeIndex trademarks, logos, brand assets,
        and hosted service configuration are not granted under Apache 2.0.
      `,
    },
    {
      title: "Third-Party Links & Vendors",
      content: `
        The Service may display links to third-party vendors or websites (e.g., stores with cube pricing).
        <strong>Those services have their own terms and policies</strong>, and CubeIndex is not responsible for them.
      `,
    },
    {
      title: "API, Data Access, & Scraping",
      content: `
        <strong>Limited, low-volume scraping</strong> for personal, non-commercial use is allowed provided it:
        <ul>
          <li>is infrequent and does not degrade performance;</li>
          <li>obeys robots directives and rate limits;</li>
          <li>targets public pages only;</li>
          <li>does not attempt to bulk export;</li>
          <li>stops immediately if requested.</li>
        </ul>
      `,
    },
    {
      title: "Service Quality & Our Responsibilities",
      content: `
        We aim to operate CubeIndex with <strong>reasonable skill and care</strong>, but the Service may
        be interrupted, delayed, or experience errors (e.g., maintenance, updates, or network issues).
      `,
    },
    {
      title: "Liability",
      content: `
        CubeIndex <strong>accepts liability to the extent required by law</strong>, including for negligence or breach of obligations.
        However, CubeIndex will not be responsible for <em>indirect or consequential losses</em>
        where exclusion is permitted by law.
      `,
    },
    {
      title: "Indemnification",
      content: `
        You agree to indemnify and hold CubeIndex harmless from claims, damages, and expenses
        arising out of your violation of these Terms or infringement of third-party rights.
      `,
    },
    {
      title: "Termination & Enforcement",
      content: `
        We may suspend or terminate your access to CubeIndex at our discretion, without prior notice,
        if we believe you have violated these Terms or applicable law. Some provisions (e.g., IP, licenses, liability)
        survive termination.
      `,
    },
    {
      title: "Changes to Terms",
      content: `
        We may update these Terms from time to time. Changes will be posted on this page with the “Last updated” date.
        <strong>Material changes</strong> may be notified in the Service or by email. Continued use after changes
        means acceptance of the revised Terms.
      `,
    },
    {
      title: "Governing Law & Dispute Resolution",
      content: `
        These Terms are governed by the laws of the <strong>European Union</strong> and the Member State
        where CubeIndex is established. Disputes will first be resolved amicably within 30 days; otherwise,
        arbitration or local courts may apply depending on applicable law.
      `,
    },
    {
      title: "Privacy",
      content: `
        Your use of the Service is also subject to our
        <a href="/privacy">Privacy Policy</a>, which explains how we handle your data.
      `,
    },
    {
      title: "Contact",
      content: `
        Questions about these Terms? Contact us at
        <a href="mailto:thecubeindex@gmail.com">thecubeindex@gmail.com</a>.
      `,
    },
  ];
</script>

<LegalLayout title="Terms of Service" {lastUpdated} {sections} {historyURL} />
