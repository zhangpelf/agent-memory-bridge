# Agent Memory Bridge 🌉

> **Local-first, zero-token memory bridge connecting OpenCode, Claude Code, and Codex.**  
> 告别多 AI 客户端切换时的上下文失忆：本地化、零额外 Token 消耗的多 Agent 记忆互通桥梁。

---

## ⚠️ 重要声明与免责提示 (Critical Disclaimer)

> **本项目仅供架构设计参考与技术交流学习。**
> 
> 1. 本项目直接读取各 AI 客户端的本地存储与 SQLite 数据库。官方版本升级可能导致表结构（Schema）调整。
> 2. **任何写入操作前必须做好完整备份**。虽然工具内置了快照备份机制，但作者与贡献者**对任何由使用本项目造成的数据库损坏、数据丢失、会话紊乱或系统异常概不承担法律或技术赔偿责任**。
> 3. 详细免责条款请参阅 [DISCLAIMER.md](./DISCLAIMER.md)。

---

## 💡 为什么需要它？ (Why Agent Memory Bridge?)

现代 AI 辅助研发通常组合使用多种工具：
- 用 **OpenCode** 做大型项目的日常代码迭代；
- 用 **Claude Code** 做深度重构与代码推理；
- 用 **Codex / OpenClaw** 跑工作流与自动化任务。

**最大痛点**：每一个工具都是独立的上下文孤岛。在一个工具推演出的结论，换一个工具就要重新灌输一遍。

**本方案核心价值**：
1. **Local-First（本地优先）**：完全基于本机 SQLite 与 JSON 管道，无需搭建云端向量库，不耗费额外 API Token。
2. **双轨互通**：
   - **深入会话**：通过官方安全协议转换为标准 Schema 注入 OpenCode，支持在 OpenCode 原生列表中查看并**直接续聊**。
   - **实时检索**：提供标准 **MCP Server**（Model Context Protocol），任何支持 MCP 的 AI 工具提一句“查一下上次关于 XX 的讨论”，毫秒级自动穿透召回上下文。
3. **规则自愈**：通过软链接与统一的 `AGENTS.md` 注入自动结晶契约，让 Agent 在对话结束时主动存盘。

---

## 🚀 架构总览 (Architecture)

```
[Claude Code] (~/.claude/projects)  ──┐
                                     ├──> [Sync Engine (防呆备份)] ──> [OpenCode Local DB]
[Codex Rollout] (~/.codex/sessions) ──┘                                   │ (只读)
                                                                           ▼
[Claude / Codex / Antigravity / OpenCode] <── [MCP Memory Server] <────────┘
```

---

## 📦 快速上手 (Quick Start)

### 1. 配置 MCP 检索服务
在任意支持 MCP 的工具配置文件（如 `opencode.json` 或 Claude Desktop / Antigravity 的 MCP 设置）中添加：

```json
{
  "mcpServers": {
    "agent-memory-bridge": {
      "command": "node",
      "args": ["/path/to/agent-memory-bridge/src/mcp-server.js"]
    }
  }
}
```

### 2. 执行一次性安全汇流
```bash
# 自动创建本地数据库备份，并安全导入各工具历史对话
node src/sync-engine.js
```

### 3. 配置 Agent 记忆唤醒规则
将 `rules/TEMPLATE_AGENTS.md` 包含的内容加入你工作区的 `AGENTS.md` 或 `CLAUDE.md`，Agent 便会在你提及“上次/之前”时主动调用检索工具。

---

## 📄 开源许可证 (License)

本项目采用 [MIT License](./LICENSE) 协议发布。
