#!/bin/bash

################################################################################
# Voidix.net 自动化部署脚本
# 
# 功能：
# - 自动化Git拉取、构建、部署流程
# - 智能备份和回滚机制
# - 完整的错误处理和日志记录
# - 针对React+TypeScript+预渲染架构优化
#
# 使用方法：
# ./deploy.sh [OPTIONS]
#
# 选项：
# --help               显示帮助信息
# --dry-run           预览模式，不实际执行
# --skip-backup       跳过备份步骤
# --skip-deps         跳过npm install步骤
# --rollback          回滚到上一个版本
# --verbose           详细日志输出
# --force             强制执行（跳过确认）
#
# 作者：GitHub Copilot
# 版本：1.0.0
################################################################################

set -euo pipefail  # 严格模式：任何错误都会终止脚本

# 载入配置文件
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/deploy-config.sh"

if [[ -f "$CONFIG_FILE" ]]; then
    source "$CONFIG_FILE"
else
    echo "错误：配置文件 $CONFIG_FILE 不存在"
    exit 1
fi

# 全局变量
DEPLOYMENT_START_TIME=$(date +%s)
DEPLOYMENT_ID=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${LOG_DIR}/deploy-${DEPLOYMENT_ID}.log"
LOCK_FILE="${PROJECT_ROOT}/.deploy.lock"
BACKUP_CREATED=false
ROLLBACK_PATH=""

# 命令行参数默认值
DRY_RUN=false
SKIP_BACKUP=false
SKIP_DEPS=false
ROLLBACK=false
VERBOSE=false
FORCE=false

################################################################################
# 工具函数
################################################################################

# 日志函数
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
    
    if [[ "$level" == "ERROR" ]]; then
        echo "❌ $message" >&2
    elif [[ "$level" == "SUCCESS" ]]; then
        echo "✅ $message"
    elif [[ "$level" == "INFO" ]]; then
        echo "ℹ️  $message"
    elif [[ "$level" == "WARN" ]]; then
        echo "⚠️  $message"
    fi
}

# 详细日志（仅在verbose模式下显示）
debug() {
    if [[ "$VERBOSE" == "true" ]]; then
        log "DEBUG" "$@"
    else
        echo "[$(date '+%H:%M:%S')] [DEBUG] $*" >> "$LOG_FILE"
    fi
}

# 错误处理函数
error_exit() {
    log "ERROR" "$1"
    cleanup
    exit 1
}

# 清理函数
cleanup() {
    debug "开始清理..."
    
    # 移除锁文件
    if [[ -f "$LOCK_FILE" ]]; then
        rm -f "$LOCK_FILE"
        debug "已移除锁文件"
    fi
    
    # 如果部署失败且创建了备份，询问是否回滚
    if [[ "$BACKUP_CREATED" == "true" && -n "$ROLLBACK_PATH" && "$DRY_RUN" == "false" ]]; then
        if [[ "$FORCE" == "false" ]]; then
            echo ""
            read -p "部署失败，是否立即回滚到备份版本？(y/N): " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                perform_rollback "$ROLLBACK_PATH"
            fi
        else
            log "INFO" "自动回滚到备份版本..."
            perform_rollback "$ROLLBACK_PATH"
        fi
    fi
}

# 设置陷阱处理
trap cleanup EXIT
trap 'error_exit "脚本被中断"' INT TERM

################################################################################
# 核心功能函数
################################################################################

# 显示帮助信息
show_help() {
    cat << EOF
Voidix.net 自动化部署脚本

使用方法：
    $0 [OPTIONS]

选项：
    --help               显示此帮助信息
    --dry-run           预览模式，显示将要执行的操作但不实际执行
    --skip-backup       跳过备份步骤（加速部署，但失去回滚能力）
    --skip-deps         跳过npm install步骤（当依赖未变更时）
    --rollback          回滚到上一个可用的备份版本
    --verbose           显示详细的调试信息
    --force             强制执行，跳过所有确认提示

示例：
    $0                  # 标准部署流程
    $0 --dry-run        # 预览部署操作
    $0 --skip-deps      # 跳过依赖安装的快速部署
    $0 --rollback       # 回滚到上一个版本
    $0 --force          # 静默强制部署

项目信息：
    项目根目录: $PROJECT_ROOT
    构建输出: $PROJECT_ROOT/dist
    网站URL: $SITE_URL
    日志目录: $LOG_DIR

EOF
}

# 解析命令行参数
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --help|-h)
                show_help
                exit 0
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --skip-backup)
                SKIP_BACKUP=true
                shift
                ;;
            --skip-deps)
                SKIP_DEPS=true
                shift
                ;;
            --rollback)
                ROLLBACK=true
                shift
                ;;
            --verbose|-v)
                VERBOSE=true
                shift
                ;;
            --force|-f)
                FORCE=true
                shift
                ;;
            *)
                echo "未知参数: $1"
                echo "使用 --help 查看可用选项"
                exit 1
                ;;
        esac
    done
}

# 环境检查
check_environment() {
    log "INFO" "开始环境检查..."
    
    # 检查是否以root或sudo运行
    if [[ $EUID -eq 0 ]]; then
        log "WARN" "检测到以root用户运行，建议使用sudo权限的普通用户"
    fi
    
    # 检查必要命令
    local required_commands=("git" "node" "npm" "nginx")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            error_exit "必需命令 '$cmd' 未找到，请先安装"
        fi
        debug "✓ $cmd 可用"
    done
    
    # 检查Node.js版本
    local node_version=$(node --version | cut -d'v' -f2)
    local required_node_version="18.0.0"
    if ! npx semver-gt "$node_version" "$required_node_version" 2>/dev/null; then
        log "WARN" "Node.js版本 $node_version 可能过低，推荐使用 >= $required_node_version"
    fi
    debug "✓ Node.js版本: $node_version"
    
    # 检查nginx状态
    if ! systemctl is-active --quiet nginx; then
        error_exit "Nginx服务未运行，请先启动nginx"
    fi
    debug "✓ Nginx服务运行正常"
    
    # 检查Chrome/Chromium（Puppeteer预渲染需要）
    if ! command -v chromium-browser &> /dev/null && ! command -v google-chrome &> /dev/null; then
        log "WARN" "未检测到Chrome/Chromium，预渲染可能失败"
        log "INFO" "建议运行: sudo apt install -y chromium-browser"
    else
        debug "✓ Chrome/Chromium可用"
    fi
    
    # 检查项目目录
    if [[ ! -d "$PROJECT_ROOT" ]]; then
        error_exit "项目目录不存在: $PROJECT_ROOT"
    fi
    debug "✓ 项目目录存在"
    
    # 检查是否是Git仓库
    if [[ ! -d "$PROJECT_ROOT/.git" ]]; then
        error_exit "项目目录不是Git仓库"
    fi
    debug "✓ Git仓库验证通过"
    
    # 检查package.json
    if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
        error_exit "package.json文件不存在"
    fi
    debug "✓ package.json存在"
    
    # 检查磁盘空间（至少需要1GB）
    local available_space=$(df "$PROJECT_ROOT" | awk 'NR==2 {print $4}')
    local required_space=1048576  # 1GB in KB
    if [[ $available_space -lt $required_space ]]; then
        error_exit "磁盘空间不足，可用: $(($available_space/1024))MB，需要: $(($required_space/1024))MB"
    fi
    debug "✓ 磁盘空间充足: $(($available_space/1024))MB"
    
    log "SUCCESS" "环境检查完成"
}

# 检查部署锁
check_deployment_lock() {
    if [[ -f "$LOCK_FILE" ]]; then
        local lock_pid=$(cat "$LOCK_FILE" 2>/dev/null || echo "")
        if [[ -n "$lock_pid" ]] && kill -0 "$lock_pid" 2>/dev/null; then
            error_exit "另一个部署进程正在运行 (PID: $lock_pid)"
        else
            log "WARN" "发现过期的锁文件，将被移除"
            rm -f "$LOCK_FILE"
        fi
    fi
    
    # 创建锁文件
    echo $$ > "$LOCK_FILE"
    debug "已创建部署锁文件"
}

# 创建备份
create_backup() {
    if [[ "$SKIP_BACKUP" == "true" ]]; then
        log "INFO" "跳过备份步骤"
        return 0
    fi
    
    log "INFO" "开始创建备份..."
    
    local backup_name="backup_${DEPLOYMENT_ID}"
    ROLLBACK_PATH="${BACKUP_DIR}/${backup_name}"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "INFO" "[DRY RUN] 将创建备份到: $ROLLBACK_PATH"
        return 0
    fi
    
    # 创建备份目录
    mkdir -p "$BACKUP_DIR"
    
    # 备份当前的dist目录
    if [[ -d "$PROJECT_ROOT/dist" ]]; then
        cp -r "$PROJECT_ROOT/dist" "$ROLLBACK_PATH"
        log "SUCCESS" "已备份当前版本到: $ROLLBACK_PATH"
        BACKUP_CREATED=true
    else
        log "WARN" "dist目录不存在，跳过备份"
    fi
    
    # 清理旧备份（保留最近5个）
    local backup_count=$(find "$BACKUP_DIR" -maxdepth 1 -type d -name "backup_*" | wc -l)
    if [[ $backup_count -gt 5 ]]; then
        find "$BACKUP_DIR" -maxdepth 1 -type d -name "backup_*" -printf '%T@ %p\n' | \
        sort -n | head -n -5 | cut -d' ' -f2- | xargs rm -rf
        debug "已清理旧备份，保留最近5个"
    fi
}

# 更新代码
update_code() {
    log "INFO" "开始更新代码..."
    
    cd "$PROJECT_ROOT"
    
    # 获取当前分支和提交信息
    local current_branch=$(git branch --show-current)
    local current_commit=$(git rev-parse HEAD)
    
    debug "当前分支: $current_branch"
    debug "当前提交: $current_commit"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "INFO" "[DRY RUN] 将执行: git pull origin $current_branch"
        return 0
    fi
    
    # 检查是否有未提交的更改
    if ! git diff --quiet || ! git diff --cached --quiet; then
        error_exit "检测到未提交的更改，请先提交或暂存代码"
    fi
    
    # 拉取最新代码
    if ! git pull origin "$current_branch"; then
        error_exit "Git pull失败，请检查网络连接或解决代码冲突"
    fi
    
    local new_commit=$(git rev-parse HEAD)
    if [[ "$current_commit" == "$new_commit" ]]; then
        log "INFO" "代码已是最新版本，无需更新"
    else
        log "SUCCESS" "代码更新完成: $current_commit -> $new_commit"
    fi
}

# 安装依赖
install_dependencies() {
    if [[ "$SKIP_DEPS" == "true" ]]; then
        log "INFO" "跳过依赖安装"
        return 0
    fi
    
    log "INFO" "开始安装依赖..."
    
    cd "$PROJECT_ROOT"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "INFO" "[DRY RUN] 将执行: npm install"
        return 0
    fi
    
    # 检查package-lock.json是否存在
    if [[ ! -f "package-lock.json" ]]; then
        log "WARN" "package-lock.json不存在，建议先运行npm install生成"
    fi
    
    # 安装依赖，如果失败则重试
    local retry_count=0
    local max_retries=2
    
    while [[ $retry_count -lt $max_retries ]]; do
        if npm install; then
            log "SUCCESS" "依赖安装完成"
            return 0
        else
            retry_count=$((retry_count + 1))
            if [[ $retry_count -lt $max_retries ]]; then
                log "WARN" "依赖安装失败，正在重试 ($retry_count/$max_retries)"
                # 清理node_modules重试
                rm -rf node_modules package-lock.json
            else
                error_exit "依赖安装失败，已重试 $max_retries 次"
            fi
        fi
    done
}

# 构建项目
build_project() {
    log "INFO" "开始构建项目..."
    
    cd "$PROJECT_ROOT"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "INFO" "[DRY RUN] 将执行: npm run build"
        return 0
    fi
    
    # 清理旧的构建文件
    if [[ -d "dist" ]]; then
        rm -rf dist
        debug "已清理旧的构建文件"
    fi
    
    # 构建项目
    local build_start_time=$(date +%s)
    
    if ! npm run build; then
        error_exit "项目构建失败，请检查构建日志"
    fi
    
    local build_end_time=$(date +%s)
    local build_duration=$((build_end_time - build_start_time))
    
    # 验证构建结果
    if [[ ! -d "dist" ]]; then
        error_exit "构建完成但dist目录不存在"
    fi
    
    if [[ ! -f "dist/index.html" ]]; then
        error_exit "构建完成但index.html不存在"
    fi
    
    local dist_size=$(du -sh dist | cut -f1)
    log "SUCCESS" "项目构建完成，耗时: ${build_duration}s，大小: $dist_size"
}

# 验证Nginx配置
validate_nginx_config() {
    log "INFO" "验证Nginx配置..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "INFO" "[DRY RUN] 将执行: nginx -t"
        return 0
    fi
    
    if ! nginx -t; then
        error_exit "Nginx配置验证失败，请检查配置文件"
    fi
    
    debug "✓ Nginx配置验证通过"
}

# 重载Nginx
reload_nginx() {
    log "INFO" "重载Nginx配置..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "INFO" "[DRY RUN] 将执行: systemctl reload nginx"
        return 0
    fi
    
    if ! systemctl reload nginx; then
        error_exit "Nginx重载失败"
    fi
    
    log "SUCCESS" "Nginx重载完成"
}

# 健康检查
health_check() {
    log "INFO" "开始健康检查..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "INFO" "[DRY RUN] 将检查网站: $SITE_URL"
        return 0
    fi
    
    local retry_count=0
    local max_retries=5
    local retry_delay=2
    
    while [[ $retry_count -lt $max_retries ]]; do
        if curl -f -s -o /dev/null "$SITE_URL"; then
            log "SUCCESS" "网站健康检查通过: $SITE_URL"
            return 0
        else
            retry_count=$((retry_count + 1))
            if [[ $retry_count -lt $max_retries ]]; then
                log "WARN" "健康检查失败，等待${retry_delay}秒后重试 ($retry_count/$max_retries)"
                sleep $retry_delay
            fi
        fi
    done
    
    error_exit "网站健康检查失败，站点可能无法访问"
}

# 执行回滚
perform_rollback() {
    local rollback_path="$1"
    
    log "INFO" "开始回滚到: $rollback_path"
    
    if [[ ! -d "$rollback_path" ]]; then
        error_exit "回滚路径不存在: $rollback_path"
    fi
    
    # 备份当前版本（如果存在）
    if [[ -d "$PROJECT_ROOT/dist" ]]; then
        local failed_backup="${BACKUP_DIR}/failed_${DEPLOYMENT_ID}"
        mv "$PROJECT_ROOT/dist" "$failed_backup"
        debug "已保存失败版本到: $failed_backup"
    fi
    
    # 恢复备份版本
    cp -r "$rollback_path" "$PROJECT_ROOT/dist"
    
    # 重载nginx
    systemctl reload nginx
    
    # 健康检查
    if curl -f -s -o /dev/null "$SITE_URL"; then
        log "SUCCESS" "回滚完成，网站恢复正常"
    else
        log "ERROR" "回滚后网站仍无法访问"
    fi
}

# 列出可用的备份版本
list_backups() {
    log "INFO" "可用的备份版本："
    
    if [[ ! -d "$BACKUP_DIR" ]]; then
        log "WARN" "备份目录不存在"
        return 1
    fi
    
    local backups=($(find "$BACKUP_DIR" -maxdepth 1 -type d -name "backup_*" | sort -r))
    
    if [[ ${#backups[@]} -eq 0 ]]; then
        log "WARN" "没有可用的备份版本"
        return 1
    fi
    
    for i in "${!backups[@]}"; do
        local backup_path="${backups[$i]}"
        local backup_name=$(basename "$backup_path")
        local backup_date=$(echo "$backup_name" | sed 's/backup_//' | sed 's/_/ /')
        local backup_size=$(du -sh "$backup_path" 2>/dev/null | cut -f1)
        
        echo "  $((i+1)). $backup_date (大小: $backup_size)"
    done
    
    return 0
}

# 交互式回滚
interactive_rollback() {
    if ! list_backups; then
        return 1
    fi
    
    local backups=($(find "$BACKUP_DIR" -maxdepth 1 -type d -name "backup_*" | sort -r))
    
    echo ""
    read -p "请选择要回滚的版本号 (1-${#backups[@]}): " -r backup_choice
    
    if [[ ! "$backup_choice" =~ ^[0-9]+$ ]] || [[ $backup_choice -lt 1 ]] || [[ $backup_choice -gt ${#backups[@]} ]]; then
        error_exit "无效的选择: $backup_choice"
    fi
    
    local selected_backup="${backups[$((backup_choice-1))]}"
    
    echo ""
    read -p "确认回滚到 $(basename "$selected_backup")? (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        perform_rollback "$selected_backup"
    else
        log "INFO" "回滚操作已取消"
    fi
}

################################################################################
# 主函数
################################################################################

main() {
    # 解析命令行参数
    parse_arguments "$@"
    
    # 创建日志目录
    mkdir -p "$LOG_DIR"
    
    # 开始日志记录
    log "INFO" "==============================================="
    log "INFO" "Voidix.net 自动化部署开始"
    log "INFO" "部署ID: $DEPLOYMENT_ID"
    log "INFO" "执行模式: $([ "$DRY_RUN" == "true" ] && echo "预览模式" || echo "实际执行")"
    log "INFO" "==============================================="
    
    # 特殊处理回滚请求
    if [[ "$ROLLBACK" == "true" ]]; then
        interactive_rollback
        exit 0
    fi
    
    # 环境检查
    check_environment
    
    # 检查部署锁
    check_deployment_lock
    
    # 显示部署信息
    if [[ "$DRY_RUN" == "false" && "$FORCE" == "false" ]]; then
        echo ""
        echo "部署信息："
        echo "  项目路径: $PROJECT_ROOT"
        echo "  网站URL: $SITE_URL"
        echo "  跳过备份: $([ "$SKIP_BACKUP" == "true" ] && echo "是" || echo "否")"
        echo "  跳过依赖: $([ "$SKIP_DEPS" == "true" ] && echo "是" || echo "否")"
        echo ""
        read -p "确认开始部署? (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "INFO" "部署已取消"
            exit 0
        fi
    fi
    
    # 执行部署步骤
    create_backup
    update_code
    install_dependencies
    build_project
    validate_nginx_config
    reload_nginx
    health_check
    
    # 部署完成
    local deployment_end_time=$(date +%s)
    local total_duration=$((deployment_end_time - DEPLOYMENT_START_TIME))
    
    log "SUCCESS" "==============================================="
    log "SUCCESS" "部署完成！"
    log "SUCCESS" "总耗时: ${total_duration}s"
    log "SUCCESS" "网站URL: $SITE_URL"
    log "SUCCESS" "日志文件: $LOG_FILE"
    log "SUCCESS" "==============================================="
    
    # 移除锁文件
    rm -f "$LOCK_FILE"
    
    # 显示部署后信息
    echo ""
    echo "部署后操作建议："
    echo "1. 访问 $SITE_URL 验证网站功能"
    echo "2. 检查Google Analytics数据收集"
    echo "3. 查看日志文件: $LOG_FILE"
    if [[ "$BACKUP_CREATED" == "true" ]]; then
        echo "4. 如有问题，可使用以下命令回滚："
        echo "   $0 --rollback"
    fi
}

# 执行主函数
main "$@"
