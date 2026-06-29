<script>
  import { resolve } from "$app/paths";
</script>

<div class="w-full flex justify-center gap-2">
  <a
    href={resolve("/(auth)/auth/google")}
    class="btn btn-lg sm:btn-xl bg-white text-black"
    aria-label="Google"
  >
    <i class="fa-brands fa-google text-2xl"></i>
  </a>
  <a
    href={resolve("/(auth)/auth/wca")}
    class="btn btn-lg sm:btn-xl bg-red-700 text-white"
    aria-label="WCA"
  >
    <img src="/icons/WCA Logo.svg" alt="WCA Logo" class="size-8" />
  </a>
  <a
    href={resolve("/(auth)/auth/discord")}
    class="btn btn-lg sm:btn-xl bg-[#5865F2] text-white"
    aria-label="Discord"
  >
    <i class="fa-brands fa-discord text-2xl"></i>
  </a>
</div>
