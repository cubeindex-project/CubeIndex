<script lang="ts">
    import { supabase } from "$lib/supabaseClient.js";
    import { configCatClient } from "$lib/configcatClient";
    import FeatureDisabled from "$lib/components/featureDisabled.svelte";
    import { onMount } from "svelte";
    import { enhance } from "$app/forms";

    let { form } = $props();
    let username: string = $state("");
    let email: string = $state("");
    let password: string = $state("");
    let confirmPassword: string = $state("");
    let error: string = $state("");
    let showPassword: boolean = $state(false);
    let signup: boolean = $state(true);
    let acceptedTOS = $state(false);

    function signUpVerification() {
        if (username.length <= 2 || username.length >= 12) {
            error = "Username must be between 2 and 12 characters";
            return;
        }
        if (password !== confirmPassword) {
            error = "Passwords do not match";
            return;
        }
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            error = "Please enter a valid email address";
            return;
        }
    }

    async function signUpDiscord() {
        await supabase.auth.signInWithOAuth({ provider: 'discord' });
    }

    function togglePasswordVisibility() {
        showPassword = !showPassword;
    }

    onMount(() =>
        configCatClient.getValueAsync("signup", false).then((value) => {
            signup = value;
        }),
    );
</script>

{#if signup}
    <section
        class="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 relative overflow-hidden"
    >
        <div
            class="w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-2xl shadow-lg p-8 z-10"
        >
            <h1
                class="text-3xl font-clash font-bold text-center mb-6 text-white"
            >
                Join CubeIndex
            </h1>
            <p class="text-center text-gray-400 text-sm mb-8">
                Create a free account to start tracking your collection
            </p>
            <form
                method="POST"
                action="?/signup"
                use:enhance={signUpVerification}
                class="space-y-6"
            >
                <!-- Username -->
                <div>
                    <label
                        for="username"
                        class="block text-sm font-medium text-white"
                        >Username</label
                    >
                    <input
                        name="username"
                        type="text"
                        bind:value={username}
                        class="w-full mt-1 px-4 py-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        required
                    />
                </div>

                <!-- Email -->
                <div>
                    <label
                        for="email"
                        class="block text-sm font-medium text-white"
                        >Email</label
                    >
                    <input
                        name="email"
                        type="email"
                        bind:value={email}
                        class="w-full mt-1 px-4 py-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        required
                    />
                </div>

                <!-- Password -->
                <div>
                    <label
                        for="password"
                        class="block text-sm font-medium text-white"
                        >Password</label
                    >
                    <div class="flex flex-row items-center">
                        <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            bind:value={password}
                            class="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                            required
                        />
                        <button
                            type="button"
                            class="fa-solid {showPassword
                                ? 'fa-eye-slash'
                                : 'fa-eye'} ml-4 cursor-pointer text-white"
                            onclick={togglePasswordVisibility}
                            aria-label="Toggle Password Visibility"
                        ></button>
                    </div>
                </div>

                <!-- Confirm Password -->
                <div>
                    <label
                        for="confirmPassword"
                        class="block text-sm font-medium text-white"
                        >Confirm Password</label
                    >
                    <input
                        id="confirmPassword"
                        type="password"
                        name="confirmPassword"
                        bind:value={confirmPassword}
                        class="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        required
                    />
                </div>

                <!-- Accept ToS and Privacy Policy -->
                <div class="flex items-center gap-2">
                    <input
                        id="acceptTOS"
                        type="checkbox"
                        name="acceptTOS"
                        bind:checked={acceptedTOS}
                        class="accent-blue-600 w-5 h-5 rounded border border-neutral-600 bg-neutral-800 cursor-pointer"
                        required
                    />
                    <label
                        for="acceptTOS"
                        class="text-sm text-gray-400 select-none"
                    >
                        I accept the
                        <a
                            href="/tos"
                            target="_blank"
                            class="text-blue-400 hover:underline"
                            >Terms of Service</a
                        >
                        and
                        <a
                            href="/privacy"
                            target="_blank"
                            class="text-blue-400 hover:underline"
                            >Privacy Policy</a
                        >
                    </label>
                </div>

                <!-- Main Sign Up Button -->
                <button
                    type="submit"
                    class="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition rounded-lg px-6 py-3 font-semibold text-white text-lg"
                >
                    Sign Up
                </button>

                <!-- OR Divider -->
                <div class="flex items-center gap-4 my-2">
                    <div class="flex-1 h-px bg-neutral-700"></div>
                    <span class="text-gray-400 text-xs">or</span>
                    <div class="flex-1 h-px bg-neutral-700"></div>
                </div>

                <!-- Sign Up with Discord Button -->
                <button
                    type="button"
                    onclick={signUpDiscord}
                    class="w-full flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4752C4] transition px-6 py-3 mt-6 rounded-lg font-semibold text-white text-lg shadow-lg cursor-pointer"
                >
                    <i class="fa-brands fa-discord text-2xl"></i>
                    Sign Up with Discord
                </button>

                {#if form?.message}
                    <p class="text-sm text-red-500 text-center mt-2">
                        {form.message}
                    </p>
                {/if}
            </form>
            <p class="text-sm text-center text-gray-500 mt-6">
                Already have an account?
                <a href="/auth/login" class="text-blue-400 hover:underline ml-1"
                    >Log in</a
                >
            </p>
        </div>
    </section>
{:else}
    <FeatureDisabled featureName="Signup is" />
{/if}
