#!/bin/bash

# 前端上传脚本
echo "=========================================="
echo "准备上传前端到 GitHub"
echo "=========================================="

cd /Users/cc/qring-health-dashboard

# 检查是否已初始化 Git
if [ ! -d ".git" ]; then
    echo "初始化 Git 仓库..."
    git init
fi

# 添加远程仓库（如果还没有）
if ! git remote | grep -q "origin"; then
    echo "添加远程仓库..."
    git remote add origin https://github.com/oscarka/Qring-frontend.git
else
    echo "更新远程仓库地址..."
    git remote set-url origin https://github.com/oscarka/Qring-frontend.git
fi

# 添加所有文件（.gitignore 会自动排除不需要的文件）
echo "添加文件..."
git add .

# 提交
echo "提交更改..."
git commit -m "Initial commit: Qring health dashboard frontend

- React + TypeScript + Vite
- Health data visualization dashboard
- Multiple chart types (Heart Rate, HRV, Stress, Blood Oxygen, etc.)
- Time range selection (1, 3, 7, 10, 30 days)
- Responsive design
- Auto-refresh (30s)
- Mock data mode
- Cloudflare Pages deployment ready"

# 推送到 GitHub
echo "推送到 GitHub..."
git branch -M main
git push -u origin main

echo "=========================================="
echo "前端上传完成！"
echo "=========================================="

