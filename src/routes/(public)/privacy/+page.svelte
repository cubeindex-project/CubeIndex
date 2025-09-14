<script>
  import LegalLayout from "$lib/components/legal/legalLayout.svelte";

  const lastUpdated = "September 14, 2025";
  const historyURL =
    "https://github.com/cubeindex-project/CubeIndex/blob/main/src/routes/(public)/privacy/%2Bpage.svelte";

  const sections = [
    {
      title: "Introduction",
      content: `
    We at CubeIndex value your privacy. This Privacy Policy describes how we collect, use, and protect your information when you use the CubeIndex service ("the Service").
    `,
    },
    {
      title: "Information We Collect",
      content: `
            <ul>
              <li><strong>Account Information:</strong> Email address, username, profile picture.</li>
              <li><strong>Usage Data:</strong> Interactions with the site (pages viewed, cubes added, etc.).</li>
              <li><strong>Device Information:</strong> IP address, browser type, and operating system (used for analytics).</li>
            </ul>
        `,
    },
    {
      title: "How We Use Your Information",
      content: `
    <p>We use your data to:</p>
    <ul>
      <li>Operate and personalize your experience on CubeIndex</li>
      <li>Provide features like collections, profiles, and achievements</li>
      <li>Improve platform performance, usability, and content moderation</li>
      <li>Send occasional service-related emails (e.g., login links or updates)</li>
    </ul>
    `,
    },
    {
      title: "Sharing Your Data",
      content: `
    <p>We do not sell or share your personal information with third parties, except:</p>
    <ul>
      <li>To comply with legal obligations</li>
      <li>With third-party tools that power our service (e.g., Supabase, Netlify)</li>
      <li>When linking to or embedding third-party vendor content or services, which have their own policies</li>
    </ul>
    `,
    },
    {
      title: "Your Rights",
      content: `
    <p>You can:</p>
    <ul>
      <li>Access or update your profile at any time</li>
      <li>Request deletion of your account and data by emailing <a href="mailto:thecubeindex@gmail.com">thecubeindex@gmail.com</a></li>
      <li>Note: Deleted content may remain in system backups for a limited time</li>
      <li>Opt out of analytics tracking (coming soon)</li>
    </ul>
    `,
    },
    {
      title: "Data Security",
      content: `
            We use secure infrastructure (e.g., Supabase Auth, HTTPS) and follow
            best practices to protect your data.
        `,
    },
    {
      title: "Children's Privacy",
      content: `
    CubeIndex is not intended for children under 13. We do not knowingly collect personal data from children under 13. If you believe a child under 13 has provided personal data, please contact us at
    <a href="mailto:thecubeindex@gmail.com">thecubeindex@gmail.com</a>.
    `,
    },
    {
      title: "Changes to This Policy",
      content: `
            We may update this Privacy Policy from time to time. Changes will be
            posted here with the updated date.
        `,
    },
    {
      title: "Contact",
      content: `
            For questions or concerns, email us at
            <a href="mailto:thecubeindex@gmail.com">thecubeindex@gmail.com</a>.
        `,
    },
  ];
</script>

<LegalLayout title="Privacy Policy" {lastUpdated} {sections} {historyURL} />
