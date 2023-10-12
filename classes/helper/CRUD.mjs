import { RouteList } from '@lionrockjs/central';

export default class HelperCRUD {
  static add(partialPath, controller, prefix = 'admin', weight = 5) {
    RouteList.add(`/${prefix}/${partialPath}/new`, controller, 'create', 'GET', weight);
    RouteList.add(`/${prefix}/${partialPath}/new`, controller, 'update', 'POST', weight);
    RouteList.add(`/${prefix}/${partialPath}/:id`, controller, 'update', 'POST', weight);
    RouteList.add(`/${prefix}/${partialPath}/delete/:id`, controller, 'delete', 'GET', weight);
    // restful
    RouteList.add(`/${prefix}/${partialPath}/export`, controller, 'export', 'GET', weight);
    RouteList.add(`/${prefix}/${partialPath}/export.csv`, controller, 'export', 'GET', weight);
    RouteList.add(`/${prefix}/${partialPath}/import`, controller, 'import', 'GET', weight);
    RouteList.add(`/${prefix}/${partialPath}/import`, controller, 'import_post', 'POST', weight);

    RouteList.add(`/${prefix}/${partialPath}`, controller, 'index', 'GET', weight);
    RouteList.add(`/${prefix}/${partialPath}`, controller, 'update', 'POST', weight);

    RouteList.add(`/${prefix}/${partialPath}/:id`, controller, 'read', 'GET', weight);
    RouteList.add(`/${prefix}/${partialPath}/edit/:id`, controller, 'edit', 'GET', weight);
    RouteList.add(`/${prefix}/${partialPath}/:id`, controller, 'update', 'PUT', weight);
    RouteList.add(`/${prefix}/${partialPath}/:id`, controller, 'delete', 'DELETE', weight);

    RouteList.add(`/${prefix}/b/:entity-:entityID/${partialPath}/new`, controller, 'create');
    RouteList.add(`/${prefix}/b/:entity-:entityID/${partialPath}/:id`, controller, 'read');
    RouteList.add(`/${prefix}/b/:entity-:entityID/${partialPath}/edit/:id`, controller, 'edit');
    RouteList.add(`/${prefix}/b/:entity-:entityID/${partialPath}/new`, controller, 'update', 'POST');
    RouteList.add(`/${prefix}/b/:entity-:entityID/${partialPath}/:id`, controller, 'update', 'POST');
    RouteList.add(`/${prefix}/b/:entity-:entityID/${partialPath}/delete/:id`, controller, 'delete');
  }
}