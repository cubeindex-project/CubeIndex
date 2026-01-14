<script>
  import LegalLayout from "$lib/components/legal/legalLayout.svelte";
  import { m } from "$lib/paraglide/messages";

  const lastUpdated = m.tos_last_updated_text();
  const historyURL =
    "https://github.com/cubeindex-project/CubeIndex/blob/main/src/routes/(public)/tos/%2Bpage.svelte";

  // Array of TOS sections
  const sections = [
    {
      title: m.tos_section_acceptance_title(),
      content: m.tos_section_acceptance_content_html(),
    },
    {
      title: m.tos_section_description_title(),
      content: m.tos_section_description_content_html(),
    },
    {
      title: m.tos_section_eligibility_title(),
      content: m.tos_section_eligibility_content_html(),
    },
    {
      title: m.tos_section_accounts_title(),
      content: m.tos_section_accounts_content_html(),
    },
    {
      title: m.tos_section_content_license_title(),
      content: m.tos_section_content_license_content_html(),
    },
    {
      title: m.tos_section_moderation_title(),
      content: m.tos_section_moderation_content_html(),
    },
    {
      title: m.tos_section_guidelines_title(),
      content: m.tos_section_guidelines_content_html(),
    },
    {
      title: m.tos_section_security_abuse_title(),
      content: m.tos_section_security_abuse_content_html(),
    },
    {
      title: m.tos_section_open_source_title(),
      content: m.tos_section_open_source_content_html(),
    },
    {
      title: m.tos_section_third_party_title(),
      content: m.tos_section_third_party_content_html(),
    },
    {
      title: m.tos_section_api_title(),
      content: m.tos_section_api_content_html(),
    },
    {
      title: m.tos_section_quality_title(),
      content: m.tos_section_quality_content_html(),
    },
    {
      title: m.tos_section_liability_title(),
      content: m.tos_section_liability_content_html(),
    },
    {
      title: m.tos_section_indemnification_title(),
      content: m.tos_section_indemnification_content_html(),
    },
    {
      title: m.tos_section_termination_title(),
      content: m.tos_section_termination_content_html(),
    },
    {
      title: m.tos_section_changes_title(),
      content: m.tos_section_changes_content_html(),
    },
    {
      title: m.tos_section_governing_title(),
      content: m.tos_section_governing_content_html(),
    },
    {
      title: m.tos_section_privacy_title(),
      content: m.tos_section_privacy_content_html(),
    },
    {
      title: m.tos_section_contact_title(),
      content: m.tos_section_contact_content_html(),
    },
  ];
</script>

<LegalLayout title={m.tos_title()} {lastUpdated} {sections} {historyURL} />
