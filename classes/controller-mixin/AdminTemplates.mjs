//review required
import querystring from "node:querystring";
import pluralize from "pluralize";
import camelize from "camelize";
import decamelize from "decamelize";

import { Controller, ControllerMixin } from '@lionrockjs/mvc';
import { Central, ORM, ControllerMixinView, ControllerMixinDatabase } from '@lionrockjs/central';
import { ControllerMixinORMRead, ControllerMixinORMDelete } from '@lionrockjs/mixin-orm';
import { ModelUser as User, ModelLogin as Login } from '@lionrockjs/mod-auth';

export default class ControllerMixinAdminTemplates extends ControllerMixin {
  static ADMIN_DATABASE_KEY = 'adminDBKey';
  static PATH_PREFIX = 'pathPrefix';
  static MODEL = 'orm_model';
  static INSTANCE = 'instance';
  static PAGE_SIZE = 'pageSize';
  static TEMPLATES = 'templates';

  static init(state) {
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
  }

  static classObject(Model) {
    return { ...Model, className: Model?.name };
  }

  static async listView(state, template) {
    const query = state.get(Controller.STATE_QUERY);
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
      end: query.end
    };
    Object.assign(state.get(ControllerMixinView.LAYOUT).data, data);
    ControllerMixinView.setTemplate(state, template, data);
  }

  static async readView(state, template) {
    const params = state.get(Controller.STATE_PARAMS);
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

    state.get(ControllerMixinView.LAYOUT).data.item = instance;
    ControllerMixinView.setTemplate(state, template, data);
  }

  static async entitySupport(state) {
    const checkpoint = state.get(Controller.STATE_CHECKPOINT);
    const { entity, entityID } = state.get(Controller.STATE_PARAMS);
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

  static async modelToTemplateData(state) {
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

  static applyQueryValues(state, instance) {
    const request = state.get(Controller.STATE_REQUEST);
    const model = this.classObject(state.get(ControllerMixinORMRead.MODEL));

    const $_GET = request.query || {};

    if ($_GET.values) {
      const values = JSON.parse($_GET.values);
      model.fields.forEach((v, k) => {
        if (!values[k]) return;
        if (instance[k] === null) {
          instance[k] = values[k];
        }
      });
    }
  }

  static getFieldData(instance) {
    const m = this.classObject(instance.constructor);

    return {
      title: `${(instance.id) ? 'Edit' : 'Create'} ${m.className}`,
      model: m,
      item: instance,
      fields: [...m.fields].map(x => this.getFieldValue('', x[0], x[1], instance[x[0]])),
    };
  }

  static async getBelongsTo(state, instance) {
    const m = this.classObject(instance.constructor);
    if (!m.belongsTo || m.belongsTo.length <= 0) return;

    const items = await Promise.all(
      [...m.belongsTo].map(async x => {
        const fk = x[0];
        const model = await ORM.import(x[1]);
        const items = await ORM.readAll(model, { database: state.get(ControllerMixinDatabase.DATABASES).get(state.get(ControllerMixinORMRead.DATABASE_KEY)), asArray: true });

        return {
          instance,
          model: this.classObject(model),
          foreign_key: fk,
          items,
        };
      }),
    );

    return {
      belongsTo: items,
    };
  }

  static async getBelongsToMany(state, instance) {
    const m = this.classObject(instance.constructor);
    if (!m.belongsToMany || m.belongsToMany.length <= 0) return;

    const items = await Promise.all(
      Array.from(m.belongsToMany).map(async x => {
        const Model = await ORM.import(x);
        const values = await instance.siblings(Model);
        const items = await ORM.readAll(Model, { database: state.get(ControllerMixinDatabase.DATABASES).get(state.get(ControllerMixinORMRead.DATABASE_KEY)), asArray: true });

        const itemsById = {};
        items.forEach(x => itemsById[x.id] = x);

        values.forEach(v => {
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

  static async getHasMany(state, instance) {
    const m = instance.constructor;
    if (!m.hasMany || m.hasMany.length <= 0) return;

    const request = state.get(Controller.STATE_REQUEST);
    const { id } = state.get(Controller.STATE_PARAMS);

    const items = await Promise.all(
      m.hasMany.map(async x => {
        const fk = x[0];
        const Model = await ORM.import(x[1]);
        const fields = [...Model.fields].map(x => ({ name: x[0], type: x[1].replace(/!$/, ''), required: /!$/.test(x[1]) }));
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

  static getDomain(state) {
    return {
      domain: state.get(Controller.STATE_HOSTNAME),
    };
  }

  static getFormDestination(state) {
    const request = state.get(Controller.STATE_REQUEST);
    const $_GET = request.query || {};
    if ($_GET.cp) {
      return {
        destination: $_GET.cp,
      };
    }
    return {};
  }

  static async before(state) {
    const client = state.get(Controller.STATE_CLIENT);
    const request = state.get(Controller.STATE_REQUEST);
    const { session } = request;

    if(session.user_id && session.user_meta && !session.user_meta.full_name){
      const database = state.get(ControllerMixinDatabase.DATABASES).get(state.get(this.ADMIN_DATABASE_KEY));
      const user = await ORM.factory(User, session.user_id, {database});
      await user.eagerLoad({with: ['Person']});
      session.user_meta.full_name = user.person.first_name + (user.person.last_name ? (' '+ user.person.last_name) : '');
    }

    Object.assign(
      state.get(ControllerMixinView.LAYOUT).data,
      {
        model: this.classObject(state.get(ControllerMixinORMRead.MODEL)),
        controller: decamelize(client.constructor.name, {separator: '-'}),
        action: state.get(Controller.STATE_ACTION),
        user_full_name: session.user_meta.full_name,
        user_role: session.roles.join(' role-'),
        checkpoint: state.get(Controller.STATE_CHECKPOINT),
      },
    );

    const userId = session.user_id;
    const adminDB = state.get(ControllerMixinDatabase.DATABASES).get(state.get(this.ADMIN_DATABASE_KEY));

    const lastLogin = await ORM.readBy(Login, 'user_id', [userId], { database: adminDB, limit: 1, offset: 1, orderBy: new Map([['created_at', 'DESC']]) });

    if (lastLogin) {
      Object.assign(state.get(ControllerMixinView.LAYOUT).data, {
        last_login_date: lastLogin.created_at,
        last_login_ip: lastLogin.ip,
        ip: state.get(Controller.STATE_CLIENT_IP),
      });
    }
  }

  static async action_index(state) {
    await this.listView(state, state.get(this.TEMPLATES).get('index'));
  }

  static async action_read(state) {
    await this.readView(state, state.get(this.TEMPLATES).get('read'));
  }

  static async action_edit(state) {
    await this.readView(state, state.get(this.TEMPLATES).get('edit'));
  }

  static async action_create(state) {
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

    const layoutData = state.get(ControllerMixinView.LAYOUT).data;
    layoutData.item = instance;

    ControllerMixinView.setTemplate(state, state.get(this.TEMPLATES).get('create'), data);
  }

  static async action_delete(state) {
    const params = state.get(Controller.STATE_PARAMS);
    const query = state.get(Controller.STATE_QUERY);
    const model = this.classObject(state.get(ControllerMixinORMRead.MODEL));
    const { id } = params;

    if (!id) {
      throw new Error(`Delete ${model.name} require object id`);
    }

    if (!query.confirm) {
      const checkpoint = state.get(Controller.STATE_CHECKPOINT);
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

  static getFieldValue(scope, fieldName, fieldType = '', value = null) {
    return {
      label: fieldName,
      name: `${scope}:${fieldName}`,
      type: fieldType.replace(/!$/, ''),
      required: /!$/.test(fieldType),
      value,
    };
  }
}