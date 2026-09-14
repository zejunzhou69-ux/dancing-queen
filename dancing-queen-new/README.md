# Dancing Queen · 念珠手作 v2.2

Handcrafted Chinese incense bead bracelets.

## 📌 版本 v2.2

- ✅ 统一产品目录（products.js）
- ✅ 全站购物车 + 结算（localStorage）
- ✅ 移动端汉堡菜单
- ✅ SEO 优化（title / description / OG tags / favicon）
- ✅ 404 页面 + robots.txt + sitemap.xml
- ✅ 产品详情页数量选择 + 加入购物车

## 📞 联系方式

- WeChat: abc568347492
- WhatsApp: +86 13738901892

## 🌐 部署状态

- GitHub: https://github.com/zejunzhou69-ux/dancing-queen
- Vercel: https://dancing-queen.vercel.app

## 📁 文件结构

```
dancing-queen-new/
├── index.html              首页
├── incense.html            合香珠系列页
├── products.html           全部产品页
├── product-detail.html     产品详情页（含购物车/结算）
├── 404.html                404 页面
├── styles.css              样式文件
├── assets/js/
│   ├── products.js         全站产品目录（唯一数据源）
│   └── site.js             购物车/结算/菜单/Toast
├── images/incense/         产品图片和视频
├── images/payments/        支付二维码
├── images/craft/           工艺图
├── robots.txt              搜索引擎机器人
├── sitemap.xml             站点地图
└── README.md               项目说明
```

## 🔧 修改指南

### 修改价格 / 产品名
编辑 `assets/js/products.js`，找到对应产品 ID，改 `price` 或 `name`。

### 添加新产品
在 `assets/js/products.js` 的 `DQ_PRODUCTS` 对象中新增一条，例如：
```js
'new-product': {
  id: 'new-product',
  name: 'Product Name',
  nameZh: '产品名称',
  price: 50,
  badge: '',
  tagline: 'Material · 材质',
  materials: 'Full materials list',
  desc: 'Description here.',
  thumb: 'images/incense/new-1.jpg',
  images: ['images/incense/new-1.jpg'],
  imgDescriptions: ['Main shot'],
  videos: []
}
```
然后在 `DQ_PRODUCT_ORDER` 里加入 `'new-product'`。

### 修改支付方式
把收款码图片放到 `images/payments/`，`site.js` 里的 checkout 弹窗会自动显示。

---

© 2025 Dancing Queen Atelier
