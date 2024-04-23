import fs from 'node:fs';
import { Central } from '@lionrockjs/central';
import { Controller, ControllerMixin } from '@lionrockjs/mvc';

export default class ActionLogger extends ControllerMixin{
    static LOG_ACTIONS = 'logActions';

    static init(state){
      if(!state.get(this.LOG_ACTIONS)) state.set(this.LOG_ACTIONS, new Set(['update', 'edit', 'delete']));
    }

    //log need to read session, it create in mixinSession.before()
    static async before(state){
      const logActions = state.get(this.LOG_ACTIONS);
      const request = state.get(Controller.STATE_REQUEST);
      const action  = state.get(Controller.STATE_ACTION);

      if(logActions.has(action)){
        const now = new Date();
        const YYYY  = now.getFullYear();
        const MONTH = String(now.getMonth() + 1).padStart(2, '0');
        const DATE  = String( now.getDate() ).padStart(2, '0');
        const HH    = String( now.getHours() ).padStart(2,'0');
        const MM    = String( now.getMinutes() ).padStart(2,'0');
        const SS    = String( now.getSeconds() ).padStart(2, '0');

        const logDir = `${Central.config.admin.logPath}/${YYYY}/${MONTH}/`;
        const file   = `${logDir}/${DATE}.admin.log`;

        //create folder if not exist
        if(!fs.existsSync(logDir)){
          fs.mkdirSync(logDir, { recursive: true }, err => {if (err) throw err;});
        }

        const session    = request.session || {};
        const user       = session.logged_in ? session.user_id || session.user_role : 'not logged in';

        const data = {
          time       : `${HH}:${MM}:${SS}`,
          user       : user,
          params     : request.params,
          ip         : request.ip,
          ips        : request.ips,
        };

        fs.appendFile(file, `${JSON.stringify(data)}\n` , err => {if (err) throw err;});
      }
    }
}

module.exports  = ActionLogger;
