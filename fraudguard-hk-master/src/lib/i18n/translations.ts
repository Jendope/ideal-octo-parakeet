/**
 * Translation dictionary for FraudGuard HK
 * Supports: English, Traditional Chinese (HK), Simplified Chinese (CN)
 * Default language: Traditional Chinese (zh-HK) for Hong Kong users
 */

export type Language = 'en' | 'zh-HK' | 'zh-CN';

export const languageNames: Record<Language, string> = {
  'en': 'English',
  'zh-HK': '繁體中文',
  'zh-CN': '简体中文'
};

export const translations = {
  en: {
    // App Title
    appTitle: 'FraudGuard HK',
    appSubtitle: 'Your AI Fraud Detection Assistant',
    
    // Navigation
    settings: 'Settings',
    switchToChatMode: 'Switch to Chat Mode',
    switchToElderlyMode: 'Elderly Mode',
    
    // Elderly Mode
    needHelp: 'Need Help Checking Something?',
    tapButtonInstruction: 'Tap the button below and speak your question',
    helpMeCheck: 'HELP ME CHECK',
    tapAndSpeak: 'Tap & Speak',
    tapToStop: 'TAP TO STOP',
    listening: 'Listening...',
    checkingForYou: 'Checking for you...',
    youSaid: 'You said:',
    voiceInput: 'Voice',
    textInput: 'Text',
    imageInput: 'Image',
    useTextInput: 'Use Text Input',
    analyze: 'Analyze',
    placeholder: 'Type or paste a suspicious message here...',
    tapAndSpeakShort: 'Tap & Speak',
    
    // Examples
    exampleTitle: 'Examples of what to say:',
    example1: '"Check this message for scams"',
    example2: '"Is this email safe?"',
    example3: '"Someone wants me to send money"',
    
    // Risk Levels
    safe: 'SAFE - No problems found',
    lowRisk: 'LOW RISK - Be aware',
    mediumRisk: 'MEDIUM RISK - Be careful',
    highRisk: 'HIGH RISK - WARNING!',
    critical: 'DANGER! DO NOT PROCEED!',
    analysisComplete: 'Analysis Complete',
    
    // Details
    details: 'Details:',
    whatToDo: 'What to do:',
    similarCases: 'Similar verified cases:',
    
    // Actions
    readAloud: 'Read Aloud',
    speaking: 'Speaking...',
    checkAnother: 'Check Another',
    tryAgain: 'Try Again',
    
    // Error
    somethingWentWrong: 'Something went wrong',
    microphoneRequiresHttps: 'Microphone requires HTTPS or localhost',
    microphonePermissionDenied: 'Microphone permission denied',
    
    // Buttons
    analyze: 'Analyze',
    placeholder: 'Type or paste a suspicious message...',
    
    // Default Mode
    welcomeTitle: 'FraudGuard HK',
    welcomeSubtitle: 'I help protect you from scams and fraud. Ask me to analyze any message, email, or suspicious content.',
    placeholder: 'Ask me to check for scams...',
    analyzing: 'Analyzing...',
    recommendations: 'Recommendations:',
    
    // Chat Examples
    chatExample1: 'Check if this email is a scam',
    chatExample2: 'Analyze this message for fraud',
    chatExample3: 'Is this offer too good to be true?',
    
    // Settings Dialog
    settingsTitle: 'FraudGuard HK Settings',
    settingsDescription: 'Configure your fraud detection assistant',
    
    // AI Engine
    aiEngine: 'AI Engine',
    aiEngineDescription: 'Choose the AI engine for fraud detection',
    glmEngine: 'GLM Engine (Recommended)',
    glmDescription: 'GLM-4 (Chat/Reasoning) + GLM-4V (Vision) via BigModel',
    qwenEngine: 'Qwen Engine',
    qwenDescription: 'Qwen 3.5 Plus (Chat) + Qwen VL OCR (Vision) via DashScope',
    bestForPlanning: 'Best for Planning',
    visionCapable: 'Vision Capable',
    fastResponse: 'Fast Response',
    ocrCapable: 'OCR Capable',
    
    // Voice Settings
    voiceSettings: 'Voice Settings',
    autoSpeakResponses: 'Auto-speak responses',
    autoSpeakDescription: 'Automatically read analysis results aloud',
    slowerSpeech: 'Slower speech rate',
    slowerSpeechDescription: 'Speak more slowly for better clarity',
    
    // Accessibility
    accessibility: 'Accessibility',
    highContrastMode: 'High Contrast Mode',
    highContrastDescription: 'Increase visual contrast for better visibility',
    largeText: 'Large Text',
    largeTextDescription: 'Use larger font sizes throughout the app',
    
    // RAG Settings
    ragSettings: 'Knowledge Base',
    ragEnabled: 'Enable RAG Analysis',
    ragEnabledDescription: 'Cross-reference with verified fraud cases database',
    ragCasesCount: 'Verified fraud cases in database',
    
    // About
    about: 'About FraudGuard HK',
    aboutDescription: 'FraudGuard HK is an AI-powered fraud detection assistant designed to protect Hong Kong users from scams, phishing attempts, and fraudulent messages.',
    aboutModes: 'The app supports two modes: Elderly Mode (voice-first, simplified interface) and Default Mode (chat-based interface with detailed analysis).',
    aboutRag: 'Powered by RAG technology, cross-referencing 606 verified fraud cases from HK01 news.',
    
    // Emergency Contacts
    emergencyContacts: 'Emergency Contacts',
    emergencyContactsDescription: 'Family members will be notified when high-risk scams are detected',
    addContact: 'Add',
    addContactHint: 'Click "Add" to add a contact',
    contactName: 'Name',
    contactNamePlaceholder: 'e.g., Mom',
    contactPhone: 'Phone',
    contactRelationship: 'Relationship',
    contactRelationshipPlaceholder: 'e.g., Family, Friend',
    noContacts: 'No emergency contacts yet',
    
    // Buttons
    cancel: 'Cancel',
    saveChanges: 'Save Changes',
    
    // Language
    language: 'Language',
    languageAutoDetect: 'Voice input automatically uses selected language',
    imageInput: 'Image',
    uploadImagePrompt: 'Tap to upload screenshot',
    uploadImageHint: 'Take a screenshot of suspicious message',
    
    // Powered by
    poweredBy: 'Powered by',
    
    // Footer
    footer: 'FraudGuard HK',
    
    // Loading
    loading: 'Loading FraudGuard HK...',
    
    // Autonomous Agent
    autonomousMode: 'Autonomous Mode',
    autonomousDescription: 'Let AI automatically check your messages',
    startAutoCheck: 'Start Auto Check',
    stopAutoCheck: 'Stop Auto Check',
    agentStatus: 'Agent Status',
    agentIdle: 'Idle',
    agentWorking: 'Working',
    agentLastAction: 'Last Action',
    
    // Action types
    actionOpenApp: 'Open App',
    actionCheckMessages: 'Check Messages',
    actionAnalyzeScreen: 'Analyze Screen',
    actionMakeCall: 'Make Call',
    actionSendMessage: 'Send Message',
    actionSearchWeb: 'Search Web',
    actionNone: 'Analyze Only',
    executeAction: 'Execute',
    youSaid: 'You said:',
    microphoneRequiresHttps: 'Microphone requires HTTPS or localhost. Use Text Input instead.',
    
    // Family Alert
    notifyFamily: 'Notify Family',
    familyAlert: 'Family Alert',
    alertDetected: 'detected',
    alertWarning: 'This message appears to be a scam. Would you like to notify your family members?',
    alertPrepared: 'Alert prepared! Click below to send to your family.',
    alertMessage: 'Alert Message:',
    sending: 'Sending...',
    dismiss: 'Dismiss',
    open: 'Open',
    done: 'Done',
    
    // Emergency Contacts
    emergencyContacts: 'Emergency Contacts',
    addContact: 'Add',
    addEmergencyContact: 'Add Emergency Contact',
    editContact: 'Edit Contact',
    deleteContact: 'Delete Contact?',
    deleteContactConfirm: 'Are you sure you want to remove this contact?',
    delete: 'Delete',
    noContacts: 'No emergency contacts yet. Add family members to receive alerts.',
    name: 'Name',
    namePlaceholder: 'e.g., Mom, Son',
    phone: 'Phone',
    platform: 'Platform',
    relationship: 'Relationship (Optional)',
    relationshipPlaceholder: 'e.g., Son, Daughter',
    save: 'Save',
  },
  
  'zh-HK': {
    // App Title
    appTitle: 'FraudGuard HK',
    appSubtitle: '您的 AI 防騙偵測助手',
    
    // Navigation
    settings: '設定',
    switchToChatMode: '切換至聊天模式',
    switchToElderlyMode: '長者模式',
    
    // Elderly Mode
    needHelp: '需要幫忙檢查嗎？',
    tapButtonInstruction: '點擊下方按鈕並說出您的問題',
    helpMeCheck: '幫我檢查',
    tapAndSpeak: '點擊說話',
    tapToStop: '點擊停止',
    listening: '正在聆聽...',
    checkingForYou: '正在為您檢查...',
    youSaid: '您說：',
    voiceInput: '語音',
    textInput: '文字',
    useTextInput: '改用文字輸入',
    analyze: '分析',
    placeholder: '輸入或貼上可疑訊息...',
    tapAndSpeakShort: '點擊說話',
    
    // Examples
    exampleTitle: '您可以這樣說：',
    example1: '「檢查這個訊息是否詐騙」',
    example2: '「這封電郵安全嗎？」',
    example3: '「有人要我匯款」',
    
    // Risk Levels
    safe: '安全 - 未發現問題',
    lowRisk: '低風險 - 請注意',
    mediumRisk: '中風險 - 請小心',
    highRisk: '高風險 - 警告！',
    critical: '危險！切勿繼續！',
    analysisComplete: '分析完成',
    
    // Details
    details: '詳情：',
    whatToDo: '建議行動：',
    similarCases: '相關已驗證案例：',
    
    // Actions
    readAloud: '朗讀結果',
    speaking: '正在朗讀...',
    checkAnother: '檢查其他',
    tryAgain: '重試',
    
    // Error
    somethingWentWrong: '出了點問題',
    microphoneRequiresHttps: '麥克風需要 HTTPS 或本機連線',
    microphonePermissionDenied: '麥克風權限被拒絕',
    
    // Buttons
    analyze: '分析',
    placeholder: '輸入或貼上可疑訊息...',
    
    // Default Mode
    welcomeTitle: 'FraudGuard HK',
    welcomeSubtitle: '我幫您識別詐騙和欺詐行為。請讓我分析任何訊息、電郵或可疑內容。',
    placeholder: '請輸入要檢查的內容...',
    analyzing: '分析中...',
    recommendations: '建議：',
    
    // Chat Examples
    chatExample1: '檢查這封電郵是否詐騙',
    chatExample2: '分析這個訊息是否有詐騙成分',
    chatExample3: '這個優惠是否太好而不真實？',
    
    // Settings Dialog
    settingsTitle: 'FraudGuard HK 設定',
    settingsDescription: '配置您的防騙助手',
    
    // AI Engine
    aiEngine: 'AI 引擎',
    aiEngineDescription: '選擇用於詐騙偵測的 AI 引擎',
    glmEngine: 'GLM 引擎（推薦）',
    glmDescription: 'GLM-4（對話/推理）+ GLM-4V（視覺）經由 BigModel',
    qwenEngine: 'Qwen 引擎',
    qwenDescription: 'Qwen 3.5 Plus（對話）+ Qwen VL OCR（視覺）經由 DashScope',
    bestForPlanning: '擅長規劃',
    visionCapable: '支援視覺分析',
    fastResponse: '快速回應',
    ocrCapable: '支援 OCR',
    
    // Voice Settings
    voiceSettings: '語音設定',
    autoSpeakResponses: '自動朗讀結果',
    autoSpeakDescription: '自動讀出分析結果',
    slowerSpeech: '較慢語速',
    slowerSpeechDescription: '以較慢速度朗讀以便更清晰',
    
    // Accessibility
    accessibility: '無障礙設定',
    highContrastMode: '高對比模式',
    highContrastDescription: '提高視覺對比度以便更清晰',
    largeText: '大字體',
    largeTextDescription: '在整個應用程式中使用較大的字體',
    
    // RAG Settings
    ragSettings: '知識庫',
    ragEnabled: '啟用 RAG 分析',
    ragEnabledDescription: '與已驗證詐騙案例資料庫交叉比對',
    ragCasesCount: '資料庫中的已驗證詐騙案例',
    
    // About
    about: '關於 FraudGuard HK',
    aboutDescription: 'FraudGuard HK 是一款 AI 驅動的防騙助手，旨在保護香港用戶免受詐騙、釣魚企圖和欺詐訊息的侵害。',
    aboutModes: '此應用程式支援兩種模式：長者模式（語音優先、簡化介面）和標準模式（聊天介面、詳細分析）。',
    aboutRag: '採用 RAG 技術，與 606 宗 HK01 已驗證詐騙案例交叉比對。',
    
    // Emergency Contacts
    emergencyContacts: '緊急聯絡人',
    emergencyContactsDescription: '當偵測到高風險詐騙時會通知家人',
    addContact: '新增',
    addContactHint: '點擊「新增」以加入聯絡人',
    contactName: '姓名',
    contactNamePlaceholder: '例如：媽咪',
    contactPhone: '電話',
    contactRelationship: '關係',
    contactRelationshipPlaceholder: '例如：家人、朋友',
    noContacts: '尚未設定緊急聯絡人',
    
    // Buttons
    cancel: '取消',
    saveChanges: '儲存變更',
    
    // Language
    language: '語言',
    languageAutoDetect: '語音輸入會自動使用選擇的語言',
    imageInput: '圖片',
    uploadImagePrompt: '點擊上載截圖',
    uploadImageHint: '截取可疑訊息的畫面',
    
    // Powered by
    poweredBy: '技術支援：',
    
    // Footer
    footer: 'FraudGuard HK',
    
    // Loading
    loading: '載入 FraudGuard HK...',
    
    // Autonomous Agent
    autonomousMode: '自主模式',
    autonomousDescription: '讓 AI 自動檢查您的訊息',
    startAutoCheck: '開始自動檢查',
    stopAutoCheck: '停止自動檢查',
    agentStatus: '代理狀態',
    agentIdle: '閒置',
    agentWorking: '工作中',
    agentLastAction: '上次行動',
    
    // Action types
    actionOpenApp: '打開應用程式',
    actionCheckMessages: '檢查訊息',
    actionAnalyzeScreen: '分析螢幕',
    actionMakeCall: '撥打電話',
    actionSendMessage: '發送訊息',
    actionSearchWeb: '搜尋網絡',
    actionNone: '僅分析',
    executeAction: '執行',
    youSaid: '您說：',
    microphoneRequiresHttps: '麥克風需要 HTTPS 或本機連線。請改用文字輸入。',
    
    // Family Alert
    notifyFamily: '通知家人',
    familyAlert: '家人警示',
    alertDetected: '已偵測',
    alertWarning: '此訊息似乎是詐騙。您想通知您的家人嗎？',
    alertPrepared: '警示已準備好！點擊下方發送給您的家人。',
    alertMessage: '警示訊息：',
    sending: '發送中...',
    dismiss: '關閉',
    open: '打開',
    done: '完成',
    
    // Emergency Contacts
    emergencyContacts: '緊急聯絡人',
    addContact: '新增',
    addEmergencyContact: '新增緊急聯絡人',
    editContact: '編輯聯絡人',
    deleteContact: '刪除聯絡人？',
    deleteContactConfirm: '確定要刪除此聯絡人嗎？',
    delete: '刪除',
    noContacts: '尚未設定緊急聯絡人。新增家人以接收警示。',
    name: '姓名',
    namePlaceholder: '例如：媽咪、阿仔',
    phone: '電話',
    platform: '平台',
    relationship: '關係（選填）',
    relationshipPlaceholder: '例如：兒子、女兒',
    save: '儲存',
  },
  
  'zh-CN': {
    // App Title
    appTitle: 'FraudGuard HK',
    appSubtitle: '您的 AI 防骗检测助手',
    
    // Navigation
    settings: '设置',
    switchToChatMode: '切换至聊天模式',
    switchToElderlyMode: '长者模式',
    
    // Elderly Mode
    needHelp: '需要帮忙检查吗？',
    tapButtonInstruction: '点击下方按钮并说出您的问题',
    helpMeCheck: '帮我检查',
    tapAndSpeak: '点击说话',
    tapToStop: '点击停止',
    listening: '正在聆听...',
    checkingForYou: '正在为您检查...',
    youSaid: '您说：',
    voiceInput: '语音',
    textInput: '文字',
    useTextInput: '改用文字输入',
    analyze: '分析',
    placeholder: '输入或贴上可疑消息...',
    tapAndSpeakShort: '点击说话',
    
    // Examples
    exampleTitle: '您可以这样说：',
    example1: '「检查这个消息是否诈骗」',
    example2: '「这封邮件安全吗？」',
    example3: '「有人要我汇款」',
    
    // Risk Levels
    safe: '安全 - 未发现问题',
    lowRisk: '低风险 - 请注意',
    mediumRisk: '中风险 - 请小心',
    highRisk: '高风险 - 警告！',
    critical: '危险！切勿继续！',
    analysisComplete: '分析完成',
    
    // Details
    details: '详情：',
    whatToDo: '建议行动：',
    similarCases: '相关已验证案例：',
    
    // Actions
    readAloud: '朗读结果',
    speaking: '正在朗读...',
    checkAnother: '检查其他',
    tryAgain: '重试',
    
    // Error
    somethingWentWrong: '出了点问题',
    microphoneRequiresHttps: '麦克风需要 HTTPS 或本机连接',
    microphonePermissionDenied: '麦克风权限被拒绝',
    
    // Buttons
    analyze: '分析',
    placeholder: '输入或贴上可疑消息...',
    
    // Default Mode
    welcomeTitle: 'FraudGuard HK',
    welcomeSubtitle: '我帮您识别诈骗和欺诈行为。请让我分析任何消息、邮件或可疑内容。',
    placeholder: '请输入要检查的内容...',
    analyzing: '分析中...',
    recommendations: '建议：',
    
    // Chat Examples
    chatExample1: '检查这封邮件是否诈骗',
    chatExample2: '分析这个消息是否有诈骗成分',
    chatExample3: '这个优惠是否太好而不真实？',
    
    // Settings Dialog
    settingsTitle: 'FraudGuard HK 设置',
    settingsDescription: '配置您的防骗助手',
    
    // AI Engine
    aiEngine: 'AI 引擎',
    aiEngineDescription: '选择用于诈骗检测的 AI 引擎',
    glmEngine: 'GLM 引擎（推荐）',
    glmDescription: 'GLM-4（对话/推理）+ GLM-4V（视觉）经由 BigModel',
    qwenEngine: 'Qwen 引擎',
    qwenDescription: 'Qwen 3.5 Plus（对话）+ Qwen VL OCR（视觉）经由 DashScope',
    bestForPlanning: '擅长规划',
    visionCapable: '支持视觉分析',
    fastResponse: '快速响应',
    ocrCapable: '支持 OCR',
    
    // Voice Settings
    voiceSettings: '语音设置',
    autoSpeakResponses: '自动朗读结果',
    autoSpeakDescription: '自动读出分析结果',
    slowerSpeech: '较慢语速',
    slowerSpeechDescription: '以较慢速度朗读以便更清晰',
    
    // Accessibility
    accessibility: '无障碍设置',
    highContrastMode: '高对比模式',
    highContrastDescription: '提高视觉对比度以便更清晰',
    largeText: '大字体',
    largeTextDescription: '在整个应用程序中使用较大的字体',
    
    // RAG Settings
    ragSettings: '知识库',
    ragEnabled: '启用 RAG 分析',
    ragEnabledDescription: '与已验证诈骗案例数据库交叉比对',
    ragCasesCount: '数据库中的已验证诈骗案例',
    
    // About
    about: '关于 FraudGuard HK',
    aboutDescription: 'FraudGuard HK 是一款 AI 驱动的防骗助手，旨在保护香港用户免受诈骗、钓鱼企图和欺诈消息的侵害。',
    aboutModes: '此应用程序支持两种模式：长者模式（语音优先、简化界面）和标准模式（聊天界面、详细分析）。',
    aboutRag: '采用 RAG 技术，与 606 宗 HK01 已验证诈骗案例交叉比对。',
    
    // Emergency Contacts
    emergencyContacts: '紧急联络人',
    emergencyContactsDescription: '当检测到高风险诈骗时会通知家人',
    addContact: '新增',
    addContactHint: '点击「新增」以加入联络人',
    contactName: '姓名',
    contactNamePlaceholder: '例如：妈妈',
    contactPhone: '电话',
    contactRelationship: '关系',
    contactRelationshipPlaceholder: '例如：家人、朋友',
    noContacts: '尚未设定紧急联络人',
    
    // Buttons
    cancel: '取消',
    saveChanges: '保存更改',
    
    // Language
    language: '语言',
    languageAutoDetect: '语音输入会自动使用选择的语言',
    imageInput: '图片',
    uploadImagePrompt: '点击上传截图',
    uploadImageHint: '截取可疑消息的画面',
    
    // Powered by
    poweredBy: '技术支持：',
    
    // Footer
    footer: 'FraudGuard HK',
    
    // Loading
    loading: '加载 FraudGuard HK...',
    
    // Autonomous Agent
    autonomousMode: '自主模式',
    autonomousDescription: '让 AI 自动检查您的消息',
    startAutoCheck: '开始自动检查',
    stopAutoCheck: '停止自动检查',
    agentStatus: '代理状态',
    agentIdle: '闲置',
    agentWorking: '工作中',
    agentLastAction: '上次行动',
    
    // Action types
    actionOpenApp: '打开应用程序',
    actionCheckMessages: '检查消息',
    actionAnalyzeScreen: '分析屏幕',
    actionMakeCall: '拨打电话',
    actionSendMessage: '发送消息',
    actionSearchWeb: '搜索网络',
    actionNone: '仅分析',
    executeAction: '执行',
    youSaid: '您说：',
    microphoneRequiresHttps: '麦克风需要 HTTPS 或本机连接。请改用文字输入。',
    
    // Family Alert
    notifyFamily: '通知家人',
    familyAlert: '家人警示',
    alertDetected: '已检测',
    alertWarning: '此消息似乎是诈骗。您想通知您的家人吗？',
    alertPrepared: '警示已准备好！点击下方发送给您的家人。',
    alertMessage: '警示消息：',
    sending: '发送中...',
    dismiss: '关闭',
    open: '打开',
    done: '完成',
    
    // Emergency Contacts
    emergencyContacts: '紧急联络人',
    addContact: '新增',
    addEmergencyContact: '新增紧急联络人',
    editContact: '编辑联络人',
    deleteContact: '删除联络人？',
    deleteContactConfirm: '确定要删除此联络人吗？',
    delete: '删除',
    noContacts: '尚未设定紧急联络人。新增家人以接收警示。',
    name: '姓名',
    namePlaceholder: '例如：妈妈、儿子',
    phone: '电话',
    platform: '平台',
    relationship: '关系（选填）',
    relationshipPlaceholder: '例如：儿子、女儿',
    save: '保存',
  }
} as const;

export type TranslationKey = keyof typeof translations.en;
