import { Controller, ControllerMixin } from '@lionrockjs/central'

export default class ControllerMixinCRUDRedirect extends ControllerMixin {
  static PATH_PREFIX = 'crudPathPrefix';

  static INSTANCE = 'instance';

  static REDIRECT = 'CRUDRedirectURL';
  static REDIRECT_WITH_QUERY = 'CRUDRedirectWithQuery';
  static MODEL = 'orm_model'

  static init(state) {
    if(!state.get(this.PATH_PREFIX)) state.set(this.PATH_PREFIX, 'admin/');
    if(!state.get(this.REDIRECT_WITH_QUERY)) state.set(this.REDIRECT_WITH_QUERY, true);
  }

  static async action_update(state) {
    const { params }  = state.get(Controller.STATE_REQUEST);
    const checkpoint = state.get(Controller.STATE_CHECKPOINT);
    const id = params.id || state.get(this.INSTANCE)?.id || '';
    const pathPrefix = state.get(this.PATH_PREFIX);
    const model = state.get(this.MODEL);
    const { tableName } = model;

    const postData = state.get('$_POST'); //use "$_POST" rather than ControllerMixinMultipartForm.POST_DATA to avoid dependency.
    const destination = postData?.destination || checkpoint || `/${pathPrefix}${tableName}/${id}`;

    state.set(this.REDIRECT, destination);
  }

  static async action_delete(state) {
    const query = state.get(Controller.STATE_QUERY);
    const model = state.get(this.MODEL);

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
    const client = state.get(Controller.STATE_CLIENT);
    await client.redirect(state.get(this.REDIRECT), state.get(this.REDIRECT_WITH_QUERY));
  }
}


