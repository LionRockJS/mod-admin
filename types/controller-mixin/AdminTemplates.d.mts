import { ControllerMixin } from '@lionrockjs/central';
export default class ControllerMixinAdminTemplates extends ControllerMixin {
    static ADMIN_DATABASE_KEY: string;
    static PATH_PREFIX: string;
    static MODEL: string;
    static PAGE_SIZE: string;
    static TEMPLATES: string;
    static DEFAULT_TEMPLATES: string;
    static init(state: Map<string, any>): void;
    static after(state: Map<string, any>): void;
    static classObject(Model: any): any;
    static listView(state: Map<string, any>, template: string, defaultTemplate: string): Promise<void>;
    static readView(state: Map<string, any>, template: string, defaultTemplate: string): Promise<void>;
    static entitySupport(state: Map<string, any>): Promise<{
        destination: any;
    } | {
        destination?: undefined;
    } | {
        destination: any;
        checkpoint: any;
        entityClass: typeof import("@lionrockjs/central").Model;
        entity: any;
        entityID: any;
    } | {
        destination: string;
        checkpoint?: undefined;
        entityClass: typeof import("@lionrockjs/central").Model;
        entity: any;
        entityID: any;
    }>;
    static modelToTemplateData(state: Map<string, any>): Promise<any>;
    static applyQueryValues(state: Map<string, any>, instance: any): void;
    static getFieldData(instance: any): {
        title: string;
        model: any;
        item: any;
        fields: {
            label: string;
            name: string;
            type: string;
            required: boolean;
            value: any;
        }[];
    };
    static getBelongsTo(state: Map<string, any>, instance: any): Promise<{
        belongsTo?: undefined;
    } | {
        belongsTo: {
            instance: any;
            model: any;
            foreign_key: any;
            items: import("@lionrockjs/central").Model | import("@lionrockjs/central").Model[];
        }[];
    }>;
    static getBelongsToMany(state: Map<string, any>, instance: any): Promise<{
        belongsToMany?: undefined;
    } | {
        belongsToMany: {
            model: any;
            values: any;
            items: import("@lionrockjs/central").Model | import("@lionrockjs/central").Model[];
        }[];
    }>;
    static getHasMany(state: Map<string, any>, instance: any): Promise<{
        hasMany?: undefined;
    } | {
        hasMany: any[];
    }>;
    static getDomain(state: Map<string, any>): {
        domain: any;
    };
    static getFormDestination(state: Map<string, any>): {
        destination: any;
    } | {
        destination?: undefined;
    };
    static getFieldValue(scope: string, fieldName: string, fieldType?: string, value?: any): {
        label: string;
        name: string;
        type: string;
        required: boolean;
        value: any;
    };
    static before(state: Map<string, any>): Promise<void>;
    static action_index(state: Map<string, any>): Promise<void>;
    static action_read(state: Map<string, any>): Promise<void>;
    static action_edit(state: Map<string, any>): Promise<void>;
    static action_create(state: Map<string, any>): Promise<void>;
    static action_delete(state: Map<string, any>): Promise<void>;
}
