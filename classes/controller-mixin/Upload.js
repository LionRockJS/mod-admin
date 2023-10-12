const { ControllerMixin } = require('@kohanajs/core-mvc');
const { KohanaJS } = require('kohanajs');
const {ControllerMixinMultipartForm} = require("@kohanajs/mod-form");
const path = require('path');
const {stat, mkdir, copyFile, unlink} = require('fs').promises;

class ControllerMixinUpload extends ControllerMixin {
  static FILES = 'uploadFiles';
  static UPLOAD_FOLDER = 'uploadFolder'

  static init(state) {
    state.set(this.UPLOAD_FOLDER, path.normalize(`${KohanaJS.EXE_PATH}/../public/media/upload`));
  }

  static async action_upload(state){
    //prepare upload folder
    const today = new Date();
    const uploadFolder = state.get(this.UPLOAD_FOLDER);
    const dateFolder = path.normalize(`${today.getFullYear()}/${today.getMonth()+1}/${today.getDate()}`);
    const uploadDateFolder = path.normalize(uploadFolder+'/'+dateFolder);

    //create folder
    try{
      await stat(uploadDateFolder)
    }catch(err){
      if(err.code === 'ENOENT'){
        await mkdir(uploadDateFolder, {recursive: true});
      }else{
        throw err;
      }
    }

    const $_POST = state.get(ControllerMixinMultipartForm.POST_DATA);
    const files = Array.isArray($_POST['file']) ? $_POST['file'] : [$_POST['file']];

    await Promise.all(
      files.map(async file => {
        const uploadPath = `${dateFolder}/${file.tmpName}-${file.filename}`
        const target = path.normalize(uploadFolder + '/' + uploadPath);
        //move file to media/upload
        await copyFile(file.tmp, target);
        await unlink(file.tmp);
        file.target = target;
        file.uploadPath = uploadPath.replaceAll('\\', '/');
      })
    );

    state.set(this.FILES, files)
  }
}

module.exports = ControllerMixinUpload;
