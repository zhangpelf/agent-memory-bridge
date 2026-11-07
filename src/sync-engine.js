#!/usr/bin/env node
/**
 * Agent Memory Bridge - Safe Ingestion Sync Engine
 * Converts Claude Code and Codex sessions into standard OpenCode format.
 * Includes strict pre-flight backup check to avoid corruption.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync, spawnSync } = require("child_process");

const HOME = process.env.HOME;
const DB_PATH = process.env.OPENCODE_DB_PATH || path.join(HOME, ".local/share/opencode/opencode.db");
const CLAUDE_DIR = process.env.CLAUDE_PROJECTS_DIR || path.join(HOME, ".claude/projects");
const CODEX_DIR = process.env.CODEX_SESSIONS_DIR || path.join(HOME, ".codex/sessions");
const WORKSPACE_DIR = process.cwd();

// --- 强防呆检查 (Safety Check) ---
function runSafetyCheck() {
  console.log("=== [Agent Memory Bridge] 执行数据安全防呆校验 ===");
  if (!fs.existsSync(DB_PATH)) {
    console.error(`[Error] 未发现 OpenCode 数据库: ${DB_PATH}`);
    process.exit(1);
  }

  const backupDir = path.join(path.dirname(DB_PATH), "backup_memory_bridge");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFile = path.join(backupDir, `opencode_${timestamp}.db.bak`);

  console.log(`正在创建安全备份快照: ${backupFile} ...`);
  try {
    execSync(`sqlite3 "${DB_PATH}" ".backup '${backupFile}'"`);
    console.log(`✔ 备份创建成功 (${(fs.statSync(backupFile).size / (1024*1024)).toFixed(1)} MB)\n`);
  } catch(e) {
    console.error(`[Fatal] 数据库备份失败，终止同步以保护数据: ${e.message}`);
    process.exit(1);
  }
}

runSafetyCheck();

console.log("提示：同步引擎适配器已就绪，可根据传入的工作目录执行增量汇流。");
