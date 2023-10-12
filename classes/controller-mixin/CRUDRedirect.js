const { ControllerMixin } = require('@kohanajs/core-mvc');

class ControllerMixinCRUDRedirect extends ControllerMixin {
  static PATH_PREFIX = 'crudPathPrefix';

  static INSTANCE = 'instance';

  static REDIRECT = 'CRUDRedirectURL';

  static init(state) {
    state.set(this.PATH_PREFIX, state.get(this.PATH_PREFIX) ?? 'admin/');
  }

  static async action_update(state) {
    const client = state.get(ControllerMixin.CLIENT);
    const { params } = client.request;
    const id = params.id || state.get(this.INSTANCE)?.id || '';
    const pathPrefix = state.get(this.PATH_PREFIX);
    const { tableName } = client.model;

    const postData = state.get('$_POST');
    state.set(this.REDIRECT, !postData?.destination ? `/${pathPrefix}${tableName}/${id}` : postData.destination);
  }

  static async action_delete(state) {
    const client = state.get(ControllerMixin.CLIENT);
    const { model } = client;
    const { query } = client.request;

    if (!query.confirm) return;
    const checkpoint = query.cp;

    const pathPrefix = state.get(this.PATH_PREFIX);
    const { tableName } = model;
    const defaultRedirect = checkpoint || `/${pathPrefix}${tableName}`;

    const postData = state.get('$_POST');
    state.set(this.REDIRECT, !postData?.destination ? defaultRedirect : postData.destination);
  }

  static async after(state) {
    if (!state.get(this.REDIRECT)) return;
    await state.get(ControllerMixin.CLIENT).redirect(state.get(this.REDIRECT));
  }
}

module.exports = ControllerMixinCRUDRedirect;
