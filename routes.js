const { RouteList } = require('@kohanajs/mod-route');
const RouteCRUD = require('./classes/helper/CRUD');

RouteList.add('/admin', 'controller/admin/Home');
RouteList.add('/register', 'controller/Setup', 'setup_post', 'POST', 10);
RouteList.add('/admin/users/create-user', 'controller/admin/User', 'create_post', 'POST');
RouteCRUD.add('users', 'controller/admin/User');