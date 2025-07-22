<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let disabled = false;
  export let loading = false;

  const dispatch = createEventDispatcher();

  function handleClick() {
    if (!disabled && !loading) {
      dispatch('convert');
    }
  }
</script>

<button
  on:click={handleClick}
  {disabled}
  class="w-full py-4 px-6 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 focus-ring flex items-center justify-center space-x-2 text-lg shadow-lg hover:shadow-xl disabled:shadow-none"
  aria-describedby="convert-button-description"
>
  {#if loading}
    <!-- Loading Spinner -->
    <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <span>Converting...</span>
  {:else}
    <!-- Download Icon -->
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
    </svg>
    <span>Convert → DOCX</span>
  {/if}
</button>

<p id="convert-button-description" class="sr-only">
  Convert your markdown content to a Word document and download it
</p>

<style>
  button:disabled {
    transform: none;
  }
</style>