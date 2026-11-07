# 免责声明 (Disclaimer)

### ⚠️ 重要风险提示 / Critical Risk Warning

1. **实验性质与学习借鉴**：
   本仓库（Agent Memory Bridge）提供的所有脚本、适配器和配置逻辑，仅供**技术研究、架构交流与学习借鉴**使用。
   *This repository is strictly intended for educational, research, and reference purposes.*

2. **数据安全与备份责任**：
   本项目涉及读取各 AI 客户端底层数据库（如 OpenCode SQLite 数据库）及转换导入操作。在执行任何同步或写入动作之前，**使用者必须自行完整备份相关工具的本地数据与数据库（如 `opencode.db`）**。
   本项目已默认提供只读查询与增量去重，但由于各客户端官方版本迭代可能伴随数据库 Schema 变动，**任何操作请务必自行承担数据风险**。

3. **免责条款 (No Warranty & Limitation of Liability)**：
   本软件基于 MIT / Apache 许可证“按现状 (AS IS)”提供，不附带任何明示或暗示的担保（包括但不限于适销性、特定用途适用性及无侵权保证）。
   **在任何情况下，作者、贡献者均不对因使用、误用或无法使用本软件而导致的任何直接、间接、附带、惩罚性或后果性损害承担责任（包括但不限于数据丢失、数据库损坏、会话混乱、系统停机、业务中断或收益损失）**。

4. **非官方关联**：
   本项目并非 OpenCode, Anthropic (Claude Code), OpenAI (Codex) 或 Google 的官方产品，亦未获得上述实体的赞助或认可。所有商标与版权归其各自所有者所有。
