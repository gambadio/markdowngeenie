<script lang="ts">
  import { themeStore } from '$lib/stores';
  import type { Theme } from '$lib/types';

  const themes: { value: Theme; label: string; description: string }[] = [
    {
      value: 'minimal',
      label: 'Minimal',
      description: 'Clean and simple with ample whitespace'
    },
    {
      value: 'elegant',
      label: 'Elegant',
      description: 'Serif headings with refined typography'
    }
  ];

  function handleThemeChange(theme: Theme) {
    themeStore.set(theme);
  }
</script>

<fieldset class="space-y-3">
  <legend class="text-sm font-medium theme-heading mb-3">Document Theme</legend>
  
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {#each themes as theme}
      <label class="relative flex items-start p-4 border theme-border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-opacity-20">
        <input
          type="radio"
          name="theme"
          value={theme.value}
          checked={$themeStore === theme.value}
          on:change={() => handleThemeChange(theme.value)}
          class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 mt-1"
          aria-describedby="theme-{theme.value}-description"
        />
        <div class="ml-3 min-w-0 flex-1">
          <p class="text-sm font-medium theme-heading">
            {theme.label}
          </p>
          <p id="theme-{theme.value}-description" class="text-xs theme-text mt-1">
            {theme.description}
          </p>
        </div>
        
        <!-- Visual Preview -->
        <div class="ml-2 flex-shrink-0">
          {#if theme.value === 'minimal'}
            <div class="w-8 h-6 bg-white border border-gray-300 rounded flex flex-col justify-center px-1">
              <div class="h-1 bg-gray-800 rounded mb-1"></div>
              <div class="h-px bg-gray-400 rounded"></div>
            </div>
          {:else}
            <div class="w-8 h-6 bg-purple-50 border border-purple-300 rounded flex flex-col justify-center px-1">
              <div class="h-1 bg-purple-800 rounded mb-1"></div>
              <div class="h-px bg-purple-400 rounded"></div>
            </div>
          {/if}
        </div>
      </label>
    {/each}
  </div>
</fieldset>