<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { filesStore, markdownStore } from '$lib/stores';
  import type { MarkdownFile } from '$lib/types';

  const dispatch = createEventDispatcher();

  let isDragOver = false;
  let dropZone: HTMLDivElement;

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    isDragOver = true;
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    if (!dropZone.contains(event.relatedTarget as Node)) {
      isDragOver = false;
    }
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDragOver = false;

    const files = event.dataTransfer?.files;
    if (!files) return;

    handleFiles(Array.from(files));
  }

  function handleFileInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (!files) return;

    handleFiles(Array.from(files));
  }

  async function handleFiles(fileList: File[]) {
    const markdownFiles: MarkdownFile[] = [];
    let combinedContent = '';

    for (const file of fileList) {
      if (file.type === 'text/markdown' || file.name.endsWith('.md')) {
        try {
          const content = await file.text();
          markdownFiles.push({
            name: file.name,
            size: file.size,
            content
          });
          combinedContent += content + '\n\n';
        } catch (error) {
          console.error(`Error reading file ${file.name}:`, error);
        }
      }
    }

    if (markdownFiles.length > 0) {
      filesStore.set(markdownFiles);
      markdownStore.set(combinedContent.trim());
    }
  }

  function openFileDialog() {
    const input = document.getElementById('file-input') as HTMLInputElement;
    input?.click();
  }
</script>

<div
  bind:this={dropZone}
  class="border-2 border-dashed theme-border rounded-lg p-8 text-center transition-all duration-200 hover:border-primary-400 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-opacity-20"
  class:drag-active={isDragOver}
  class:border-primary-500={isDragOver}
  class:bg-primary-50={isDragOver}
  class:dark:bg-primary-900={isDragOver}
  on:dragover={handleDragOver}
  on:dragleave={handleDragLeave}
  on:drop={handleDrop}
  role="button"
  tabindex="0"
  aria-label="Drop zone for markdown files"
  on:click={openFileDialog}
  on:keydown={(e) => e.key === 'Enter' && openFileDialog()}
>
  <div class="space-y-4">
    <!-- Upload Icon -->
    <div class="mx-auto w-12 h-12 theme-accent">
      <svg fill="currentColor" viewBox="0 0 24 24" class="w-full h-full">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
      </svg>
    </div>

    <!-- Text -->
    <div>
      <p class="text-lg font-medium theme-heading">
        {isDragOver ? 'Drop your files here' : 'Drag and drop Markdown files'}
      </p>
      <p class="text-sm theme-text mt-1">
        or <button class="theme-accent hover:underline font-medium focus-ring rounded">
          browse files
        </button>
      </p>
      <p class="text-xs theme-text mt-2 opacity-75">
        Supports .md files up to 10MB
      </p>
    </div>
  </div>

  <!-- Hidden File Input -->
  <input
    id="file-input"
    type="file"
    accept=".md,.markdown"
    multiple
    class="hidden"
    on:change={handleFileInput}
    aria-describedby="file-input-description"
  />
</div>

<p id="file-input-description" class="sr-only">
  Select markdown files to upload. Multiple files are supported.
</p>