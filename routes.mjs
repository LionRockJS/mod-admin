import { RouteList } from '@lionrockjs/central';
import RouteCRUD from './classes/helper/CRUD.mjs';

RouteList.add('/admin', 'controller/admin/Home');
RouteList.add('/register', 'controller/Setup', 'setup_post', 'POST', 10);
RouteList.add('/admin/users/create-user', 'controller/admin/User', 'create_post', 'POST');
RouteCRUD.add('users', 'controller/admin/User');