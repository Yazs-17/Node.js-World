#!/bin/bash

# 检查是否传入参数
if [ -z "$1" ]; then
  echo "❌ 请输入文件夹名称，如：./create_koa_folder.sh myProject"
  exit 1
fi

# 定义变量
FOLDER_NAME="$1"
README_FILE="README.Koa.${FOLDER_NAME}.md"

# 创建文件夹
mkdir -p "$FOLDER_NAME"

# 创建 README 文件并写入内容
cat > "${FOLDER_NAME}/${README_FILE}" <<EOF
## Description

## Usage

## Installation

## Usage

EOF

echo "✅ 已创建文件夹: ${FOLDER_NAME}"
echo "✅ 已生成文件: ${FOLDER_NAME}/${README_FILE}"
