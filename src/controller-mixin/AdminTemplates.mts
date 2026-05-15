import querystring from "node:querystring";
import pluralize from "pluralize";
import camelize from "camelize";
import decamelize from "decamelize";

import { ControllerState, ControllerMixin, Central, ORM, ControllerMixinView, ControllerMixinViewState, ControllerMixinDatabase } from '@lionrockjs/central';
import { ControllerMixinORMRead, ControllerMixinORMDelete } from '@lionrockjs/mixin-orm';
import { ModelUser as User, ModelLogin as Login } from '@lionrockjs/mod-auth';

export default class ControllerMixinAdminTemplates extends ControllerMixin {
  static ADMIN_DATABASE_KEY = 'adminDBKey';
  static PATH_PREFIX = 'pathPrefix';
  static MODEL = 'orm_model';
  static PAGE_SIZE = 'pageSize';
  static TEMPLATES = 'templates';
  static DEFAULT_TEMPLATES = 'defaultTemplates';

  static init(state: Map<string, any>) {
    if(!state.get(this.PATH_PREFIX)) state.set(this.PATH_PREFIX, 'admin/');
    if(!state.get(this.ADMIN_DATABASE_KEY)) state.set(this.ADMIN_DATABASE_KEY, 'admin');
    if(!state.get(this.PAGE_SIZE)) state.set(this.PAGE_SIZE, 50);
    if(!state.get(this.TEMPLATES)) state.set(this.TEMPLATES, new Map([
      ['index', 'templates/admin/index'],
      ['read', 'templates/admin/edit'],
      ['edit', 'templates/admin/edit'],
      ['create', 'templates/admin/edit'],
      ['dialog', 'templates/admin/dialog'],
    ]));
    if(!state.get(this.DEFAULT_TEMPLATES)) state.set(this.DEFAULT_TEMPLATES, new Map([
      ['index', 'templates/admin/index'],
      ['read', 'templates/admin/edit'],
      ['edit', 'templates/admin/edit'],
      ['create', 'templates/admin/edit'],
      ['dialog', 'templates/admin/dialog'],
    ]));
  }

  static async after(state: Map<string, any>) {
    const request = state.get(ControllerState.REQUEST);
    const session = request.session;
    const user = {
      id: session.user_id,
      name: session.user_meta.full_name,
    };

    const template = state.get(ControllerMixinViewState.TEMPLATE);
    if(template && template.data){
      Object.assign(
        template.data,
        { user }
      )
    }
  }

  static classObject(Model: any) {
    return { ...Model, className: Model?.name };
  }

  static async listView(state: Map<string, any>, template: string, defaultTemplate: string) {
    const query = state.get(ControllerState.QUERY);
    const model = this.classObject(state.get(ControllerMixinORMRead.MODEL));

    const page = parseInt(query.page ?? '1');
    const maxPage = Math.ceil(state.get(ControllerMixinORMRead.COUNT) / state.get(this.PAGE_SIZE));

    const data = {
      items: state.get(ControllerMixinORMRead.INSTANCES),
      type: model,
      page,
      maxPage,
      query: querystring.encode(query),
      start: query.start,
      end: query.end,
      paginate: {
        "current_offset": (page-1) * state.get(this.PAGE_SIZE),
        "current_page": page,
        "items": state.get(ControllerMixinORMRead.COUNT),
        "page_param": model.className,
        "page_size": state.get(this.PAGE_SIZE),
        "pages": maxPage,
        "parts": [],
        "previous": {
          is_link: page > 1,
        },
        "next": {
          is_link: page < maxPage,
        },
      }
    };
    Object.assign(state.get(ControllerMixinViewState.LAYOUT).data, data);
    ControllerMixinView.setTemplate(state, template, data, defaultTemplate);
  }

  static async readView(state: Map<string, any>, template: string, defaultTemplate: string) {
    const params = state.get(ControllerState.PARAMS);
    const model = this.classObject(state.get(ControllerMixinORMRead.MODEL));

    const { entity, entityID, id } = params;
    const instance = state.get(ControllerMixinORMRead.INSTANCE);

    const templateData = await this.modelToTemplateData(state);

    const data = {
      item: instance,
      model,
      deleteURL: (entity)
        ? `/admin/b/${entity}-${entityID}/${model.tableName}/delete/${id}?cp=/admin/b/${entity}-${entityID}/${model.tableName}/${id}`
        : `/admin/${model.tableName}/delete/${id}`,
      ...templateData,
      ... await this.entitySupport(state),
    };

    state.get(ControllerMixinViewState.LAYOUT).data.item = instance;
    ControllerMixinView.setTemplate(state, template, data, defaultTemplate);
  }

  static async entitySupport(state: Map<string, any>) {
    const checkpoint = state.get(ControllerState.CHECKPOINT);
    const { entity, entityID } = state.get(ControllerState.PARAMS);
    if (!entity) return (checkpoint) ? { destination: checkpoint } : {};

    const singularEntity = pluralize.singular(entity);
    const entityClassName = singularEntity.charAt(0).toUpperCase() + singularEntity.slice(1);

    const entityClass = await ORM.import(camelize(entityClassName));
    if (!entityClass) throw new Error('invalid entity');

    const destination = (checkpoint) ? { destination: checkpoint, checkpoint }
      : ((entity) ? { destination: `/${state.get(this.PATH_PREFIX)}${entity}/${entityID}` } : null);

    return {
      entityClass,
      entity,
      entityID,
      ...destination,
    };
  }

  static async modelToTemplateData(state: Map<string, any>) {
    const instance = state.get(ControllerMixinORMRead.INSTANCE);
    this.applyQueryValues(state, instance);

    try {
      return Object.assign(
        this.getFieldData(instance),
        await this.getBelongsTo(state, instance),
        await this.getBelongsToMany(state, instance),
        await this.getHasMany(state, instance),
        this.getFormDestination(state),
        this.getDomain(state),
      );
    } catch (e) {
      Central.log(instance);
      Central.log(e);
    }

    return {};
  }

  static applyQueryValues(state: Map<string, any>, instance: any) {
    const request = state.get(ControllerState.REQUEST);
    const model = this.classObject(state.get(ControllerMixinORMRead.MODEL));

    const $_GET = request.query || {};

    if ($_GET.values) {
      const values = JSON.parse($_GET.values);
      model.fields.forEach((v: any, k: string) => {
        if (!values[k]) return;
        if (instance[k] === null) {
          instance[k] = values[k];
        }
      });
    }
  }

  static getFieldData(instance: any) {
    const m = this.classObject(instance.constructor);

    return {
      title: `${(instance.id) ? 'Edit' : 'Create'} ${m.className}`,
      model: m,
      item: instance,
      fields: [...m.fields].map(x => this.getFieldValue('', x[0], x[1], instance[x[0]])),
    };
  }

  static async getBelongsTo(state: Map<string, any>, instance: any) {
    const m = this.classObject(instance.constructor);
    if (!m.belongsTo || m.belongsTo.length <= 0) return {};

    const items = await Promise.all(
      [...m.belongsTo].map(async x => {
        const fk = x[0];
        const Model = await ORM.import(x[1]);
        const items = await ORM.readAll(Model, { database: state.get(ControllerMixinDatabase.DATABASES).get(state.get(ControllerMixinORMRead.DATABASE_KEY)), asArray: true });

        return {
          instance,
          model: this.classObject(Model),
          foreign_key: fk,
          items,
        };
      }),
    );

    return {
      belongsTo: items,
    };
  }

  static async getBelongsToMany(state: Map<string, any>, instance: any) {
    const m = this.classObject(instance.constructor);
    if (!m.belongsToMany || m.belongsToMany.length <= 0) return {};

    const items = await Promise.all(
      Array.from(m.belongsToMany).map(async (x: any) => {
        const Model = await ORM.import(x);
        const values = await instance.siblings(Model);
        const items = await ORM.readAll(Model, { database: state.get(ControllerMixinDatabase.DATABASES).get(state.get(ControllerMixinORMRead.DATABASE_KEY)), asArray: true });

        const itemsById: any = {};
         (items as any[]).forEach((x: any) => itemsById[x.id] = x);

         (values as any[]).forEach((v: any) => {
          itemsById[v.id].linked = true;
        });

        return {
          model: this.classObject(Model),
          values,
          items,
        };
      }),
    );

    return { belongsToMany: items };
  }

  static async getHasMany(state: Map<string, any>, instance: any) {
    const m = instance.constructor;
    if (!m.hasMany || m.hasMany.length <= 0) return {};

    const request = state.get(ControllerState.REQUEST);
    const { id } = state.get(ControllerState.PARAMS);

    const items = await Promise.all(
      m.hasMany.map(async (x: any) => {
        const fk = x[0];
        const Model = await ORM.import(x[1]);
        const fields = [...Model.fields].map((x: any) => ({ name: x[0], type: x[1].replace(/!$/, ''), required: /!$/.test(x[1]) }));
        try {
          const items = await instance.children(fk, Model);
          return {
            fk,
            model: this.classObject(Model),
            fields,
            items,
            defaultValues: encodeURIComponent(`{"${fk}":${id}}`),
            checkpoint: encodeURIComponent(request.raw.url),
          };
        } catch (e) {
          Central.log(e);
          Central.log(Model);
        }
      }),
    );

    return { hasMany: items };
  }

  static getDomain(state: Map<string, any>) {
    return {
      domain: state.get(ControllerState.HOSTNAME),
    };
  }

  static getFormDestination(state: Map<string, any>) {
    const request = state.get(ControllerState.REQUEST);
    const $_GET = request.query || {};
    if ($_GET.cp) {
      return {
        destination: $_GET.cp,
      };
    }
    return {};
  }

  static getFieldValue(scope: string, fieldName: string, fieldType: string = '', value: any = null) {
    return {
      label: fieldName,
      name: `${scope}:${fieldName}`,
      type: fieldType.replace(/!$/, ''),
      required: /!$/.test(fieldType),
      value,
    };
  }

  static async before(state: Map<string, any>) {
    const client = state.get(ControllerState.CLIENT);
    const request = state.get(ControllerState.REQUEST);
    const { session } = request;

    if(session.user_id && session.user_meta && !session.user_meta.full_name){
      const database = state.get(ControllerMixinDatabase.DATABASES).get(state.get(this.ADMIN_DATABASE_KEY));
      const user = await ORM.factory(User, session.user_id, {database});
      await user.eagerLoad({with: ['Person']});
       session.user_meta.full_name = (user as any).person.first_name + ((user as any).person.last_name ? (' '+ (user as any).person.last_name) : '');
    }

    Object.assign(
      state.get(ControllerMixinViewState.LAYOUT).data,
      {
        model: this.classObject(state.get(ControllerMixinORMRead.MODEL)),
        controller: decamelize(client.constructor.name, {separator: '-'}),
        action: state.get(ControllerState.ACTION),
        user_full_name: session.user_meta.full_name,
        user_role: session.roles.join(' role-'),
        user_roles: session.roles,
        checkpoint: state.get(ControllerState.CHECKPOINT),
      },
    );

    const userId = session.user_id;
    const adminDB = state.get(ControllerMixinDatabase.DATABASES).get(state.get(this.ADMIN_DATABASE_KEY));

    const lastLogins = await ORM.readBy(Login, 'user_id', [userId], { database: adminDB, limit: 1, offset: 1, orderBy: new Map([['created_at', 'DESC']]) });
    const lastLogin = lastLogins[0];

    if (lastLogin) {
      Object.assign(state.get(ControllerMixinViewState.LAYOUT).data, {
        last_login_date: lastLogin.created_at,
        last_login_ip: lastLogin.ip,
        ip: state.get(ControllerState.CLIENT_IP),
      });
    }
  }

  static async action_index(state: Map<string, any>) {
    await this.listView(state, state.get(this.TEMPLATES).get('index'), state.get(this.DEFAULT_TEMPLATES).get('index'));
  }

  static async action_read(state: Map<string, any>) {
    await this.readView(state, state.get(this.TEMPLATES).get('read'), state.get(this.DEFAULT_TEMPLATES).get('read'));
  }

  static async action_edit(state: Map<string, any>) {
    await this.readView(state, state.get(this.TEMPLATES).get('edit'), state.get(this.DEFAULT_TEMPLATES).get('edit'))
  }

  static async action_create(state: Map<string, any>) {
    const model = this.classObject(state.get(ControllerMixinORMRead.MODEL));
    const database = state.get(ControllerMixinDatabase.DATABASES).get(state.get(ControllerMixinORMRead.DATABASE_KEY));

    const instance = state.get(ControllerMixinORMRead.INSTANCE) || ORM.create(state.get(ControllerMixinORMRead.MODEL), { database });
    state.set(ControllerMixinORMRead.INSTANCE, instance);
    const templateData = await this.modelToTemplateData(state);
    const data = {
      model,
      ...templateData,
      ...await this.entitySupport(state),
    };

    const layoutData = state.get(ControllerMixinViewState.LAYOUT).data;
    layoutData.item = instance;

    ControllerMixinView.setTemplate(state, state.get(this.TEMPLATES).get('create'), data);
  }

  static async action_delete(state: Map<string, any>) {
    const params = state.get(ControllerState.PARAMS);
    const query = state.get(ControllerState.QUERY);
    const model = this.classObject(state.get(ControllerMixinORMRead.MODEL));
    const { id } = params;

    if (!id) {
      throw new Error(`Delete ${model.name} require object id`);
    }

    if (!query.confirm) {
      const checkpoint = state.get(ControllerState.CHECKPOINT);
      const { entity, entityID } = params;
      const deleteSign = state.get(ControllerMixinORMDelete.DELETE_SIGN);
      const pathPrefix = state.get(this.PATH_PREFIX);

      const data = {
        title: `Please confirm to delete ${model.className} (${id})`,
        message: 'Are you sure?',
        cancelURL: checkpoint || `/${pathPrefix}${model.tableName}`,
        confirmURL: `/${pathPrefix}${model.tableName}/delete/${id}?confirm=${encodeURIComponent(deleteSign)}${checkpoint ? `&cp=${checkpoint}` : ''}`,
        label: 'Confirm',
        ...(entity ? {
          cancelURL: checkpoint || `/admin/${entity}/${entityID}`,
          confirmURL: `/admin/${model.tableName}/delete/${id}?confirm=${encodeURIComponent(deleteSign)}&cp=/admin/${entity}/${entityID}`,
        } : {}),
      };

      ControllerMixinView.setTemplate(state, state.get(this.TEMPLATES).get('dialog'), data);
    }
  }
}
