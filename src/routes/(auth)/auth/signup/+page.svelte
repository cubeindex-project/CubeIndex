<script lang="ts">
    import { supabase } from "$lib/supabaseClient";

    let username: string;
    let email: string;
    let password: string;
    let confirmPassword: string;
    let error: string;
    let message: string;
    let showPassword: boolean;

    async function handleAuth(e: Event) {
        e.preventDefault();
        error = "";
        message = "";

        if (password === confirmPassword) {
            // Sign up the user
            const { data: signUpData, error: signUpError } =
                await supabase.auth.signUp({
                    email,
                    password
                });

            if (signUpError) {
                error = signUpError.message;
            } else {
                // Retrieve the user ID from the signUpData
                const userId = signUpData.user?.id;

                if (userId) {
                    // Upsert into the profiles table with the user ID
                    const { error: upsertError } = await supabase
                        .from("profiles")
                        .upsert({ user_id: userId, username: username });

                    if (upsertError) {
                        error = upsertError.message;
                    } else {
                        message = "Check your email to verify your account.";
                    }
                } else {
                    error = "User ID not found after sign-up.";
                }
            }
        } else {
            error = "Passwords do not match.";
        }
    }

    function togglePasswordVisibility() {
        showPassword = !showPassword;
    }
</script>

<section
  class="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 relative overflow-hidden"
>
  <div class="absolute inset-0 opacity-10">
    <img
      src="/images/hero-bg.png"
      alt=""
      class="w-full h-full object-cover"
    />
  </div>

  <div
    class="w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-2xl shadow-lg p-8 z-10"
  >
    <h1 class="text-3xl font-clash font-bold text-center mb-4">
      Sign-Up Temporarily Disabled
    </h1>
    <p class="text-center text-gray-400 mb-6">
      Our team is working hard to squash a pesky bug.  
      Please bear with us and check back shortly!
    </p>

    <a
      href="/"
      class="block w-full text-center bg-blue-600 hover:bg-blue-700 transition rounded-lg px-6 py-3 font-semibold text-white text-lg"
    >
      Return Home
    </a>
  </div>
</section>
