from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS

from database_manager import load_my_chroma
from llm_manager import predict_fraud


app = Flask(__name__)
CORS(app)

# --- 2. 全局加载数据库 ---
print("--- 正在初始化后端系统... ---")
vector_db = load_my_chroma()
print("--- 系统就绪 ---")


# @app.route('/')
# def hello_world():  # put application's code here
#     return 'Hello World!'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/analyze', methods=['POST'])
def analyze():
    """
    处理反诈分析请求的 API
    前端通过 JSON 发送 {"message": "用户输入的文本"}
    """
    try:
        data = request.json
        user_input = data.get('message', '').strip()

        if not user_input:
            return jsonify({"status": "error", "message": "输入内容不能为空"}), 400

        # 直接调用你在 llm_manager.py 里写好的复杂逻辑
        # 它会返回 {"probability": 0.x, "reason": "...", "evidence": "..."}
        result = predict_fraud(user_input, vector_db)

        # return jsonify({
        #     "status": "success",
        #     "probability": result["probability"],
        #     "reason": result["reason"],
        #     "evidence": result["evidence"]
        # })
        # 1. 先把要返回的数据准备好
        result_json = {
            "status": "success",
            "probability": result["probability"],
            "reason": result["reason"],
            "evidence": result["evidence"]
        }

        # 2. 包装成 Response 对象，并加上“跳过警告”的 Header
        from flask import make_response  # 确保这行在文件最顶部有 import

        resp = make_response(jsonify(result_json))
        resp.headers['ngrok-skip-browser-warning'] = '69420'

        return resp

    except Exception as e:
        print(f"服务器错误: {str(e)}")
        return jsonify({"status": "error", "message": "分析失败，请检查后端日志"}), 500

if __name__ == '__main__':
    # debug=True 模式下，改动代码后 Flask 会自动重载
    # app.run(debug=True, port=5000)
    app.run(host='0.0.0.0', port=7860)