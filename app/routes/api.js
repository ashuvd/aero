const router              = require('express').Router();
const AuthController      = require('../controllers/authController');
const FileController      = require('../controllers/fileController');

const APIRoutes = function(passport) {

  const auth = (req, res, next) => {
    return passport.authenticate('jwt', function(err, user){
      if (err) {
        return res.status(500).json({ message : 'Ошибка на сервере', code : 500 });
      }
      if (!user) {
        return res.status(401).json({ message : 'Ошибка авторизации', code : 401 });
      }
      req.user = user;
      next();
    })(req, res, next)
  }

  router.post('/signup', AuthController.signup);
  router.post('/signin', AuthController.signin);
  router.post('/signin/new_token', function(req, res, next) { auth(req, res, next) }, AuthController.newToken);
  router.get('/info', function(req, res, next) { auth(req, res, next) }, AuthController.info);
  router.get('/logout', function(req, res, next) { auth(req, res, next) }, AuthController.logout);

  router.get('/file/list', function(req, res, next) { auth(req, res, next) }, FileController.getFiles);
  router.get('/file/:id', function(req, res, next) { auth(req, res, next) }, FileController.getFile);
  router.get('/file/download/:id', function(req, res, next) { auth(req, res, next) }, FileController.downloadFile);
  router.post('/file/upload', function(req, res, next) { auth(req, res, next) }, FileController.addFile);
  router.put('/file/update/:id', function(req, res, next) { auth(req, res, next) }, FileController.updateFile);
  router.delete('/file/delete/:id', function(req, res, next) { auth(req, res, next) }, FileController.deleteFile);

  return router;
};

module.exports = APIRoutes;