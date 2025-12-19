import { ControllerMixin } from '@lionrockjs/central';
export default class ControllerMixinUpload extends ControllerMixin {
    static FILES: string;
    static UPLOAD_FOLDER: string;
    static init(state: Map<string, any>): void;
    static action_upload_post(state: Map<string, any>): Promise<void>;
}
