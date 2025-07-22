<script lang="ts">
  import type { ToastType } from '$lib/types';

  export let message: string;
  export let type: ToastType = 'info';

  const typeStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-black',
    info: 'bg-blue-500 text-white'
  };

  const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ'
  };
</script>

<div
  class="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg {typeStyles[type]} animate-slide-up max-w-sm"
  role="alert"
  aria-live="polite"
>
  <div class="flex items-center space-x-2">
    <span class="font-bold text-lg" aria-hidden="true">
      {icons[type]}
    </span>
    <p class="font-medium">{message}</p>
  </div>
</div>