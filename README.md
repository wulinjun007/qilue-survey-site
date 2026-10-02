# 重庆奇略测绘官网（评审预览版）

实现 [PRD V1.0](../../../Desktop/重庆奇略测绘_网站PRD_V1.0.md) 的纯静态官网，设计语言采用 LightVela 逆向提取规范（见 `design-system-extraction-2026-10/sites/07-lightvela/`）。

- 正式域：https://qilue-survey-site.netlify.app
- 状态：**评审预览版 V0.9** —— 表单为演示模式（不保存不发送），企业信息/资质/电话待核验项已在页面显著标注

## 页面结构（PRD §04）

| 路由 | 内容 |
|---|---|
| `/` | 首屏 + 核心服务 + 成果示意 + 合作流程 + 身份依据 + FAQ |
| `/services/terrain-mapping.html` | 原始地貌／地形图测绘（六问模板） |
| `/services/aerial-data.html` | 航测内业三维采集／数据处理（六问模板） |
| `/work.html` | 成果示意（显著标注非项目案例） |
| `/about.html` | 公司身份 / 业务方向 / 资质说明（未核验不展示） |
| `/contact.html` | 电话（待核验标注）+ 咨询表单（demo） |
| `/privacy.html` | 隐私说明（预览稿，如实说明未接入后端） |
| `/404.html` | 错误页 |

## 维护方式（内容配置化，PRD FR-004/FR-010）

- 联系信息唯一来源：`assets/js/config.js`（电话/地址/表单模式，含 `verified` 标记）
- 页面源文件：`pages/*.html` + `partials/`，改完执行 `node tools/build.js` 重新组装
- 部署：`netlify deploy --prod --dir . --site <SITE_ID>`

## 上线前待办（PRD §15.3，页面已留标注）

1. 核验企业信息 → 更新 `config.js` 的 `verified: true`
2. 确认首批服务与资质范围 → 更新服务页
3. 接入受控表单后端（持久化+幂等+通知，PRD §8）→ `config.js` 的 `formMode` 改为 `live` 并实现提交逻辑
4. 核验公开电话 / 备案手续（NFR-004）
