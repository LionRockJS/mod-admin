/***
 override ControllerAccount in @lionrockjs/mod-auth
***/
import ControllerAdmin from '../ControllerAdmin.mjs';
export default class ControllerAccount extends ControllerAdmin {
    static mixins: any[];
    constructor(request: any);
    action_index(): Promise<void>;
    action_change_person(): Promise<void>;
    action_change_person_post(): Promise<void>;
}
