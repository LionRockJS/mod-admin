import {ControllerMixin, Controller} from '@lionrockjs/mvc';
import {ControllerMixinORMRead} from '@lionrockjs/mixin-orm';

export default class ControllerMixinExport extends ControllerMixin{
  static COLUMNS = 'export_columns'; // columns as map, key is instance field, value is export header.
  static EAGER_LOAD_FUNCTION = 'export_eager_load';
  static EXPORT_INSTANCE_HANDLER = 'export_instance_handler';
  static EXPORT_INSTANCES_FILTER = 'export_instances_filter';

  static init(state) {
    if (!state.get(this.COLUMNS))state.set(this.COLUMNS, new Map([['created_at', 'Date']]));
    if (!state.get(this.EAGER_LOAD_FUNCTION))state.set(this.EAGER_LOAD_FUNCTION, async state =>{/***/});
    if (!state.get(this.EXPORT_INSTANCE_HANDLER))state.set(this.EXPORT_INSTANCE_HANDLER, async (state, instance) => {/***/});
    if (!state.get(this.EXPORT_INSTANCES_FILTER))state.set(this.EXPORT_INSTANCES_FILTER, async (state) => {/***/});
  }

  static async setup(state) {}

  static async action_export(state){
    // set response header
    const headers = state.get(Controller.STATE_HEADERS);
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    headers['Pragma'] = 'no-cache';
    headers['Expires'] = '0';
    headers['Content-Type'] = 'application/csv; charset=utf-8';

    // action_index get instances
    state.get(ControllerMixinORMRead.ORM_OPTIONS).set('limit', 99999);
    await ControllerMixinORMRead.action_index(state);
    const instances = state.get(ControllerMixinORMRead.INSTANCES);

    // eagerLoad
    await state.get(this.EAGER_LOAD_FUNCTION)(state);

    // Loop columns create rows
    const rows = [];
    const columns = state.get(this.COLUMNS);

    const instanceHandler = state.get(this.EXPORT_INSTANCE_HANDLER);
    await Promise.all(
      instances.map(async it =>{
        await instanceHandler(state, it);
      })
    )

    // filter
    await state.get(this.EXPORT_INSTANCES_FILTER)(state);

    const filteredInstances = state.get(ControllerMixinORMRead.INSTANCES);

    filteredInstances.forEach(it =>{
      if(!it)return;

      rows.push([...columns.keys()]
        .map(key => {
          if(key.match(/_at$/) && it[key]){
            const date = new Date(it[key] + 'Z');
            return `${date.getFullYear()}-${date.getMonth()<9 ? "0" : ""}${date.getMonth()+1}-${date.getDate()<10 ? "0" : ""}${date.getDate()} ${date.getHours()<10 ? "0" : ""}${date.getHours()}:${date.getMinutes()<10 ? "0" : ""}${date.getMinutes()}:${date.getSeconds()<10 ? "0" : ""}${date.getSeconds()}`
          }
          return it[key] ?? '--';
        })
        .map(x => {
          if (typeof x === 'string'){
            return `"=""${x.replaceAll('"', '""""')}"""`
          }else{
            return x;
          }
        })
        .join(','))
    })

    // Add CSV header
    rows.unshift([...columns.values()].map(x=> (typeof x === 'string') ? `"=""${x}"""`: x).join(','))

    // Add BOM
    state.set(Controller.STATE_BODY, '\ufeff'+ rows.join('\n'));
  }
}