const jwt = require('jsonwebtoken');
require('dotenv').config();

const config = require('../config');
const User = require('../models/user');
const uuid = require('uuid/v4');

// The authentication controller.
let authController = {
  // user login
  signin: async (req, res) => {
    try {
      if (!req.body.id || !req.body.password) {
        res.status(400).json({ message: 'Введите пожалуйста e-mail и пароль', code: 400 });
        return;
      }
      const email = req.body.id;
      const password = req.body.password;

      const user = await User.findOne({ where: { email } })

      if (!user) {
        res.status(404).json({ message: 'Вы ввели неправильно e-mail или пароль', code: 404 });
        return;
      }

      await user.comparePasswords(password, async function (error, isMatch) {
        try {
          if (isMatch && !error) {

            const refresh_token = uuid();
            const currentDate = new Date();
            const expires_in = currentDate.setSeconds(currentDate.getSeconds() + process.env.REFRESH_TOKEN_EXPIRES_IN);

            const session = await user.getSession();

            if (session) {
              await session.destroy();
            }

            await user.createSession({
              refresh_token: refresh_token,
              expires_in: expires_in
            })

            const bearer_token = jwt.sign(
              { email: user.email },
              config.keys.secret,
              { expiresIn: parseInt(process.env.BEARER_TOKEN_EXPIRES_IN) }
            );

            res.status(200).json({ message: 'Здравствуйте, вы успешно авторизовались', code: 200, bearer_token, refresh_token });
          } else {
            res.status(400).json({ message: 'Вы ввели неправильно логин или пароль', code: 400 });
          }
        } catch (error) {
          console.log(error);
        }
      })
    } catch (error) {
      console.log(error)
      if (error.code == 403) {
        res.status(403).json({ message: error.message, code: 403 });
        return;
      }
      res.status(500).json({ message: 'Ошибка на сервере', code: 500 });
    }
  },
  // user registration
  signup: async (req, res) => {
    try {
      if (!req.body.id) {
        res.status(400).json({ message: 'Введите пожалуйста e-mail', code: 400 });
        return;
      }
      if (!req.body.password) {
        res.status(400).json({ message: 'Введите пожалуйста пароль', code: 400 });
        return;
      }

      const user = await User.create({
        email: req.body.id,
        password: req.body.password
      })

      const bearer_token = jwt.sign(
        { email: req.body.id },
        config.keys.secret,
        { expiresIn: parseInt(process.env.BEARER_TOKEN_EXPIRES_IN) }
      );

      const refresh_token = uuid();
      const currentDate = new Date();
      const expires_in = currentDate.setSeconds(currentDate.getSeconds() + process.env.REFRESH_TOKEN_EXPIRES_IN);

      await user.createSession({
        refresh_token: refresh_token,
        expires_in: expires_in
      })

      res.status(201).json({ message: 'Новый пользователь успешно зарегистрирован', code: 201, bearer_token, refresh_token });
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Ошибка на сервере', code: 500 });
    }
  },
  // refresh tokens
  newToken: async (req, res) => {
    try {
      if (!req.body.refresh_token) {
        res.status(400).json({ message: 'Вы не передали необходимые параметры', code: 400 });
        return;
      }

      const user = await User.findOne({ where: { email: req.user.email } })

      if (!user) {
        res.status(401).json({ message: 'Ошибка авторизации', code: 401 });
        return;
      }

      const session = await user.getSession();
      if (!session) {
        res.status(401).json({ message: 'Ошибка авторизации', code: 401 });
        return;
      }
      await session.destroy();

      if (session.refresh_token != req.body.refresh_token) {
        res.status(401).json({ message: 'Ошибка авторизации', code: 401 });
        return;
      }

      const currentDate = new Date();
      if (currentDate.getSeconds() > session.expires_in) {
        res.status(401).json({ message: 'Ошибка авторизации', code: 401 });
        return;
      }

      const refresh_token = uuid();
      const expires_in = currentDate.setSeconds(currentDate.getSeconds() + process.env.REFRESH_TOKEN_EXPIRES_IN);

      await user.createSession({
        refresh_token: refresh_token,
        expires_in: expires_in
      })

      const bearer_token = jwt.sign(
        { email: user.email },
        config.keys.secret,
        { expiresIn: parseInt(process.env.BEARER_TOKEN_EXPIRES_IN) }
      );

      res.status(200).json({ bearer_token, refresh_token });
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Ошибка на сервере', code: 500 });
    }
  },
  // get user id
  info: async (req, res) => {
    try {
      const user = await User.findOne({
        where: {
          email: req.user.email
        },
        attributes: ['id']
      });

      res.status(200).json({ id: user.id });
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Ошибка на сервере', code: 500 });
    }
  },
  // user logout
  logout: async (req, res) => {
    try {
      const user = await User.findOne({
        where: {
          email: req.user.email
        }
      });

      const bearer_token = jwt.sign(
        { email: user.email },
        config.keys.secret,
        { expiresIn: parseInt(process.env.BEARER_TOKEN_EXPIRES_IN) }
      );

      res.status(200).json({ bearer_token });
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Ошибка на сервере', code: 500 });
    }
  },
};

module.exports = authController;