<script>
  import LegalLayout from "$lib/components/legal/legalLayout.svelte";
  import { m } from "$lib/paraglide/messages";

  const lastUpdated = m.privacy_last_updated_text();
  const historyURL =
    "https://github.com/cubeindex-project/CubeIndex/blob/main/src/routes/(public)/privacy/%2Bpage.svelte";

  const sections = [
    {
      title: m.privacy_section_intro_title(),
      content: m.privacy_section_intro_content_html(),
    },
    {
      title: m.privacy_section_collect_title(),
      content: m.privacy_section_collect_content_html(),
    },
    {
      title: m.privacy_section_use_title(),
      content: m.privacy_section_use_content_html(),
    },
    {
      title: m.privacy_section_sharing_title(),
      content: m.privacy_section_sharing_content_html(),
    },
    {
      title: m.privacy_section_rights_title(),
      content: m.privacy_section_rights_content_html(),
    },
    {
      title: m.privacy_section_security_title(),
      content: m.privacy_section_security_content_html(),
    },
    {
      title: m.privacy_section_children_title(),
      content: m.privacy_section_children_content_html(),
    },
    {
      title: m.privacy_section_changes_title(),
      content: m.privacy_section_changes_content_html(),
    },
    {
      title: m.privacy_section_contact_title(),
      content: m.privacy_section_contact_content_html(),
    },
  ];
</script>

<LegalLayout title={m.privacy_title()} {lastUpdated} {sections} {historyURL} />
