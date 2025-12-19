import { Controller } from '@lionrockjs/mvc';
export default class ControllerAdmin extends Controller {
    static STATE_MODEL: string;
    static mixins: any[];
    options: any;
    constructor(request: any, model: any, options?: any);
    action_index(): Promise<void>;
    action_create(): Promise<void>;
    action_read(): Promise<void>;
    action_edit(): Promise<void>;
    action_update(): Promise<void>;
    action_delete(): Promise<void>;
    action_export(): Promise<void>;
    action_import(): Promise<void>;
    action_import_post(): Promise<void>;
    action_upload_post(): Promise<void>;
}
