/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import vuetify from './vuetify'
import pinia from '../stores'
import router from '../router'
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import "/node_modules/primeflex/primeflex.css";
// main.js or main.ts
import 'video.js/dist/video-js.css';

// Types
import type { App } from 'vue'

export function registerPlugins (app: App) {
  app
    .use(vuetify)
    .use(router)
    .use(pinia)
    .use(PrimeVue, {
        theme: {
            preset: Aura
        }
    })
}
