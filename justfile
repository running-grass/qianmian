# 命令列表
default:
  @just --list

# 启动本地开发
dev:
  bunx run-pty % just start-db % just start-vue

# 启动本地的前端
start-vue:
  bun run dev --host 0.0.0.0

# 启动本地的数据库
start-db:
  surreal start -u root -p root -b 0.0.0.0:8000 rocksdb:.local/rocksdb

# 初始化本地数据库
init-db:
  surrealdb-migrations apply

# 代码静态检查+类型检查
lint:
  treefmt
  bun lint
  bun type-check

# 进入生产模式
prod-db-shell:
  nix develop .#prod-db

# 构建前端代码
build:
  bun run build

nix-build:
  nix build .  --option sandbox false

# Release
release:
  bun release

# Release alpha
release-alpha:
  bun release --preReleaseId=alpha --github.preRelease

# Release beta
release-beta:
  bun release --preReleaseId=beta --github.preRelease
