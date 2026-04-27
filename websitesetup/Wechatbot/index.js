const { Client, LocalAuth } = require('whatsapp-web.js');
const axios = require('axios');
const express = require('express');
const qrcode = require('qrcode');

const app = express();
const port = 7860;
let qrImage = '';

// --- 1. 配置：指向你 Flask 后端的接口 ---
const RAG_API_URL = "https://tanjacky-anti-fraud-rag.hf.space/api/analyze";

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: '/usr/bin/chromium',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--no-zygote'],
        headless: true
    }
});

// --- 2. 二维码展示逻辑 ---
client.on('qr', async (qr) => {
    qrImage = await qrcode.toDataURL(qr);
    console.log('二维码已刷新');
});

client.on('ready', () => {
    console.log('✅ 机器人已在线');
    qrImage = '<h1>✅ 登录成功！机器人正在运行...</h1>';
});

// --- 3. 核心修复逻辑：防止重复触发与自发自收 ---
client.on('message_create', async msg => {
    // A. 基础过滤：跳过非文字消息，跳过机器人生成的回复
    if (msg.type !== 'chat' || msg.body.includes('HKIIT 反诈助手')) return;

    // B. 获取当前对话的目标 ID (chatId)
    // 如果是我发的，目标就是 msg.to；如果是别人发的，目标就是 msg.from
    const chatId = msg.fromMe ? msg.to : msg.from;
    
    // C. 决定是否触发 AI 分析
    let shouldAnalyze = false;

    if (!msg.fromMe) {
        // 情况 1：收到来自他人的消息 -> 自动分析
        shouldAnalyze = true;
    } else if (msg.fromMe && (msg.body.includes('核实') || msg.body.includes('分析'))) {
        // 情况 2：我自己发出的消息，但包含指令关键词 -> 触发分析（用于自测）
        shouldAnalyze = true;
    }

    if (shouldAnalyze && msg.body.length > 2) {
        console.log(`🚀 正在分析来自 ${chatId} 的内容: ${msg.body.substring(0, 15)}...`);

        try {
            // 请求后端
            const response = await axios.post(RAG_API_URL, {
                "message": msg.body
            }, { timeout: 0 });

            const result = response.data;

            if (result.status === "success") {
                const prob = (result.probability * 100).toFixed(1);
                
                // 格式化报告内容
                const report = 
                    `🛡️ 【HKIIT 反诈助手 · AI 深度分析】\n\n` +
                    `🚩 诈骗风险：${prob}%\n\n` +
                    `📝 专家分析：\n${result.reason}\n\n` +
                    `🔍 参考证据：\n${result.evidence}`;

                // 【核心修复】直接发送到 chatId，确保回复出现在正确的对话窗口
                await client.sendMessage(chatId, report);
                console.log(`✅ 已完成对 ${chatId} 的回复`);
            }
        } catch (e) {
            console.error('❌ 对接失败:', e.message);
        }
    }
});

client.initialize();

// --- 4. Web 服务 ---
app.get('/', (req, res) => {
    if (qrImage.startsWith('<h1')) {
        res.send(qrImage);
    } else if (qrImage) {
        res.send(`<div style="text-align:center;"><h2>请使用 WhatsApp 扫码</h2><img src="${qrImage}" style="width:300px;"></div>`);
    } else {
        res.send('系统启动中，请稍后刷新...');
    }
});

app.listen(port);