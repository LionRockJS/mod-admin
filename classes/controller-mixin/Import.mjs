import { readFile } from 'node:fs/promises';
import { parse } from 'csv-parse/sync';

import { ControllerMixinORMRead } from '@lionrockjs/mixin-orm';
import { ControllerMixinMultipartForm } from '@lionrockjs/mixin-form';
import { ControllerMixin, ORM, ControllerMixinDatabase } from '@lionrockjs/central';
import ControllerMixinUpload from './Upload.mjs';

export default class ControllerMixinImport extends ControllerMixin {
  static UNIQUE_KEY = 'import_unique_key'; // columns as map, key is instance field, value is export header.
  static HEADER_COLUMN_MAP = 'import_header_column_map';
  static ENCODING = 'import_encoding';
  static PARSER_OPTIONS = 'import_parser_options'
  static IMPORT_CSV_HANDLER = 'import_csv_handler';
  static IMPORT_INSTANCE_HANDLER = 'import_instance_handler';
  static DUPLICATED_CSV_RECORDS = 'import_duplicated_csv_records';
  static CREATED_CSV_RECORDS = 'import_created_csv_records';
  static UPDATED_CSV_RECORDS = 'import_updated_csv_records';

  static init(state) {
    state.set(this.DUPLICATED_CSV_RECORDS, []);
    state.set(this.CREATED_CSV_RECORDS, []);
    state.set(this.UPDATED_CSV_RECORDS, []);

    if(!state.get(this.UNIQUE_KEY))state.set(this.UNIQUE_KEY, 'email');
    if(!state.get(this.HEADER_COLUMN_MAP))state.set(this.HEADER_COLUMN_MAP, new Map());
    if(!state.get(this.ENCODING))state.set(this.ENCODING, 'utf8');
    if(!state.get(this.PARSER_OPTIONS))state.set(this.PARSER_OPTIONS, {
      delimiter: ',',
      skip_empty_lines: true,
      skip_records_with_error: true
    });
    if(!state.get(this.IMPORT_CSV_HANDLER))state.set(this.IMPORT_CSV_HANDLER, async (state, csvHeader, csvRecords) => {/***/});
    if(!state.get(this.IMPORT_INSTANCE_HANDLER))state.set(this.IMPORT_INSTANCE_HANDLER, async (state, instance, csvRecord) => {/***/});
  }

  static async readCSV(state){
    const file = state.get(ControllerMixinUpload.FILES)[0];
    /**
     *
     * @type {Buffer}
     */
    const buffer = await readFile(file.target);
    const encoding = state.get(this.ENCODING);
    const text = buffer.toString(encoding);

    const records = parse(text, state.get(this.PARSER_OPTIONS));

    if (records.length <= 1) throw new Error('no record in csv file');
    const header = records.shift().map(it => it.trim());

    //process by csv handler
    const handler = state.get(this.IMPORT_CSV_HANDLER);
    if(handler){
      await handler(state, header, records);
    }

    return {
      header,
      records
    }
  }

  static async writeRecord(state, instance, csvRecord){
    Object.assign(instance, csvRecord);
    await instance.write();
    const handler = state.get(this.IMPORT_INSTANCE_HANDLER);

    if(handler){
      await handler(state, instance, csvRecord);
    }
  }

  static async action_import(state) {/***/}

  static async action_import_post(state) {
    const $_REQUEST = state.get(ControllerMixinMultipartForm.REQUEST_DATA);
    await ControllerMixinUpload.action_upload_post(state);
    const {header: csvHeader, records} = await this.readCSV(state);

    const importUniqueKey = state.get(this.UNIQUE_KEY);
    const headerColumnMap = state.get(this.HEADER_COLUMN_MAP);
    const databaseKey = state.get(ControllerMixinORMRead.DATABASE_KEY);
    const database = state.get(ControllerMixinDatabase.DATABASES).get(databaseKey);

    //auto create header column map from Model fields
    const Model = state.get(ControllerMixinORMRead.MODEL);
    if(headerColumnMap.size === 0){
      [...Model.fields.keys()].forEach(it=>headerColumnMap.set(it,it));
    }

    //verify csv
    //get index of unique key from headers
    const uniqueKeyIndex = csvHeader.findIndex(it => headerColumnMap.get(it) === importUniqueKey);
    if(uniqueKeyIndex === -1) throw new Error('unique key not found in header map');

    const columns = csvHeader.map(it => {
      const result = headerColumnMap.get(it);
      if(!result)return it;
      return result;
    }).filter(it => it !== null);

    //fetch duplicated records
    const uniqueKey = state.get(this.UNIQUE_KEY);
    const duplicateRecords = await ORM.readBy(Model, uniqueKey, records.map(it => it[uniqueKeyIndex]), {database, limit: 99999, asArray:true});

    const instanceMap = new Map();
    duplicateRecords.forEach(it => instanceMap.set(it[uniqueKey], it));

    const duplicatedCSVRecords = state.get(this.DUPLICATED_CSV_RECORDS);
    const createdCSVRecords = state.get(this.CREATED_CSV_RECORDS);
    const updatedCSVRecords = state.get(this.UPDATED_CSV_RECORDS);

    //create or update records
    await Promise.all(
      records.map(async values => {
        //map csv value to database column
        const result = {};
        values.forEach((value, j) => {
          result[columns[j]] = value
        });

        const existRecord = instanceMap.get(result[importUniqueKey]);
        if (existRecord){
          if($_REQUEST['overwrite']){
            //update exist record
            await this.writeRecord(state, existRecord, result);
            updatedCSVRecords.push(Object.assign({}, result));
            return;
          }
          duplicatedCSVRecords.push(Object.assign({},result));
          return;
        }

        //create new record
        const options = {database};
        if(result.id){
          options.insertID = result.id;
          delete result.id;
        }
        const newRecord = ORM.create(Model, options);
        await this.writeRecord(state, newRecord, result);
        createdCSVRecords.push(Object.assign({id: newRecord.id}, result));
      })
    );
  }
}