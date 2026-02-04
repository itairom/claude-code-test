# Claude Code Learning Plan

## Overview
This project is for learning about Claude Code capabilities:
1. **Subagents** - Specialized AI assistants with custom prompts, tools, and permissions
2. **Skills** - Custom capabilities you create as folders with instructions

---

# Subagents

## What Are Subagents?

Subagents are specialized AI assistants that:
- Run in their own context window
- Have custom system prompts
- Have specific tool access (allowlist/denylist)
- Have independent permission modes

## Subagent Scopes

| Location | Scope | Priority |
|----------|-------|----------|
| `.claude/agents/` | Current project | 2 |
| `~/.claude/agents/` | All your projects | 3 |
| Plugin's `agents/` | Where plugin is enabled | 4 (lowest) |
| `--agents` CLI flag | Current session | 1 (highest) |

## Subagent File Format

```yaml
---
name: my-agent
description: When to use this agent
tools: Read, Grep, Glob
model: sonnet
---

You are a specialized assistant. Your task is...
```

## Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique identifier (lowercase, hyphens) |
| `description` | Yes | When Claude should delegate to this agent |
| `tools` | No | Tools agent can use (inherits all if omitted) |
| `disallowedTools` | No | Tools to deny |
| `model` | No | `sonnet`, `opus`, `haiku`, or `inherit` |
| `permissionMode` | No | `default`, `acceptEdits`, `dontAsk`, `bypassPermissions`, `plan` |
| `skills` | No | Skills to preload into agent context |
| `hooks` | No | Lifecycle hooks scoped to this agent |

## Project Subagents Created

```
.claude/agents/
├── code-reviewer.md       # Reviews code for quality and security
├── test-runner.md         # Runs tests and reports failures
└── documentation-writer.md # Creates technical documentation
```

## Claude Code Skills

Skills are folders with instructions that teach Claude specific tasks. They live in:
```
.claude/skills/your-skill-name/skill.md
```

### Skill Structure
```yaml
---
name: skill-name
description: Brief description of what this skill does
---

# Skill Title

Detailed instructions for Claude on how to handle this skill.
```

### Skills Paths by Tool

| Tool | Project Path | Global Path |
|------|--------------|-------------|
| Claude Code | `.claude/skills/` | `~/.claude/skills/` |
| Cursor | `.cursor/skills/` | `~/.cursor/skills/` |
| Codex | `.codex/skills/` | `~/.codex/skills/` |

### Popular Official Skills

From the [awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) repo:

**By Anthropic:**
- `anthropics/pdf` - PDF manipulation
- `anthropics/mcp-builder` - Create MCP servers
- `anthropics/skill-creator` - Guide for creating skills

**By Vercel:**
- `vercel-labs/react-best-practices` - React patterns
- `vercel-labs/next-best-practices` - Next.js patterns

**By Trail of Bits (Security):**
- `trailofbits/audit-context-building` - Deep code analysis
- `trailofbits/static-analysis` - CodeQL, Semgrep

### Current Project Skills

```
.claude/
└── skills/
    └── my-first-skill/
        └── skill.md    ← Demo skill created
```

## Available Subagent Types

| Subagent | Purpose | Tools Available |
|----------|---------|-----------------|
| **Bash** | Command execution, git operations, terminal tasks | Bash |
| **Explore** | Fast codebase exploration, finding files, searching | All tools except Task, ExitPlanMode, Edit, Write, NotebookEdit |
| **Plan** | Software architecture, implementation planning | All tools except Task, ExitPlanMode, Edit, Write, NotebookEdit |
| **general-purpose** | Complex research, multi-step tasks, searching code | All tools (*) |
| **claude-code-guide** | Questions about Claude Code CLI, Agent SDK, hooks, MCP | Glob, Grep, Read, WebFetch, WebSearch |
| **statusline-setup** | Configure Claude Code status line setting | Read, Edit |

## Key Concepts

### When to Use Each Subagent

**Use Explore when:**
- Finding files by patterns (`src/**/*.tsx`)
- Searching code for keywords
- Answering codebase questions
- Set thoroughness: "quick", "medium", or "very thorough"

**Use Plan when:**
- Designing implementation strategies
- Architectural decisions
- Complex feature planning

**Use general-purpose when:**
- Open-ended searches requiring multiple rounds
- Research tasks without clear file paths
- Complex multi-step investigations

### Subagent Parameters
- `description`: Short 3-5 word summary
- `prompt`: Detailed task description with context
- `model`: Optional (sonnet, opus, haiku) - defaults to parent
- `thoroughness`: For Explore only (quick/medium/very thorough)
- `run_in_background`: Run async, get output file path
- `resume`: Resume previous agent by ID

## Examples to Try

### 1. Explore Agent - Quick Search
```
Find all TypeScript files with "interface" keyword
```

### 2. General Purpose - Research
```
Research best practices for error handling in Node.js
```

### 3. Plan Agent - Architecture
```
Design a REST API for a todo application
```

## Progress
- [x] Create plan file
- [x] Run Explore agent example (found 2 interfaces)
- [x] Demonstrate parallel subagents (3 agents at once)
- [x] Run general-purpose agent example (code pattern analysis)
- [ ] Run Plan agent example
- [ ] Experiment with background agents
- [ ] Try resuming an agent

## Recent Examples

### Parallel Agents (3 agents simultaneously)
| Agent | Type | Result |
|-------|------|--------|
| a204efd | Explore | Found 2 interfaces |
| a72db4b | general-purpose | Analyzed code patterns |
| ad28176 | Explore | Listed all exports |
| a43ffd2 | Explore | Found 1 async function |

### Key Takeaway: Parallel Execution
Running multiple agents in a single message saves time. All agents work independently and return results together.
