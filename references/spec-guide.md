# Spec Guide

Use this reference when building a board with `scripts/render_board_from_spec.mjs`.

## Minimal Spec

```json
{
  "title": "AI外贸获客流程",
  "screens": [
    {
      "title": "外贸获客，AI 已经接管前半段流程",
      "subtitle": "AI 跑重复劳动，人负责判断和成交。",
      "layout": {
        "type": "comparison",
        "left": {"title": "过去", "body": "翻网页\n填表格\n熬时差"},
        "right": {"title": "现在", "body": "AI 跑流程\n人做决策\n销售促成交"},
        "footer": "从手工海捞，变成流程化开发"
      }
    }
  ]
}
```

## Layout Types

### comparison

Use for old/new, wrong/right, before/after.

```json
{
  "type": "comparison",
  "left": {"title": "过去", "body": "靠感觉\n追爆款\n硬憋选题"},
  "right": {"title": "现在", "body": "数据找机会\nSkill 跑流程\n持续复盘"},
  "footer": "不是追内容，而是搭系统"
}
```

### cards

Use for 3-5 parallel points.

```json
{
  "type": "cards",
  "cards": [
    {"title": "关键词抓取", "body": "输入关键词\n看什么在起量"},
    {"title": "灵感采集", "body": "评论、会议、路上\n想到就收进来"},
    {"title": "历史内容库", "body": "以前发过什么\n哪些结构表现好"}
  ],
  "footer": "找选题，不再临时硬想"
}
```

### steps

Use for numbered workflows. Keep body short.

```json
{
  "type": "steps",
  "columns": 3,
  "steps": [
    {"title": "确定产品与市场", "body": "产品 / 国家 / 客户类型"},
    {"title": "市场调研", "body": "需求 / 竞品 / 渠道"},
    {"title": "客户背调", "body": "官网 / 社媒 / 采购偏好"}
  ],
  "footer": "让 AI 先跑苦力活，人再做判断"
}
```

### flow

Use for linear pipelines.

```json
{
  "type": "flow",
  "items": ["识别询盘", "补齐参数", "匹配产品", "核算成本", "生成报价", "人工审核", "CRM 跟进"],
  "footer": "小工具可以逐步长成企业 AI 系统"
}
```

### table

Use to fake a visible result table.

```json
{
  "type": "table",
  "headers": ["公司名", "官网", "客户类型", "匹配理由", "评级"],
  "rows": [
    ["客户A", "website", "distributor", "产品匹配", "A"],
    ["客户B", "website", "importer", "市场匹配", "B"]
  ],
  "footer": "表格里不只有邮箱，而是已初筛的客户线索"
}
```

### cycle

Use for flywheels and loops.

```json
{
  "type": "cycle",
  "center": "内容增长\n飞轮",
  "items": ["发现机会", "拆解爆款", "研究对标", "生成内容", "沉淀产品", "复盘优化"],
  "footer": "下一次不是重新开始，而是站在经验上迭代"
}
```

### quote

Use for final thesis or closing.

```json
{
  "type": "quote",
  "lines": [
    "未来拉开差距的，不是会不会用 AI 聊天",
    "而是能不能把 AI 变成可执行的业务流程"
  ],
  "footer": "这才是 AI 落地真正有价值的地方"
}
```

## Screen Count

- 1 minute口播: 5-6 screens
- 2-3 minute口播: 7-9 screens
- dense SOP: 8-10 screens

Prefer adding screens over shrinking text.
