### 免部署在线免费使用
https://developer.authdog.cn/
免费使用已部署的版本提供技术支持，长期更新和稳定的服务，或赞助也可以购买升级配额

### 交流QQ群
700832789

### 环境
- node.js
- mysql 8
- redis
- pnpm  `npm i -g pnpm`
- 
windows 和 macos 还需要
node-gyp `npm i -g node -gyp`
        
linux 需要
gcc gcc-c++ `sudo yum -y install gcc gcc-c++`

### 生产环境运行
#### 安装依赖
`pnpm i`

#### 配置环境变量
将 .env 复制一份 命名为 .env.prod
配置相关信息

#### 启动
npm run start 
或使用 pm2 `pm2 start npm -- run start`

#### 配置配额
连接到数据库，运行SQL


```
INSERT INTO quota(name, chinaName, maxAppCount, maxUserCount, maxCloudfunCount, maxUserDataCount, maxSalerCOunt, price) VALUES('default', '开源用户', 999999, 9999999, 9999999, 99999999, 999999, 0)
```

### 开发环境运行
#### 安装依赖
`pnpm i`

#### 配置环境变量
将 .env 复制一份 命名为 .env.dev
配置相关信息

#### 启动
npm run start:debug

#### 配置配额
连接到数据库，运行SQL


```
INSERT INTO quota(name, chinaName, maxAppCount, maxUserCount, maxCloudfunCount, maxUserDataCount, maxSalerCOunt, price) VALUES('default', '开源用户', 999999, 9999999, 9999999, 99999999, 999999, 0)
