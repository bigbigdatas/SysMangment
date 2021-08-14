const express = require('express')
const swig = require('swig')
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const Cookies = require("cookies")
const User = require('./models/User')

// 创建app对象
const app = new express()

app.use('/public', express.static(__dirname + '/public'))

// 配置模板引擎
app.engine('html', swig.renderFile)

app.set('views', './views')

app.set('view engine', 'html')

swig.setDefaults({cache: false})

// 中间件 处理post提交数据为json格式，必须在路由之前
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// 设置cookie
app.use(function (req, res, next) {
  req.cookies = new Cookies(req, res)
  var userInfo = {}
  if (req.cookies.get('userInfo')) {
    try{
      req.userInfo = JSON.parse(req.cookies.get("userInfo"));
      User.findById(req.userInfo._id).then(function (userInfo) {
        req.userInfo.isAdmin = Boolean(userInfo.isAdmin)
      })
    }catch(e){
    	console.log(e)
    }
  }
  next()
})

// 根据不同的功能划分模块
app.use('/admin', require('./routers/admin'))
app.use('/api', require('./routers/api'))
app.use('/', require('./routers/main'))

mongoose.connect("mongodb://127.0.0.1:27017/blog", error => {
  if (error) {
    console.log("数据库连接失败：" + error)
  } else {
    console.log("数据库连接成功。")
    // 监听http请求
    app.listen(8048)
    console.log('Server running at: http://localhost:8048')
  }
});


