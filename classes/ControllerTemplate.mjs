import { Controller } from '@lionrockjs/mvc'
import { ControllerMixinMime, ControllerMixinView  } from '@lionrockjs/central';

export default class ControllerTemplate extends Controller {
  static mixins = [...Controller.mixins, ControllerMixinMime, ControllerMixinView];
  constructor(request, controllerName = '') {
    super(request);
    this.languageNames = new Map([['en', 'English'], ['zh-hans', '简体中文']]);
    this.language = this.language || 'en';
    this.clientName = controllerName;

    this.state.set(ControllerMixinView.LAYOUT_FILE, 'layout/default');

    const { hostname } = this.request.raw;
    const domain = hostname.split(':')[0];
    // push language, controller, action to layout
    Object.assign(this.state.get(ControllerMixinView.LAYOUT).data, {
      domain,
      controller: this.clientName,
      action: this.request.params.action,
      language: this.language,
      language_name: this.languageNames.get(this.language),
      cookieConsent: this.request.cookies['allow-cookie'],
    });
  }
}


