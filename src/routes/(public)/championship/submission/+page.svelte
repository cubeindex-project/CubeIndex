<script lang="ts">
  import { getContext, onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import { error } from "@sveltejs/kit";
  import { m } from "$lib/paraglide/messages";

  let username: string = $state("");

  const getUser = getContext<() => { id: any }>("user");
  let user = getUser();

  onMount(async () => {
    const { data: profiles, error: profileErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user?.id);

    if (profileErr) throw error(500, profileErr.message);
    if (profiles && profiles.length > 0) {
      username = profiles[0].username;
    }
    return { username };
  });
</script>

<section
  class="px-5 relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
>
  <form
    method="POST"
    enctype="multipart/form-data"
    class="flex justify-center flex-col items-center gap-4"
  >
    <h1 class="font-clash text-5xl">{m.send_submission_heading()}</h1>
    <input
      type="text"
      class="input"
      name="username"
      bind:value={username}
      hidden
    />
    <input
      type="file"
      class="file-input"
      name="submission"
      accept="video/*"
      required
    />
    <button class="btn" type="submit" disabled={!username}>{m.submit()}</button>
    {#if !username}
      <p class="text-error">{m.must_be_logged_in()}</p>
    {/if}
  </form>
</section>
