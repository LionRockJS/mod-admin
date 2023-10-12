const { Controller } = require('@kohanajs/core-mvc');

const { KohanaJS, ControllerMixinDatabase, ControllerMixinMime, ControllerMixinView } = require('kohanajs');
const { ControllerMixinMultipartForm } = require('@kohanajs/mod-form');

const { ControllerMixinORMRead, ControllerMixinORMWrite, ControllerMixinORMInput, ControllerMixinORMDelete } = require('@kohanajs/mixin-orm');
const { ControllerMixinLoginRequire } = require('@kohanajs/mod-auth');
const { ControllerMixinSession } = require('@kohanajs/mod-session');
const ControllerMixinActionLogger = KohanaJS.require('controller-mixin/ActionLogger');
const ControllerMixinAdminTemplates = KohanaJS.require('controller-mixin/AdminTemplates');
const ControllerMixinCRUDRedirect = KohanaJS.require('controller-mixin/CRUDRedirect');
const ControllerMixinExport = KohanaJS.require('controller-mixin/Export');
const ControllerMixinUpload = KohanaJS.require('controller-mixin/Upload');
const ControllerMixinImport = KohanaJS.require('controller-mixin/Import');

class ControllerAdmin extends Controller {
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
    super(request);

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
      ['admin', `${KohanaJS.config.auth.databasePath}/admin.sqlite`],
      ['session', `${KohanaJS.config.auth.databasePath}/session.sqlite`],
    ]).forEach((v, k) => databaseMap.set(k, v));
    this.options.databases.forEach((v, k) => databaseMap.set(k, v));

    this.state.set(ControllerMixinLoginRequire.REJECT_LANDING, this.options.rejectLanding);
    this.state.set(ControllerMixinLoginRequire.ALLOW_ROLES, this.options.roles);
    this.state.set(ControllerMixinActionLogger.LOG_ACTIONS, this.options.log_actions);
    this.state.set(ControllerMixinORMRead.MODEL, this.model);

    this.state.set(ControllerMixinORMRead.DATABASE_KEY, this.options.database);
    this.state.get(ControllerMixinORMRead.ORM_OPTIONS)
      .set('limit', this.options.pagesize)
      .set('orderBy', this.options.orderBy);

    this.state.set(ControllerMixinORMWrite.DATABASE_KEY, this.state.get(ControllerMixinORMRead.DATABASE_KEY));
    this.state.set(ControllerMixinView.LAYOUT_FILE, this.options.layout);

    const templates = this.state.get(ControllerMixinAdminTemplates.TEMPLATES);
    this.options.templates.forEach((v, k) => {
      templates.set(k, v);
    });

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

module.exports = ControllerAdmin;
