import network from './network'

export default {
  // Build the app as a static site instead of Server Side Rendered (SSR)
  // (https://nuxtjs.org/docs/2.x/configuration-glossary/configuration-mode/)
  ssr: false,
  target: 'static',

  // Use local 404 instead of redirecting to Netlify 404 (https://go.nuxtjs.dev/config-build)
  generate: {
    fallback: true,
  },

  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    title: 'LikeCoin - Lunie 3',
    htmlAttrs: {
      lang: 'en',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content:
          'Lunie 3 is a simple staking and governance interface for proof-of-stake blockchains',
      },
    ],
    link: [
      {
        rel: 'preload',
        href: `https://fonts.googleapis.com/icon?family=Material+Icons`,
        as: 'style',
      },
      { rel: 'preload', href: `${network.apiURL}/blocks/1`, as: 'fetch' },
      { rel: 'preconnect', href: 'https://keybase.io' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/icon?family=Material+Icons',
      },
      { rel: 'icon', type: 'image/png', href: '/favicon.png' },
    ],
  },

  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: ['@/styles/app.css'],

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: [
    '@/plugins/copy.client.js',
    '@/plugins/focus.client.js',
    '@/plugins/infinite-scroll.client.js',
    '@/plugins/init.client.js',
    '@/plugins/validate.client.js',
    '@/plugins/scroll-to.client.js',
  ],

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: true,

  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/stylelint
    '@nuxtjs/stylelint-module',
  ],

  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://github.com/microcipcip/cookie-universal/tree/master/packages/cookie-universal-nuxt#readme
    'cookie-universal-nuxt',
  ],

  // Axios module configuration (https://go.nuxtjs.dev/config-axios)
  axios: {
    progress: false,
    retry: { retries: 3 },
  },

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {},
}
