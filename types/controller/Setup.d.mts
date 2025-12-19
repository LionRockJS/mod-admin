import { Controller } from '@lionrockjs/mvc';
export default class ControllerSetup extends Controller {
    static mixins: any[];
    constructor(request: any);
    action_setup_post(): Promise<void>;
}
