#!/bin/bash

################################################################################
# Voidix.net 部署配置文件
#
# 此文件包含部署脚本所需的所有配置参数
# 请根据实际环境修改相应的路径和设置
################################################################################

# 项目基本信息
PROJECT_NAME="Voidix.net"
PROJECT_ROOT="/var/www/voidix.net"
SITE_URL="https://voidix.net"

# 备份设置
BACKUP_DIR="/var/backups/voidix"
BACKUP_RETENTION=5  # 保留的备份数量

# 日志设置
LOG_DIR="/var/log/voidix-deploy"

# Nginx设置
NGINX_CONFIG_FILE="nginx-production.conf"
NGINX_CONFIG_PATH="${PROJECT_ROOT}/${NGINX_CONFIG_FILE}"

# 构建设置
BUILD_COMMAND="npm run build"
NODE_ENV="production"

# 健康检查设置
HEALTH_CHECK_URL="$SITE_URL"
HEALTH_CHECK_TIMEOUT=30
HEALTH_CHECK_RETRIES=5
HEALTH_CHECK_RETRY_DELAY=2

# Git设置
DEFAULT_BRANCH="master"  # 或 "main"，根据实际情况调整

# 磁盘空间检查（单位：KB）
MIN_DISK_SPACE=1048576  # 1GB

# Node.js版本要求
MIN_NODE_VERSION="18.0.0"

# 依赖安装设置
NPM_INSTALL_TIMEOUT=300  # 5分钟超时
NPM_RETRY_COUNT=2

# 预渲染相关设置（针对Voidix项目）
PRERENDER_ROUTES=("/" "/status" "/faq" "/bug-report")
CHROME_EXECUTABLE_PATHS=(
    "/usr/bin/chromium-browser"
    "/usr/bin/google-chrome"
    "/usr/bin/chromium"
    "/snap/bin/chromium"
)

# 性能监控
ENABLE_BUILD_TIMING=true
ENABLE_SIZE_REPORTING=true

# 安全设置
ALLOWED_USERS=("www-data" "ubuntu" "deploy")  # 允许执行部署的用户
REQUIRE_SUDO=false  # 是否需要sudo权限

# 通知设置（可选）
ENABLE_NOTIFICATIONS=false
WEBHOOK_URL=""  # Slack/Discord webhook URL
EMAIL_RECIPIENT=""  # 邮件通知接收者

# 环境特定设置
case "$(hostname)" in
    "production-server")
        # 生产环境特定设置
        BACKUP_RETENTION=10
        HEALTH_CHECK_RETRIES=10
        ;;
    "staging-server")
        # 预发布环境设置
        SITE_URL="https://staging.voidix.net"
        BACKUP_RETENTION=3
        ;;
    *)
        # 开发环境或其他
        LOG_DIR="/tmp/voidix-deploy"
        BACKUP_DIR="/tmp/voidix-backups"
        ;;
esac

# 导出所有变量，供部署脚本使用
export PROJECT_NAME PROJECT_ROOT SITE_URL
export BACKUP_DIR BACKUP_RETENTION LOG_DIR
export NGINX_CONFIG_FILE NGINX_CONFIG_PATH
export BUILD_COMMAND NODE_ENV
export HEALTH_CHECK_URL HEALTH_CHECK_TIMEOUT HEALTH_CHECK_RETRIES HEALTH_CHECK_RETRY_DELAY
export DEFAULT_BRANCH MIN_DISK_SPACE MIN_NODE_VERSION
export NPM_INSTALL_TIMEOUT NPM_RETRY_COUNT
export ENABLE_BUILD_TIMING ENABLE_SIZE_REPORTING
export ALLOWED_USERS REQUIRE_SUDO
export ENABLE_NOTIFICATIONS WEBHOOK_URL EMAIL_RECIPIENT

# 验证关键配置
validate_config() {
    local errors=()

    # 检查必需的目录路径
    if [[ ! -d "$(dirname "$PROJECT_ROOT")" ]]; then
        errors+=("父目录不存在: $(dirname "$PROJECT_ROOT")")
    fi

    # 检查URL格式
    if [[ ! "$SITE_URL" =~ ^https?:// ]]; then
        errors+=("无效的网站URL格式: $SITE_URL")
    fi

    # 检查数值配置
    if [[ ! "$BACKUP_RETENTION" =~ ^[0-9]+$ ]] || [[ $BACKUP_RETENTION -lt 1 ]]; then
        errors+=("无效的备份保留数量: $BACKUP_RETENTION")
    fi

    if [[ ! "$HEALTH_CHECK_RETRIES" =~ ^[0-9]+$ ]] || [[ $HEALTH_CHECK_RETRIES -lt 1 ]]; then
        errors+=("无效的健康检查重试次数: $HEALTH_CHECK_RETRIES")
    fi

    # 输出错误信息
    if [[ ${#errors[@]} -gt 0 ]]; then
        echo "配置验证失败："
        for error in "${errors[@]}"; do
            echo "  - $error"
        done
        return 1
    fi

    return 0
}

# 显示配置摘要
show_config_summary() {
    cat << EOF
Voidix.net 部署配置摘要：
  项目名称: $PROJECT_NAME
  项目路径: $PROJECT_ROOT
  网站URL: $SITE_URL
  备份目录: $BACKUP_DIR (保留 $BACKUP_RETENTION 个)
  日志目录: $LOG_DIR
  构建命令: $BUILD_COMMAND
  健康检查: $HEALTH_CHECK_RETRIES 次重试，间隔 ${HEALTH_CHECK_RETRY_DELAY}s
EOF
}

# 如果直接运行此文件，显示配置信息
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    echo "Voidix.net 部署配置验证"
    echo "========================"

    if validate_config; then
        echo "✅ 配置验证通过"
        echo ""
        show_config_summary
    else
        echo "❌ 配置验证失败"
        exit 1
    fi
fi
