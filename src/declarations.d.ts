declare module 'camelize' {
  export default function camelize(str: string): string;
}

declare module 'decamelize' {
  export default function decamelize(str: string, options?: any): string;
}

declare module 'pluralize' {
  export function singular(word: string): string;
}

declare module 'csv-parse/sync' {
  export function parse(input: string | Buffer, options?: any): any[];
}

declare module '@lionrockjs/central' {
  export class Central {
    static config: any;
    static EXE_PATH: string;
    static log(message: any): void;
  }
  export class Controller {
    static STATE_REQUEST: string;
    static STATE_PARAMS: string;
    static STATE_QUERY: string;
    static STATE_CHECKPOINT: string;
    static STATE_CLIENT: string;
    static STATE_ACTION: string;
    static STATE_CLIENT_IP: string;
    static STATE_HEADERS: string;
    static STATE_BODY: string;
    static STATE_HOSTNAME: string;
    static mixins: any[];
    constructor(request: any, state: Map<string, any>);
    state: Map<string, any>;
  }
  export class ControllerMixin {
  }
  export class ControllerMixinDatabase {
    static DATABASES: string;
    static DATABASE_MAP: string;
  }
  export class ControllerMixinMime {
  }
  export class ControllerMixinView {
    static LAYOUT_FILE: string;
    static TEMPLATE: string;
    static LAYOUT: string;
    static setTemplate(state: Map<string, any>, template: string, data: any, defaultTemplate?: string): void;
    static setLayout(state: Map<string, any>, view: any): void;
  }
  export class ControllerMixinViewData {
  }
  export class ControllerMixinActionLogger {
    static LOG_ACTIONS: string;
  }
  export class ORM {
    static import(name: string): Promise<any>;
    static create(model: any, options: any): any;
    static readBy(model: any, field: string, value: any[], options: any): Promise<any[]>;
    static readAll(model: any, options: any): Promise<any[]>;
    static factory(model: any, id: any, options: any): Promise<any>;
  }
  export class View {
    constructor(path: string, data: any);
    data: any;
  }
}

declare module '@lionrockjs/mixin-form' {
  export class ControllerMixinMultipartForm {
    static POST_DATA: string;
    static REQUEST_DATA: string;
  }
}

declare module '@lionrockjs/mixin-orm' {
  export class ControllerMixinORMRead {
    static MODEL: string;
    static DATABASE_KEY: string;
    static ORM_OPTIONS: string;
    static COUNT: string;
    static INSTANCES: string;
    static INSTANCE: string;
    static action_index(state: Map<string, any>): Promise<void>;
  }
  export class ControllerMixinORMWrite {
    static DATABASE_KEY: string;
  }
  export class ControllerMixinORMInput {
  }
  export class ControllerMixinORMDelete {
    static DELETE_SIGN: string;
  }
}

declare module '@lionrockjs/mod-auth' {
  export class ControllerMixinLoginRequire {
    static REJECT_LANDING: string;
    static ALLOW_ROLES: string;
  }
  export class ModelUser {
  }
  export class ModelLogin {
  }
}

declare module '@lionrockjs/mixin-session' {
  export class ControllerMixinSession {
  }
}

declare module '@lionrockjs/router' {
  export class RouteList {
    static add(path: string, controller: any, action: string, method?: string, weight?: number): void;
  }
}
