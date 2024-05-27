import { Controller } from '@lionrockjs/mvc'
import { Central, ControllerMixinDatabase, ControllerMixinMime, ControllerMixinView  } from '@lionrockjs/central';
import { ControllerMixinMultipartForm } from '@lionrockjs/mixin-form';
import { ControllerMixinORMRead, ControllerMixinORMWrite, ControllerMixinORMInput, ControllerMixinORMDelete } from '@lionrockjs/mixin-orm';

import { ControllerMixinLoginRequire } from '@lionrockjs/mod-auth';
import { ControllerMixinSession } from '@lionrockjs/mixin-session';

import ControllerMixinActionLogger from './controller-mixin/ActionLogger.mjs';
import ControllerMixinAdminTemplates from './controller-mixin/AdminTemplates.mjs';
import ControllerMixinCRUDRedirect from './controller-mixin/CRUDRedirect.mjs';
import ControllerMixinExport from './controller-mixin/Export.mjs';
import ControllerMixinUpload from './controller-mixin/Upload.mjs';
import ControllerMixinImport from './controller-mixin/Import.mjs';

export default class ControllerAdmin extends Controller {
  static STATE_MODEL = 'orm_model';

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
      pagesize: request.query.pagesize || 50,
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

    this.state.set(ControllerAdmin.STATE_MODEL, model);

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

  async action_upload_post() {}
}


