import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	// Shared-library playground runs OFF the app dev grid (apps use 5173 + n*100)
	// on the registered library port 5901 — see walaware/.github docs/conventions.md
	// ("Local development"). 5901 not 5900: 5900 is macOS Screen Sharing/VNC.
	// strictPort so a collision fails loudly instead of drifting.
	server: { port: 5901, strictPort: true },
	preview: { port: 5901, strictPort: true }
});
