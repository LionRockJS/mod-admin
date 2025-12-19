import { Controller } from '@lionrockjs/mvc';
export default class ControllerHome extends Controller {
    static mixins: any[];
    constructor(request: any);
    action_index(): Promise<void>;
}
