import { ControllerMixin } from '@lionrockjs/central';
export default class ControllerMixinImport extends ControllerMixin {
    static UNIQUE_KEY: string;
    static HEADER_COLUMN_MAP: string;
    static ENCODING: string;
    static PARSER_OPTIONS: string;
    static IMPORT_CSV_HANDLER: string;
    static IMPORT_INSTANCE_HANDLER: string;
    static DUPLICATED_CSV_RECORDS: string;
    static CREATED_CSV_RECORDS: string;
    static UPDATED_CSV_RECORDS: string;
    static init(state: Map<string, any>): void;
    static readCSV(state: Map<string, any>): Promise<{
        header: any;
        records: unknown[];
    }>;
    static writeRecord(state: Map<string, any>, instance: any, csvRecord: any): Promise<void>;
    static action_import(state: Map<string, any>): Promise<void>;
    static action_import_post(state: Map<string, any>): Promise<void>;
}
