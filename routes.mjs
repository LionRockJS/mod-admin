import { RouteList } from '@lionrockjs/router';
import RouteCRUD from './classes/helper/CRUD.mjs';

RouteList.add('/admin', 'controller/admin/Home');
RouteList.add('/register', 'controller/Setup', 'setup_post', 'POST', 10);
RouteList.add('/admin/users/create-user', 'controller/admin/User', 'create_post', 'POST');
RouteList.add('/admin/users/change-password/:id', 'controller/admin/User', 'change_password_post', 'POST');
RouteCRUD.add('users', 'controller/admin/User');
RouteCRUD.add('roles', 'controller/admin/UserRole');