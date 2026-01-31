# 喝水打卡应用 (RUthirsty)

一个简单实用的喝水打卡Cordova应用，帮助你养成健康的喝水习惯。

## 功能特性

- ✅ 一键打卡记录喝水时间
- 📊 显示今日喝水次数统计
- 📝 展示今日所有喝水记录列表
- 💾 数据本地存储，不会丢失
- 🎨 美观的渐变色界面设计
- 📱 完全适配移动设备

## 技术栈

- Apache Cordova
- HTML5 + CSS3 + JavaScript
- LocalStorage 数据持久化

## 项目结构

```
ruthirsty/
├── www/
│   ├── index.html          # 主页面
│   ├── css/
│   │   └── index.css       # 样式文件
│   └── js/
│       └── index.js        # 应用逻辑
├── platforms/              # 平台相关文件
├── config.xml             # Cordova配置文件
└── package.json           # 项目依赖
```

## 安装依赖

确保已安装 Node.js 和 npm，然后安装 Cordova：

```bash
npm install -g cordova
```

## 构建应用

### Android平台

1. 安装 Android Studio 和 Android SDK
2. 设置环境变量：
   ```bash
   export ANDROID_HOME=/path/to/android/sdk
   export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
   ```

3. 构建应用：
   ```bash
   cd ruthirsty
   cordova build android
   ```

4. 运行应用：
   ```bash
   # 在模拟器中运行
   cordova emulate android

   # 在真机上运行（需要连接设备并开启USB调试）
   cordova run android
   ```

### 浏览器测试

在开发过程中，可以在浏览器中测试应用：

```bash
cd ruthirsty
cordova platform add browser
cordova run browser
```

或者直接用浏览器打开 `www/index.html` 文件（需要模拟 deviceready 事件）。

## 使用说明

1. **打卡**：点击"喝水打卡"按钮记录当前时间
2. **查看记录**：在"今日记录"列表中查看所有打卡时间
3. **查看统计**：顶部显示今日打卡总次数
4. **清空记录**：点击"清空今日记录"按钮可以清除当天所有记录

## 数据存储

应用使用 LocalStorage 存储数据，数据保存在设备本地，不会上传到服务器。每天的记录会自动过滤，只显示当天的数据。

## 兼容性

- Android 5.0+
- 支持现代浏览器（Chrome, Firefox, Safari, Edge）

## 开发说明

### 修改样式

编辑 `www/css/index.css` 文件可以自定义应用外观。

### 修改功能

编辑 `www/js/index.js` 文件可以添加或修改功能逻辑。

### 修改配置

编辑 `config.xml` 文件可以修改应用名称、版本号、权限等配置。

## 常见问题

### Q: 数据会丢失吗？
A: 不会。数据保存在设备的 LocalStorage 中，除非清除应用数据或卸载应用。

### Q: 可以查看历史记录吗？
A: 当前版本只显示今日记录。如需查看历史记录，可以修改代码添加此功能。

### Q: 如何修改每日目标？
A: 可以在代码中添加目标设置功能，当前版本只记录次数。

## 许可证

MIT License

## 作者

RUthirsty Team
