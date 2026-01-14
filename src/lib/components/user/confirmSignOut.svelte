<script lang="ts">
  import { m } from "$lib/paraglide/messages";

  let { onCancel } = $props();
</script>

<div
  class="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50"
>
  <div
    class="bg-base-300 rounded-3xl shadow-2xl p-8 w-full max-w-md text-center space-y-8"
  >
    <h2 class="text-2xl font-clash font-bold mb-2">
      {m.user_signout_confirm_title_h2()}
    </h2>
    <p class="text-lg">{m.user_signout_confirm_description_text()}</p>
    <div class="flex justify-center gap-6 mt-6">
      <a type="button" href="/auth/logout" class="btn btn-primary btn-lg">
        {m.user_signout_confirm_signout_cta()}
      </a>
      <button type="button" onclick={onCancel} class="btn btn-secondary btn-lg">
        {m.user_signout_confirm_cancel_cta()}
      {m.auth_signout_title_h2()}
    </h2>
    <p class="text-lg">{m.auth_signout_prompt_text()}</p>
    <div class="flex justify-center gap-6 mt-6">
      <a type="button" href="/auth/logout" class="btn btn-primary btn-lg">
        {m.auth_signout_confirm_cta()}
      </a>
      <button type="button" onclick={onCancel} class="btn btn-secondary btn-lg">
        {m.auth_signout_cancel_cta()}
      </button>
    </div>
  </div>
</div>
