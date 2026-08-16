# Excalidraw Whiteboard Script Skill

Turn Chinese口播稿、长文、课程/产品方法论、AI 工作流说明 into importable Excalidraw whiteboard storyboard files.

This skill is designed for short-video whiteboard content: large handwriting-style text, red underlines, cards, arrows, tables, workflows, flywheels, and clean multi-screen layouts that are easy to record.

## What It Does

- Converts a spoken script into a multi-screen Excalidraw storyboard.
- Keeps each screen focused on one idea.
- Uses large readable text instead of dense pasted paragraphs.
- Supports common whiteboard layouts:
  - before/after comparison
  - card groups
  - numbered steps
  - linear workflows
  - result tables
  - flywheels
  - closing quote screens
- Includes validation rules to avoid tiny text, overflow, and messy imports.

## Install

Clone this repository into your Codex skills directory:

```bash
mkdir -p ~/.codex/skills
git clone https://github.com/xintu1314/excalidraw-whiteboard-script.git ~/.codex/skills/excalidraw-whiteboard-script
```

Restart Codex so the skill can be discovered.

## When To Use

Use this skill when you want to turn content like this:

```text
帮我把这段口播稿变成 Excalidraw 白板
帮我生成 excalidraw 代码
把这篇 AI 工作流内容画成白板分镜
做成类似清华白也那种白板讲解图
```

into an importable `.excalidraw` file.

## Basic Usage

The skill usually works in two steps:

1. Extract the argument structure from the script.
2. Generate a `.excalidraw` board, then validate text size and layout.

Typical output:

```text
outputs/<topic-slug>/<name>.excalidraw
```

Import the file into [Excalidraw](https://excalidraw.com/).

## Renderer Script

The included renderer converts a structured JSON spec into an Excalidraw file:

```bash
node scripts/render_board_from_spec.mjs spec.json output.excalidraw
```

Example spec:

```json
{
  "title": "AI 外贸获客流程",
  "screens": [
    {
      "title": "外贸获客，AI 已经接管前半段流程",
      "subtitle": "AI 跑重复劳动，人负责判断和成交。",
      "layout": {
        "type": "comparison",
        "left": {
          "title": "过去",
          "body": "翻网页\n填表格\n熬时差"
        },
        "right": {
          "title": "现在",
          "body": "AI 跑流程\n人做决策\n销售促成交"
        },
        "footer": "从手工海捞，变成流程化开发"
      }
    }
  ]
}
```

See [`references/spec-guide.md`](references/spec-guide.md) for all supported layout types.

## Quality Gate

After generating a board, check the file:

```bash
jq -r '.type, (.elements|length), .appState.zoom.value' output.excalidraw
jq -r '[.elements[] | select(.type=="text") | {text,fontSize,width}] | {count:length,minFont:(map(.fontSize)|min),maxFont:(map(.fontSize)|max),longTexts:(map(select((.text|length)>86))|length)}' output.excalidraw
```

Recommended pass criteria:

- `type` is `excalidraw`
- `minFont >= 22`
- `longTexts == 0`
- 5-8 screens for most short videos
- add screens instead of shrinking text

## Design Principles

- One screen, one point.
- Big title, red underline.
- Short cards instead of paragraphs.
- Use arrows and tables to make the logic visible.
- Keep text readable for phone-screen recording.
- Prefer one more screen over cramped layout.

## Repository Structure

```text
excalidraw-whiteboard-script/
├── SKILL.md
├── agents/
│   └── openai.yaml
├── references/
│   └── spec-guide.md
└── scripts/
    └── render_board_from_spec.mjs
```

## License

No license has been added yet. Add one before using this repository as a formal open-source project.
