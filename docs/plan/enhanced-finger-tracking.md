# Enhanced Finger Tracking Plan

## Summary / 概要

English restatement: You want HandFlux to recognize more hand states: when one finger is extended, track that finger; when no fingers are extended, track the fist; when the fist opens, track all visible fingers and apply effects to every fingertip.

当前实现只从 `indexTip` 发射粒子，握拳只会吸引已有粒子。计划改成按“激活追踪点”发射效果：握拳追踪拳头中心，单指追踪对应指尖，张开或多指伸出时追踪所有伸出的指尖。

## Key Changes / 关键改动

- 在手势类型中增加手指追踪数据：
  - 新增 `TrackedFinger` 类型，包含 `kind`、`tip`、`speed`。
  - `HandSnapshot` 增加 `trackedPoints`，用于统一表示当前应该产生效果的位置。
  - 保留 `indexTip`、`palmCenter`，避免大范围重写现有代码。
- 更新 `gestureDetector`：
  - 五指都参与识别：thumb、index、middle、ring、pinky。
  - `0` 个伸出手指时识别为 `fist`，`trackedPoints = [palmCenter]`。
  - `1` 个伸出手指时识别为 `single-finger` 或沿用现有 `index-point` 命名策略，但实际追踪该伸出的手指。
  - `2-5` 个伸出手指时识别为 `open-palm` 或 `multi-finger`，`trackedPoints` 包含所有伸出的指尖。
  - 每个追踪点用上一帧同名点计算自己的速度，避免所有指尖共用食指速度。
- 更新视觉场景：
  - `scene.ts` 不再固定调用 `particles.emitFromPoint(hand.indexTip, hand.speed)`。
  - 改为遍历 `hand.trackedPoints`，每个点都调用粒子发射。
  - 握拳时仍保留 `particles.attractTo(orb.getPosition(), delta)`，同时从拳头中心发射少量效果。
  - 张开手掌首次出现时继续触发 shockwave。
- 更新粒子系统：
  - 调整 `ParticleSystem` 的上一位置缓存，从单个 `lastPoint` 改成按追踪点 id 保存，防止多指同时发射时互相污染移动方向。
  - 控制总粒子上限，五指同时发射时不让粒子数量暴涨。
- 更新 HUD 和文档：
  - Debug HUD 显示当前 gesture 和 active points 数量。
  - README 的 Features 和 Recognized Gestures 改为说明：拳头、单指、多指/张开手掌都会产生对应追踪效果。
- Commit discipline:
  - 第一个核心提交：手势数据结构和检测逻辑，提交信息 `feat: track active hand points`。
  - 第二个核心提交：视觉粒子多点发射和 HUD/README 更新，提交信息 `feat: emit effects from tracked fingers`。

## Test Plan / 测试计划

- 运行 `npm run lint`。
- 运行 `npm run build`。
- 手动验证浏览器摄像头交互：
  - 握拳：效果跟随拳头中心，粒子仍向能量球收拢。
  - 只伸食指：效果跟随食指。
  - 只伸中指或其他单指：效果跟随对应手指，而不是固定食指。
  - 张开多指：每个伸出的指尖都有粒子效果。
  - 从拳头散开：触发张开手掌的冲击波，并同时显示多指效果。

## Assumptions / 默认假设

- “一个手指”包含拇指，五根手指都可以成为追踪目标。
- “无手指”使用拳头中心，也就是当前 `palmCenter`，作为追踪点。
- 仍然只支持单手追踪，不在本次计划里增加双手识别。
- 不新增第三方库；继续使用 MediaPipe 当前 21 个 hand landmarks。
