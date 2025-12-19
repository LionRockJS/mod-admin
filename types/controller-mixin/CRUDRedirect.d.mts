import { ControllerMixin } from '@lionrockjs/central';
export default class ControllerMixinCRUDRedirect extends ControllerMixin {
    static PATH_PREFIX: string;
    static INSTANCE: string;
    static REDIRECT: string;
    static REDIRECT_WITH_QUERY: string;
    static MODEL: string;
    static init(state: Map<string, any>): void;
    static action_update(state: Map<string, any>): Promise<void>;
    static action_delete(state: Map<string, any>): Promise<void>;
    static after(state: Map<string, any>): Promise<void>;
}
