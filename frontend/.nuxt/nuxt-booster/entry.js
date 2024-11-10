import { run, hasSufficientPerformance, setup } from '#booster/utils/performance';
import { triggerRunCallback, observeBoosterButton, setupBoosterLayer, updateBoosterLayerMessage, initReducedView, hasBatteryPerformanceIssue, deprecationWarningButtonSelector } from '#booster/utils/entry';
import Deferred from '#booster/classes/Deferred';
import { isSupportedBrowser } from '#booster/utils/browser';
import {video as videoBlob} from './blobs.mjs';


  // vite
export default entryWrapper();

function entryWrapper(){

  if (!process.server) {
    return client().then(() => getEntry());
  } else {
    return async (ctx) => (await getEntry())(ctx)
  }

};

function getEntry(){
  return import('/Users/artiomgesp/Documents/hackation/website/frontend/node_modules/nuxt/dist/app/entry').then(module => module.default);
}

function client () {
  const deferred = new Deferred();

  let initialized = false
  const layerEl = window.document.getElementById('nuxt-booster-layer');

  const forceInit = ('__NUXT_BOOSTER_FORCE_INIT__' in window && window.__NUXT_BOOSTER_FORCE_INIT__);

  async function initApp(force) {

    if (initialized) {
      deferred.resolve();
    }

    document.documentElement.classList.remove('nuxt-booster-reduced-view');

    
    try {
      if (!force) {
        await hasBatteryPerformanceIssue(videoBlob)
      }
    } catch (error) {

      console.warn(error)

      triggerRunCallback(false);

      if (!!layerEl) {
        // User must interact via the layer.
        updateBoosterLayerMessage(layerEl, 'nuxt-booster-message-low-battery');
        return null;
      }
    }
    
    try {
if (!force) {
        await run();
      }


      initialized = true;

      triggerRunCallback(true);

      deferred.resolve();

    } catch (error) {

      console.warn(error)

      triggerRunCallback(false);

      if (!!layerEl) {
        // User must interact via the layer.
        updateBoosterLayerMessage(layerEl, 'nuxt-booster-message-weak-hardware');
        return null;
      }
    }

    return null;
  };

  const supportedBrowser = isSupportedBrowser({"regex":new RegExp(/Edge?\/(12[89]|1[3-9]\d|[2-9]\d{2}|\d{4,})\.\d+(\.\d+|)|Firefox\/(1{2}[5-9]|1[2-9]\d|[2-9]\d{2}|\d{4,})\.\d+(\.\d+|)|Chrom(ium|e)\/(109|1[1-9]\d|[2-9]\d{2}|\d{4,})\.\d+(\.\d+|)|(Maci|X1{2}).+ Version\/(17\.([6-9]|\d{2,})|(1[89]|[2-9]\d|\d{3,})\.\d+)([,.]\d+|)( \(\w+\)|)( Mobile\/\w+|) Safari\/|Chrome.+OPR\/(1{2}[3-9]|1[2-9]\d|[2-9]\d{2}|\d{4,})\.\d+\.\d+|(CPU[ +]OS|iPhone[ +]OS|CPU[ +]iPhone|CPU IPhone OS|CPU iPad OS)[ +]+(15[._]([6-9]|\d{2,})|(1[6-9]|[2-9]\d|\d{3,})[._]\d+)([._]\d+|)|Opera Mini|Android:?[ /-](13\d|1[4-9]\d|[2-9]\d{2}|\d{4,})(\.\d+|)(\.\d+|)|Mobile Safari.+OPR\/([89]\d|\d{3,})\.\d+\.\d+|Android.+Firefox\/(13\d|1[4-9]\d|[2-9]\d{2}|\d{4,})\.\d+(\.\d+|)|Android.+Chrom(ium|e)\/(13\d|1[4-9]\d|[2-9]\d{2}|\d{4,})\.\d+(\.\d+|)|Android.+(UC? ?Browser|UCWEB|U3)[ /]?(15\.([5-9]|\d{2,})|(1[6-9]|[2-9]\d|\d{3,})\.\d+)\.\d+|SamsungBrowser\/(2[5-9]|[3-9]\d|\d{3,})\.\d+|Android.+MQ{2}Browser\/(14(\.(9|\d{2,})|)|(1[5-9]|[2-9]\d|\d{3,})(\.\d+|))(\.\d+|)|K[Aa][Ii]OS\/(2\.([5-9]|\d{2,})|([3-9]|\d{2,})\.\d+)(\.\d+|)/)});

  window.addEventListener('load', function () {
    if (!document.getElementById('nuxt-booster-layer')) {
      initApp(forceInit);
    } else {

      observeBoosterButton('.nuxt-booster-button-init-reduced-view', initReducedView);
      observeBoosterButton('.nuxt-booster-button-init-app', () => initApp(true));

      /* id selector will removed in future */
      deprecationWarningButtonSelector(initApp);

      setup({"timing":{"fcp":800,"dcl":1200}});

      if(('__NUXT_BOOSTER_AUTO_INIT__' in window && window.__NUXT_BOOSTER_AUTO_INIT__) || ((true && hasSufficientPerformance()) && supportedBrowser)) {
        initApp();
      } else {
        setupBoosterLayer(layerEl, supportedBrowser)
      }

    }
  });

return deferred.promise;

}
