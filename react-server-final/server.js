// 连接数据库

const express = require('express');
const cookieParser = require('cookie-parser');
const md5 = require('blueimp-md5');
const {
  resolve
} = require('path');
// 声明使用路由器中间件
require('./db');
const router = require('./routers');
const verify = require('./middleware/verify');
const {
  SERVER_CONFIG
} = require('./config');

const Users = require('./models/users');
const Roles = require('./models/roles');

const app = express();

// 声明使用静态中间件，此时public中所有资源外面可以直接访问
// app.use(express.static('public'));
// 声明使用解析post请求的中间件
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json({}));
// 声明使用解析cookie数据的中间件
app.use(cookieParser());

/*const paths = ['/', '/category', '/product', '/user', '/role', '/user', '/charts/bar', '/charts/line', '/charts/pie'];
app.use((req, res, next) => {
  // 请求地址
  const { url } = req;
  // 处理页面的api请求
  if (url.startsWith('/api')) return next();
  // 处理路由请求
  if (paths.includes(url)) return res.sendFile(resolve(__dirname, 'public/index.html'));
  // 处理其他静态资源请求
  res.sendFile(resolve(__dirname, 'public/' + url));
});*/

// 设定CORS跨域
app.use((req, res, next) => {
  // 设置响应头
  res.set('Access-Control-Allow-Origin', '*');
  // OPTIONS 预检请求，当请求方式不是get和post / 请求头包含非默认参数
  // 预检请求作用：检查当前请求是否允许跨域
  res.set('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'content-type, authorization, accept');
  res.set('Access-Control-Max-Age', 86400);
  // 快速返回预检请求响应
  if (req.method.toLowerCase() === 'options') {
    // 命中了预检请求
    return res.end();
  }
  next();
});


// 权限验证
app.use(verify);
// 应用路由器
app.use(router);

app.listen(SERVER_CONFIG.port, (err) => {
  if (err) {
    console.log('服务器启动失败', err);
  } else {
    console.log(`服务器启动成功, 请访问: http://localhost:${SERVER_CONFIG.port}`)
  }
});
// 初始化默认超级管理员用户: admin/admin
Users.findOne({
  username: 'admin'
}).then(async (user) => {
  if (!user) {
    try {
      // 创建权限;
      const role = await Roles.create({
        name: '管理员',
        authName: 'root',
        authTime: Date.now(),
        createTime: Date.now(),
        menus: [
          "/",
          "/products",
          "/category",
          "/product",
          "/product/saveupdate",
          "/product/detail",
          "/user",
          "/role",
          "/charts",
          "/charts/bar",
          "/charts/line",
          "/charts/pie"
        ],
      });
      // 创建用户
      const user = await Users.create({
        username: 'admin',
        password: md5('admin'),
        roleId: role._id
      });
      console.log(`创建超级管理员用户成功~  用户名: admin 密码: admin`);
    } catch (e) {
      console.log('创建超级管理员用户失败~', e);
    }
  }
});