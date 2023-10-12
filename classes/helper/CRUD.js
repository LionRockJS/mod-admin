const { RouteList } = require('@kohanajs/mod-route');
const { HTTP_METHODS } = require('@kohanajs/constants');

class HelperCRUD {
  static add(partialPath, controller, prefix = 'admin', weight = 5) {
    RouteList.add(`/${prefix}/${partialPath}/new`, controller, 'create', HTTP_METHODS.GET, weight);
    RouteList.add(`/${prefix}/${partialPath}/new`, controller, 'update', HTTP_METHODS.POST, weight);
    RouteList.add(`/${prefix}/${partialPath}/:id`, controller, 'update', HTTP_METHODS.POST, weight);
    RouteList.add(`/${prefix}/${partialPath}/delete/:id`, controller, 'delete', HTTP_METHODS.GET, weight);
    // restful
    RouteList.add(`/${prefix}/${partialPath}/export`, controller, 'export', HTTP_METHODS.GET, weight);
    RouteList.add(`/${prefix}/${partialPath}/export.csv`, controller, 'export', HTTP_METHODS.GET, weight);
    RouteList.add(`/${prefix}/${partialPath}/import`, controller, 'import', HTTP_METHODS.GET, weight);
    RouteList.add(`/${prefix}/${partialPath}/import`, controller, 'import_post', HTTP_METHODS.POST, weight);

    RouteList.add(`/${prefix}/${partialPath}`, controller, 'index', HTTP_METHODS.GET, weight);
    RouteList.add(`/${prefix}/${partialPath}`, controller, 'update', HTTP_METHODS.POST, weight);

    RouteList.add(`/${prefix}/${partialPath}/:id`, controller, 'read', HTTP_METHODS.GET, weight);
    RouteList.add(`/${prefix}/${partialPath}/edit/:id`, controller, 'edit', HTTP_METHODS.GET, weight);
    RouteList.add(`/${prefix}/${partialPath}/:id`, controller, 'update', HTTP_METHODS.PUT, weight);
    RouteList.add(`/${prefix}/${partialPath}/:id`, controller, 'delete', HTTP_METHODS.DELETE, weight);

    RouteList.add(`/${prefix}/b/:entity-:entityID/${partialPath}/new`, controller, 'create');
    RouteList.add(`/${prefix}/b/:entity-:entityID/${partialPath}/:id`, controller, 'read');
    RouteList.add(`/${prefix}/b/:entity-:entityID/${partialPath}/edit/:id`, controller, 'edit');
    RouteList.add(`/${prefix}/b/:entity-:entityID/${partialPath}/new`, controller, 'update', HTTP_METHODS.POST);
    RouteList.add(`/${prefix}/b/:entity-:entityID/${partialPath}/:id`, controller, 'update', HTTP_METHODS.POST);
    RouteList.add(`/${prefix}/b/:entity-:entityID/${partialPath}/delete/:id`, controller, 'delete');
  }
}

module.exports = HelperCRUD;
