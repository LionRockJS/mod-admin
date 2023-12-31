import { Controller } from '@lionrockjs/mvc'
import { Central, ControllerMixinDatabase, ControllerMixinMime, ControllerMixinView  } from '@lionrockjs/central';
import { ControllerMixinMultipartForm } from '@lionrockjs/mod-form';
import { ControllerMixinORMRead, ControllerMixinORMWrite, ControllerMixinORMInput, ControllerMixinORMDelete } from '@lionrockjs/mixin-orm';

import { ControllerMixinLoginRequire } from '@kohanajs/mod-auth';
import { ControllerMixinSession } from '@kohanajs/mod-session';
import ControllerMixinActionLogger from './controller-mixin/ActionLogger.mjs';
import ControllerMixinAdminTemplates from './controller-mixin/AdminTemplates';
import ControllerMixinCRUDRedirect from './controller-mixin/CRUDRedirect';
import ControllerMixinExport from './controller-mixin/Export';
import ControllerMixinUpload from './controller-mixin/Upload';
import ControllerMixinImport from './controller-mixin/Import';

export default class ControllerAdmin extends Controller {
  static mixins = [...Controller.mixins,
    ControllerMixinDatabase,
    ControllerMixinSession,
    ControllerMixinLoginRequire,
    ControllerMixinActionLogger,
    ControllerMixinMultipartForm,
    ControllerMixinORMRead,
    ControllerMixinORMInput,
    ControllerMixinORMWrite,
    ControllerMixinORMDelete,
    ControllerMixinCRUDRedirect,
    ControllerMixinMime,
    ControllerMixinView,
    ControllerMixinAdminTemplates,
    ControllerMixinExport,
    ControllerMixinUpload,
    ControllerMixinImport]

  constructor(request, model, options = {}) {
    super(request,
    new Map([
      [ControllerMixinLoginRequire.REJECT_LANDING, options.rejectLanding || '/login'],
      [ControllerMixinLoginRequire.ALLOW_ROLES, options.roles || new Set(['admin', 'staff'])],
      [ControllerMixinActionLogger.LOG_ACTIONS, options.log_actions || new Set(['create', 'update', 'delete'])],
      [ControllerMixinORMRead.MODEL, model],
      [ControllerMixinORMRead.DATABASE_KEY, options.database || 'admin'],
      [ControllerMixinView.LAYOUT_FILE, options.layout || 'layout/admin/default'],
    ]));

    this.options = { rejectLanding: '/login',
      roles: new Set(['admin', 'staff']),
      layout: 'layout/admin/default',
      databases: new Map(),
      database: 'admin',
      pagesize: this.request.query.pagesize || 50,
      log_actions: new Set(['create', 'update', 'delete']),
      orderBy: new Map([[request.query.sort ?? 'created_at', request.query.order ?? 'DESC']]),
      templates: new Map([
        ['index', 'templates/admin/index'],
        ['read', 'templates/admin/edit'],
        ['edit', 'templates/admin/edit'],
        ['create', 'templates/admin/edit'],
        ['dialog', 'templates/admin/dialog'],
      ]),
      ...options };

    this.model = model;

    const databaseMap = this.state.get(ControllerMixinDatabase.DATABASE_MAP);

    new Map([
      ['admin', `${Central.config.auth.databasePath}/admin.sqlite`],
      ['session', `${Central.config.auth.databasePath}/session.sqlite`],
    ]).forEach((v, k) => databaseMap.set(k, v));

    this.options.databases.forEach((v, k) => databaseMap.set(k, v));

    this.state.get(ControllerMixinORMRead.ORM_OPTIONS)
      .set('limit', this.options.pagesize)
      .set('orderBy', this.options.orderBy);

    this.state.set(ControllerMixinORMWrite.DATABASE_KEY, this.state.get(ControllerMixinORMRead.DATABASE_KEY));

    const templates = this.state.get(ControllerMixinAdminTemplates.TEMPLATES);
    this.options.templates.forEach((v, k) => templates.set(k, v));
    this.state.set(ControllerMixinAdminTemplates.PAGE_SIZE, this.options.pagesize);

    //    this.addMixin(new ControllerMixinAdminTemplates(this, $(this.databases).get('admin'), $(this.databases).get(this.options.database), this.layout, this.setTemplate, model, this.deleteSign, this.count, this.options.pagesize, 'admin/'));
  }

  async action_index() {}

  async action_create() {}

  async action_read() {}

  async action_edit() {}

  async action_update() {}

  async action_delete() {}

  async action_export() {}

  async action_import() {}

  async action_import_post() {}
}


