# ============================================================
# 构建阶段（Builder Stage）
# ============================================================
FROM node:22-bullseye-slim AS builder

WORKDIR /app

# 先复制依赖描述文件，利用缓存层
COPY package*.json ./

# 安装依赖（包含 devDependencies）
RUN npm ci

# 复制项目源码
COPY . .

# 构建 Nest 项目
RUN npm run build

# 将所有 .graphql 文件复制到 dist/graphql 中，不保留原有目录结构，如果需要保留原有结构，可以调整此命令
# RUN mkdir -p dist/graphql && \
#   find src -name "*.graphql" -exec cp --parents {} dist/graphql/ \;
# RUN mkdir -p dist/graphql && \
#   find src -name "*.graphql" -exec cp {} dist/graphql/ \;

# ============================================================
# 运行阶段（Runtime Stage）
# ============================================================
FROM node:22-bullseye-slim AS runner

WORKDIR /app

# 设置生产环境变量
ENV NODE_ENV=production
ENV PORT=3100

# 拷贝构建产物与依赖说明
COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/src/modules/article/graphqls/article.graphql ./dist/graphql/
COPY --from=builder /app/package*.json ./

# 只安装生产依赖
RUN npm ci --omit=dev

# 创建非 root 用户以提升安全性
RUN addgroup --system app && adduser --system --ingroup app app
USER app

# 暴露端口
EXPOSE 3100

# 启动命令
CMD ["node", "dist/main.js"]
