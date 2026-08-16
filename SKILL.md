---
name: excalidraw-whiteboard-script
description: Convert Chinese口播稿、长文、课程/产品方法论、AI工作流说明 into importable Excalidraw whiteboard storyboard files. Use when the user asks to “变成 Excalidraw / excalidraw代码 / 白板脚本 / 画板分镜 / 导入画板”, especially for short-video whiteboard-style marketing content. Produces multi-screen large-font Excalidraw boards with clear flowcharts, tables, cards, callouts, red underlines, and validation to avoid tiny text, overflow, or messy imports.
---

# Excalidraw Whiteboard Script

## Core Output

Create an importable `.excalidraw` file, not just a text outline. Also create the generator `.mjs` used to produce it when useful for iteration.

Default output path:

```text
/Users/believer/clawd/outputs/<topic-slug>/<descriptive-name>.excalidraw
```

Use `scripts/render_board_from_spec.mjs` when the board can be expressed with standard layouts. For special visual arrangements, write a custom `.mjs` generator using the same sizing and validation rules.

## Workflow

1. Extract the spoken script's argument spine:
   - opening hook
   - old pain / wrong assumption
   - core model or workflow
   - examples or proof
   - human vs AI / before vs after
   - closing belief or CTA
2. Split into 5-8 screens, each screen with one job.
3. Convert paragraphs into short visible labels. Keep口播细节 in the structure, not as long pasted text.
4. Pick layout per screen:
   - `comparison`: before/after, wrong/right, old/new
   - `cards`: 3-5 parallel points
   - `steps`: numbered SOP/workflow
   - `flow`: linear pipeline
   - `table`: concrete output/result preview
   - `cycle`: flywheel/reusable loop
   - `quote`: final thesis/golden sentence
5. Generate `.excalidraw`.
6. Validate with the quality gate commands below.

## Visual Style

Follow the user's recurring whiteboard style:

- 1600 x 900 per screen, vertical stack with 120px gaps.
- White screen, light gray app background.
- Large handwritten-feeling Excalidraw text (`fontFamily: 1`).
- Big black title, red underline, red emphasis boxes.
- Avoid dense paragraphs. Prefer cards, arrows, tables, flow rows, and callouts.
- Use restrained colors: white, black, red accent, light green, light blue, warm yellow, light gray, light purple.
- Make it look like a creator explaining on a whiteboard, not a corporate slide deck.

## Text Rules

These rules matter more than completeness:

- Minimum font size: 22px. Prefer 25-36px for body.
- Title size: about 58-66px.
- No text block longer than ~86 Chinese characters unless manually broken into lines.
- Insert explicit line breaks in mixed Chinese/English labels.
- Never paste a full口播 paragraph onto the board.
- Keep each card to 2-4 short lines.
- For workflow detail, spread across multiple screens instead of shrinking text.

## Content Compression Pattern

Transform:

```text
以前开发客户最耗时间的，不是谈判，也不是报价，而是前面那一大堆杂活：搜关键词、翻网页、找公司、看官网、查联系人、整理表格、写开发信、记录跟进状态。
```

Into:

```text
Screen title: 传统搬砖式找客户，越来越扛不住
Cards:
- 搜关键词：反复换词 / 找入口
- 翻网页：几百个页面 / 慢慢海捞
- 查客户：看官网 / 找联系人
- 整理表格：公司名 / 邮箱 / 状态
- 写开发信：改模板 / 记跟进
Footer: 最耗时间的不是谈判，而是前面那堆杂活
```

## Standard Quality Gate

After generating the board, run:

```bash
jq -r '.type, (.elements|length), .appState.zoom.value' "<file.excalidraw>"
jq -r '[.elements[] | select(.type=="text") | {text,fontSize,width}] | {count:length,minFont:(map(.fontSize)|min),maxFont:(map(.fontSize)|max),longTexts:(map(select((.text|length)>86))|length)}' "<file.excalidraw>"
```

Pass criteria:

- `.type` is `excalidraw`
- `minFont >= 22`
- `longTexts == 0`
- screens are separated and readable

If validation fails, split screens or shorten text. Do not reduce font size to make content fit.

## Using The Renderer

Create a JSON spec and render it:

```bash
node /Users/believer/.codex/skills/excalidraw-whiteboard-script/scripts/render_board_from_spec.mjs spec.json output.excalidraw
```

Read `references/spec-guide.md` when using the renderer for the first time or when choosing layouts.

## Final Response

Return a clickable absolute link to the `.excalidraw` file and briefly state:

- number of screens
- main structure
- validation summary: element count, min font, long text count

Keep the final answer short.
