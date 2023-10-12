const querystring = require('querystring');
const pluralize = require('pluralize');
const camelize = require('camelize');
const { ControllerMixin } = require('@kohanajs/core-mvc');
const { ORM, ControllerMixinView, ControllerMixinDatabase } = require('kohanajs');
const { ControllerMixinORMRead, ControllerMixinORMDelete } = require('@kohanajs/mixin-orm');

const Login = ORM.require('Login');
const User = ORM.require('User');

class ControllerMixinAdminTemplates extends ControllerMixin {
  static ADMIN_DATABASE_KEY = 'adminDBKey';

  static PATH_PREFIX = 'pathPrefix';

  static MODEL = 'model';

  static INSTANCE = 'instance';

  static PAGE_SIZE = 'pageSize';

  static TEMPLATES = 'templates';

  static init(state) {
    state.set(this.PATH_PREFIX, state.get(this.PATH_PREFIX) || 'admin/');
    state.set(this.ADMIN_DATABASE_KEY, state.get(this.ADMIN_DATABASE_KEY) || 'admin');
    state.set(this.PAGE_SIZE, state.get(this.PAGE_SIZE) || 50);
    state.set(this.TEMPLATES, state.get(this.TEMPLATES) || new Map([
      ['index', 'templates/admin/index'],
      ['read', 'templates/admin/edit'],
      ['edit', 'templates/admin/edit'],
      ['create', 'templates/admin/edit'],
      ['dialog', 'templates/admin/dialog'],
    ]));

    const client = state.get(ControllerMixin.CLIENT);
    client.listView = client.listView || (async template => {
      await this.listView(state, template);
    });

    client.readView = client.readView || (async template => {
      await this.readView(state, template);
    });
  }

  static classObject(Model) {
    return { ...Model, className: Model?.name };
  }

  static async listView(state, template) {
    const client = state.get(ControllerMixin.CLIENT);
    const { request } = client;
    const model = this.classObject(client.model);

    const page = parseInt(request.query.page ?? '1');
    const maxPage = Math.ceil(state.get(ControllerMixinORMRead.COUNT) / state.get(this.PAGE_SIZE));

    const data = {
      items: state.get(ControllerMixinORMRead.INSTANCES),
      type: model,
      page,
      maxPage,
      query: querystring.encode(request.query),
      start:request.query.start,
      end:request.query.end
    };
    Object.assign(state.get(ControllerMixinView.LAYOUT).data, data);

    client.setTemplate(template, data);
  }

  static async readView(state, template) {
    const client = state.get(ControllerMixin.CLIENT);
    const { params } = client.request;
    const model = this.classObject(client.model);

    const { entity } = params;
    const { entityID } = params;
    const { id } = params;
    const instance = state.get(ControllerMixinORMRead.INSTANCE);

    const templateData = await this.modelToTemplateData(state);

    const data = {
      item: instance,
      model,
      deleteURL: (entity)
        ? `/admin/b/${entity}-${entityID}/${model.tableName}/delete/${id}?cp=/admin/b/${entity}-${entityID}/${model.tableName}/${id}`
        : `/admin/${model.tableName}/delete/${id}`,
      ...templateData,
      ...this.entitySupport(state),
    };

    state.get(ControllerMixinView.LAYOUT).data.item = instance;
    client.setTemplate(template, data);
  }

  static entitySupport(state) {
    const { request } = state.get(ControllerMixin.CLIENT);

    const checkpoint = request.query.cp;
    const { entity, entityID } = request.params;
    if (!entity) return (checkpoint) ? { destination: checkpoint } : {};

    const singularEntity = pluralize.singular(entity);
    const entityClassName = singularEntity.charAt(0).toUpperCase() + singularEntity.slice(1);

    const entityClass = ORM.require(camelize(entityClassName));
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
      console.log(instance);
      console.log(e);
    }

    return {};
  }

  static applyQueryValues(state, instance) {
    const client = state.get(ControllerMixin.CLIENT);
    const model = this.classObject(client.model);

    const $_GET = client.request.query || {};

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
        const model = ORM.require(x[1]);
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
        const Model = ORM.require(x);
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

    const client = state.get(ControllerMixin.CLIENT);
    const { id } = client.request.params;

    const items = await Promise.all(
      m.hasMany.map(async x => {
        const fk = x[0];
        const Model = ORM.require(x[1]);
        const fields = [...Model.fields].map(x => ({ name: x[0], type: x[1].replace(/!$/, ''), required: /!$/.test(x[1]) }));
        try {
          const items = await instance.children(fk, Model);
          return {
            fk,
            model: this.classObject(Model),
            fields,
            items,
            defaultValues: encodeURIComponent(`{"${fk}":${id}}`),
            checkpoint: encodeURIComponent(client.request.raw.url),
          };
        } catch (e) {
          console.log(e);
          console.log(Model);
        }
      }),
    );

    return { hasMany: items };
  }

  static getDomain(state) {
    const client = state.get(ControllerMixin.CLIENT);
    return {
      domain: client.request.hostname,
    };
  }

  static getFormDestination(state) {
    const client = state.get(ControllerMixin.CLIENT);
    const $_GET = client.request.query || {};
    if ($_GET.cp) {
      return {
        destination: $_GET.cp,
      };
    }
    return {};
  }

  static async before(state) {
    const client = state.get(ControllerMixin.CLIENT);
    const { model } = client;
    const { request } = client;
    const { session } = request;
    const {default: decamelize} = await import('decamelize');

    if(session.user_id && session.user_meta && !session.user_meta.full_name){

      const database = state.get(ControllerMixinDatabase.DATABASES).get(state.get(this.ADMIN_DATABASE_KEY));
      const user = await ORM.factory(User, session.user_id, {database});
      await user.eagerLoad({with: ['Person']});
      session.user_meta.full_name = user.person.first_name + (user.person.last_name ? (' '+ user.person.last_name) : '');
    }

    Object.assign(
      state.get(ControllerMixinView.LAYOUT).data,
      {
        model: this.classObject(model),
        controller: decamelize(client.constructor.name, {separator: '-'}),
        action: request.params.action,
        user_full_name: session.user_meta.full_name,
        user_role: session.roles.join(' role-'),
        checkpoint: request.query.cp,
      },
    );

    const userId = session.user_id;
    const adminDB = state.get(ControllerMixinDatabase.DATABASES).get(state.get(this.ADMIN_DATABASE_KEY));

    const lastLogin = await ORM.readBy(Login, 'user_id', [userId], { database: adminDB, limit: 1, offset: 1, orderBy: new Map([['created_at', 'DESC']]) });

    if (lastLogin) {
      Object.assign(state.get(ControllerMixinView.LAYOUT).data, {
        last_login_date: lastLogin.created_at,
        last_login_ip: lastLogin.ip,
        ip: client.clientIP,
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
    const client = state.get(ControllerMixin.CLIENT);
    const model = this.classObject(client.model);
    const database = state.get(ControllerMixinDatabase.DATABASES).get(state.get(ControllerMixinORMRead.DATABASE_KEY));

    const instance = state.get(ControllerMixinORMRead.INSTANCE) || ORM.create(client.model, { database });
    state.set(ControllerMixinORMRead.INSTANCE, instance);
    const templateData = await this.modelToTemplateData(state);
    const data = {
      model,
      ...templateData,
      ...this.entitySupport(state),
    };

    const layoutData = state.get(ControllerMixinView.LAYOUT).data;
    layoutData.item = instance;

    client.setTemplate(state.get(this.TEMPLATES).get('create'), data);
  }

  static async action_delete(state) {
    const client = state.get(ControllerMixin.CLIENT);
    const { params } = client.request;
    const { query } = client.request;
    const model = this.classObject(client.model);
    const { id } = client.request.params;

    if (!id) {
      throw new Error(`Delete ${model.name} require object id`);
    }

    if (!query.confirm) {
      const checkpoint = query.cp;
      const { entity } = params;
      const { entityID } = params;
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

      client.setTemplate(state.get(this.TEMPLATES).get('dialog'), data);
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
module.exports = ControllerMixinAdminTemplates;
