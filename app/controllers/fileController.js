const fs = require('fs');
const path = require('path');
const FileModel = require('../models/file');
const uuid = require('uuid/v4');

let fileController = {
  getFiles: async (req, res) => {
    try {
      const list_size = parseInt(req.query.list_size) || 10;
      const page = parseInt(req.query.page) || 1;

      const files = await FileModel.findAll({
        attributes: ['id', 'name', 'path', 'extension', 'mime_type', 'size', 'date'],
        offset: (page-1) * list_size,
        limit: list_size
      });

      res.status(200).json({ data: files });
    }
    catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Ошибка на сервере', code: 500 });
    }
  },
  getFile: async (req, res) => {
    try {
      if (!req.params.id) {
        res.status(400).json({ message: 'Вы не передали необходимые параметры', code: 400 });
        return;
      }
      const file = await FileModel.findByPk(req.params.id, {
        attributes: ['id', 'name', 'path', 'extension', 'mime_type', 'size', 'date']
      });
      if (!file) {
        res.status(404).json({ message: 'Такого файла не существует', code: 404 });
        return;
      }
      res.status(200).json({ data: file });
    }
    catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Ошибка на сервере', code: 500 });
    }
  },
  downloadFile: async (req, res) => {
    try {
      if (!req.params.id) {
        res.status(400).json({ message: 'Вы не передали необходимые параметры', code: 400 });
        return;
      }
      const file = await FileModel.findByPk(req.params.id, {
        attributes: ['id', 'name', 'path', 'extension', 'mime_type', 'size', 'date']
      });
      if (!file) {
        res.status(404).json({ message: 'Такого файла не существует', code: 404 });
        return;
      }
      const filePath = path.join('public', file.path);
      res.download(filePath);
    }
    catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Ошибка на сервере', code: 500 });
    }
  },
  deleteFile: async (req, res) => {
    try {
      if (!req.params.id) {
        res.status(400).json({ message: 'Вы не передали необходимые параметры', code: 400 });
        return;
      }
      const file = await FileModel.findByPk(req.params.id);
      if (!file) {
        res.status(404).json({ message: 'Такого файла не существует', code: 404 });
        return;
      }
      await file.destroy();

      const filePath = path.join('public', file.path);
      fs.access(filePath, fs.constants.F_OK, function (err) {
        if (!err) {
          fs.unlinkSync(filePath);
        } else {
          console.log(err);
        }
      })
      res.status(200).json({ message: "Файл удален", code: 200, data: file })
    }
    catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Ошибка на сервере', code: 500 });
    }
  },
  addFile: async (req, res) => {
    try {
      if (req.files.length == 0) {
        res.status(400).json({ message: 'Не переданы файлы', code: 400 });
        return;
      }
      let [file] = req.files;

      const fileName = file.originalname;
      const fileMimeType = file.mimetype;
      const fileSizeInBytes = file.size;
      const fileSizeInMegabytes = fileSizeInBytes / 1000000.0;
      const [extension] = file.originalname.indexOf('.') !== -1 ? file.originalname.split('.').reverse() : [''];
      const filePath = path.join('public', 'upload', uuid() + '.' + extension);

      await new Promise(function (resolve, reject) {
        fs.rename(file.path, filePath, function (err) {
          if (err) {
            console.log(err);
            return reject(err);
          }
          resolve();
        })
      })

      fs.access(file.path, fs.constants.F_OK, function (err) {
        if (!err) {
          fs.unlinkSync(file.path);
        } else {
          console.log(err);
        }
      })

      const dir = path.normalize('/' + filePath.substr(filePath.indexOf('upload')));

      file = await FileModel.create({
        name: fileName,
        path: dir,
        extension: extension,
        mime_type: fileMimeType,
        size: fileSizeInMegabytes,
        date: new Date()
      });

      file = file.getData();

      res.status(201).json({ message: "Файл загружен", code: 201, data: file })
    }
    catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Ошибка на сервере', code: 500 });
    }
  },
  updateFile: async (req, res) => {
    try {
      if (req.files.length == 0) {
        res.status(400).json({ message: 'Не переданы файлы', code: 400 });
        return;
      }
      if (!req.params.id) {
        res.status(400).json({ message: 'Вы не передали необходимые параметры', code: 400 });
        return;
      }
      const fileModel = await FileModel.findByPk(req.params.id, {
        attributes: ['id', 'name', 'path', 'extension', 'mime_type', 'size', 'date']
      });
      if (!fileModel) {
        res.status(404).json({ message: 'Такого файла не существует', code: 404 });
        return;
      }
      let [file] = req.files;

      const fileName = file.originalname;
      const fileMimeType = file.mimetype;
      const fileSizeInBytes = file.size;
      const fileSizeInMegabytes = fileSizeInBytes / 1000000.0;
      const [extension] = file.originalname.indexOf('.') !== -1 ? file.originalname.split('.').reverse() : [''];
      const filePath = path.join('public', 'upload', uuid() + '.' + extension);

      await new Promise(function (resolve, reject) {
        fs.rename(file.path, filePath, function (err) {
          if (err) {
            console.log(err);
            return reject(err);
          }
          resolve();
        })
      })

      fs.access(file.path, fs.constants.F_OK, function (err) {
        if (!err) {
          fs.unlinkSync(file.path);
        } else {
          console.log(err);
        }
      })

      const dir = path.normalize('/' + filePath.substr(filePath.indexOf('upload')));

      const filePathForDelete = path.join('public', fileModel.path);
      fs.access(filePathForDelete, fs.constants.F_OK, function (err) {
        if (!err) {
          fs.unlinkSync(filePathForDelete);
        } else {
          console.log(err);
        }
      })

      file = await fileModel.update({
        name: fileName,
        path: dir,
        extension: extension,
        mime_type: fileMimeType,
        size: fileSizeInMegabytes,
        date: new Date()
      });

      file = file.getData();

      res.status(200).json({ message: "Файл обновлен", code: 200, data: file })
    }
    catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Ошибка на сервере', code: 500 });
    }
  },
}

module.exports = fileController;