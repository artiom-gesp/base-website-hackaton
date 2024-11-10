import { defineNuxtPlugin, useBoosterHydrate } from '#imports';
import vFont from '#booster/directives/vFont';
import { isSupportedBrowser } from '#booster/utils/browser';
import FontList from '#booster/classes/FontList';
import { useNuxtApp, useBoosterHead, useRequestHeaders, useRequestURL, useRequestFetch } from '#imports';
import './fonts.css';
import NodeCache from 'node-cache';


export default defineNuxtPlugin({
  name: 'booster-plugin',
  enforce: 'post',
  async setup(nuxtApp) {

    const hydrate = useBoosterHydrate();

    const fontConfig = await import('./fontConfig').then(
      module => module.default || module
    );
    const fontList = new FontList(fontConfig);

    const head = useBoosterHead();

    nuxtApp.provide('booster', {
      head,
      getImageSize,
      hydrate,
      getFont: fontList.getFont.bind(fontList),
      crossorigin: 'anonymous',
      isBrowserSupported: () => isSupportedBrowser({"regex":new RegExp(/Edge?\/(12[89]|1[3-9]\d|[2-9]\d{2}|\d{4,})\.\d+(\.\d+|)|Firefox\/(1{2}[5-9]|1[2-9]\d|[2-9]\d{2}|\d{4,})\.\d+(\.\d+|)|Chrom(ium|e)\/(109|1[1-9]\d|[2-9]\d{2}|\d{4,})\.\d+(\.\d+|)|(Maci|X1{2}).+ Version\/(17\.([6-9]|\d{2,})|(1[89]|[2-9]\d|\d{3,})\.\d+)([,.]\d+|)( \(\w+\)|)( Mobile\/\w+|) Safari\/|Chrome.+OPR\/(1{2}[3-9]|1[2-9]\d|[2-9]\d{2}|\d{4,})\.\d+\.\d+|(CPU[ +]OS|iPhone[ +]OS|CPU[ +]iPhone|CPU IPhone OS|CPU iPad OS)[ +]+(15[._]([6-9]|\d{2,})|(1[6-9]|[2-9]\d|\d{3,})[._]\d+)([._]\d+|)|Opera Mini|Android:?[ /-](13\d|1[4-9]\d|[2-9]\d{2}|\d{4,})(\.\d+|)(\.\d+|)|Mobile Safari.+OPR\/([89]\d|\d{3,})\.\d+\.\d+|Android.+Firefox\/(13\d|1[4-9]\d|[2-9]\d{2}|\d{4,})\.\d+(\.\d+|)|Android.+Chrom(ium|e)\/(13\d|1[4-9]\d|[2-9]\d{2}|\d{4,})\.\d+(\.\d+|)|Android.+(UC? ?Browser|UCWEB|U3)[ /]?(15\.([5-9]|\d{2,})|(1[6-9]|[2-9]\d|\d{3,})\.\d+)\.\d+|SamsungBrowser\/(2[5-9]|[3-9]\d|\d{3,})\.\d+|Android.+MQ{2}Browser\/(14(\.(9|\d{2,})|)|(1[5-9]|[2-9]\d|\d{3,})(\.\d+|))(\.\d+|)|K[Aa][Ii]OS\/(2\.([5-9]|\d{2,})|([3-9]|\d{2,})\.\d+)(\.\d+|)/)}),
      targetFormats: ["webp","avif","jpg|jpeg|png|gif"],
      densities: "x1 x2"
    });

  },
  hooks: {
    'app:created'() {
      const { vueApp } = useNuxtApp();
      vueApp.use(vFont);
    }
  }
});


const dimensionCache = new NodeCache({  useClones: false, ...{"stdTTL":3600,"checkperiod":1800} });
async function getImageSize (src) {

  const isNitroPrerender = 'x-nitro-prerender' in useRequestHeaders()

  try {
    let url = src;
    if (isNitroPrerender) {
      url = url.replace(useRequestURL().origin, '');
    }

    if (!dimensionCache.has(url)) {
      const blob = await useRequestFetch()(url);
      const { imageMeta } = await import('image-meta').then(
        module => module.default || module
      );

      const objectUrl = URL.createObjectURL(blob);
      const dimension = await fetch(objectUrl)
      .then(res => res.arrayBuffer())
      .then(Buffer.from)
      .then(imageMeta);

      URL.revokeObjectURL(objectUrl);

      dimensionCache.set(url, dimension);
    }

    return dimensionCache.get(url);
  } catch (error) {
    console.error('getImageSize: ' + src, error);
    return { width: 0, height: 0 };
  }

}
