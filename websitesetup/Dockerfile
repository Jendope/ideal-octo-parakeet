# 1. 使用官方 Python 基础镜像
FROM python:3.11

# 2. 设置容器内的工作目录
WORKDIR /app

# 3. 把本地当前目录的所有文件复制到容器的 /app 目录下
COPY . .

# 4. 安装依赖
RUN pip install --no-cache-dir -r requirements.txt

# 5. 暴露 Flask 的默认端口
EXPOSE 7860

# 6. 运行 Flask。注意：Hugging Face 要求监听 0.0.0.0 和端口 7860
CMD ["python", "app.py"]