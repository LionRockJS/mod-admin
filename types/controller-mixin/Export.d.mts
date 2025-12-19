import { ControllerMixin } from '@lionrockjs/central';
export default class ControllerMixinExport extends ControllerMixin {
    static COLUMNS: string;
    static EAGER_LOAD_FUNCTION: string;
    static EXPORT_INSTANCE_HANDLER: string;
    static EXPORT_INSTANCES_FILTER: string;
    static init(state: Map<string, any>): void;
    static action_export(state: Map<string, any>): Promise<void>;
}
