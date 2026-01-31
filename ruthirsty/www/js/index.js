/**
 * 喝水打卡应用
 */

// 存储键名
const STORAGE_KEY = 'waterRecords';
const SETTINGS_KEY = 'waterSettings';

// 应用状态
let records = [];
let settings = {
    dailyGoal: 2000,
    lastResetDate: ''
};

// 检测是否在Cordova环境中
function isCordovaApp() {
    return typeof cordova !== 'undefined';
}

// 初始化入口
function initialize() {
    if (isCordovaApp()) {
        // Cordova环境：等待deviceready事件
        document.addEventListener('deviceready', onDeviceReady, false);
    } else {
        // 浏览器环境：等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', onDeviceReady);
        } else {
            // DOM已经加载完成
            onDeviceReady();
        }
    }
}

function onDeviceReady() {
    if (isCordovaApp()) {
        console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    } else {
        console.log('Running in browser mode');
    }

    // 初始化应用
    initApp();
}

// 启动初始化
initialize();

/**
 * 初始化应用
 */
function initApp() {
    // 加载设置
    loadSettings();

    // 检查并重置（如果是新的一天）
    checkAndResetIfNewDay();

    // 加载记录
    loadRecords();

    // 绑定事件
    document.getElementById('checkInBtn').addEventListener('click', handleCheckIn);
    document.getElementById('clearBtn').addEventListener('click', handleClear);
    document.getElementById('settingsBtn').addEventListener('click', handleSettingsClick);

    // 更新显示
    updateDisplay();
}

/**
 * 从本地存储加载记录
 */
function loadRecords() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            records = JSON.parse(stored);
            // 过滤出今天的记录
            records = getTodayRecords(records);
        } else {
            records = [];
        }
    } catch (e) {
        console.error('加载记录失败:', e);
        records = [];
    }
}

/**
 * 保存记录到本地存储
 */
function saveRecords() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
        console.error('保存记录失败:', e);
        alert('保存失败，请检查存储空间');
    }
}

/**
 * 获取今天的记录
 */
function getTodayRecords(allRecords) {
    const today = new Date();
    const todayStr = formatDate(today);

    return allRecords.filter(record => {
        const recordDate = new Date(record.timestamp);
        return formatDate(recordDate) === todayStr;
    });
}

/**
 * 格式化日期为 YYYY-MM-DD
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * 格式化时间为 HH:MM:SS
 */
function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

/**
 * 处理打卡
 */
function handleCheckIn() {
    // 显示数量输入模态框
    showAmountInputModal();
}

/**
 * Show amount input modal
 */
function showAmountInputModal() {
    const modal = createModal({
        title: '💧 记录饮水量',
        body: `
            <div class="amount-input-container">
                <input type="number"
                       class="amount-input-field"
                       id="amountInput"
                       placeholder="250"
                       min="1"
                       max="2000"
                       value="250">
                <div class="amount-hint">输入饮水量 (ml)</div>
                <div class="quick-amounts">
                    <button class="quick-amount-btn" data-amount="100">100ml</button>
                    <button class="quick-amount-btn" data-amount="250">250ml</button>
                    <button class="quick-amount-btn" data-amount="500">500ml</button>
                    <button class="quick-amount-btn" data-amount="750">750ml</button>
                </div>
            </div>
        `,
        footer: `
            <button class="modal-btn modal-btn-secondary" id="cancelAmountBtn">取消</button>
            <button class="modal-btn modal-btn-primary" id="confirmAmountBtn">确认</button>
        `
    });

    showModal(modal);

    // 自动聚焦输入框
    setTimeout(() => {
        const input = document.getElementById('amountInput');
        input.focus();
        input.select();
    }, 100);

    // 绑定快捷按钮
    document.querySelectorAll('.quick-amount-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const amount = parseInt(e.target.dataset.amount);
            document.getElementById('amountInput').value = amount;
        });
    });

    // 绑定确认按钮
    document.getElementById('cancelAmountBtn').addEventListener('click', hideModal);
    document.getElementById('confirmAmountBtn').addEventListener('click', handleConfirmAmount);

    // 回车键确认
    document.getElementById('amountInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleConfirmAmount();
        }
    });
}

/**
 * Handle confirm amount
 */
function handleConfirmAmount() {
    const input = document.getElementById('amountInput');
    const amount = parseInt(input.value);

    if (!amount || amount < 1 || amount > 2000) {
        alert('请输入有效的饮水量 (1-2000ml)');
        return;
    }

    addWaterRecord(amount);
    hideModal();
}

/**
 * Add water record with amount
 */
function addWaterRecord(amount) {
    const previousTotal = records.reduce((sum, record) => sum + (record.amount || 0), 0);
    const wasGoalReached = previousTotal >= settings.dailyGoal;

    const now = new Date();
    const record = {
        id: Date.now(),
        timestamp: now.toISOString(),
        date: formatDate(now),
        time: formatTime(now),
        amount: amount
    };

    // 添加记录
    records.unshift(record);

    // 保存
    saveRecords();

    // 更新显示
    updateDisplay();

    // 显示反馈
    showFeedback();

    // 检查是否达到目标
    const newTotal = records.reduce((sum, record) => sum + (record.amount || 0), 0);
    if (!wasGoalReached && newTotal >= settings.dailyGoal) {
        // 首次达到目标，显示庆祝动画
        setTimeout(() => {
            showCelebration();
        }, 500);
    }
}

/**
 * 显示打卡反馈
 */
function showFeedback() {
    const btn = document.getElementById('checkInBtn');
    btn.classList.add('clicked');

    setTimeout(() => {
        btn.classList.remove('clicked');
    }, 300);
}

/**
 * 处理清空记录
 */
function handleClear() {
    if (records.length === 0) {
        alert('没有记录可以清空');
        return;
    }

    if (confirm('确定要清空今日所有记录吗？')) {
        records = [];
        saveRecords();
        updateDisplay();
    }
}

/**
 * 更新显示
 */
function updateDisplay() {
    // 更新今日次数
    const countElement = document.getElementById('todayCount');
    const newCount = records.length;
    const oldCount = parseInt(countElement.textContent) || 0;

    // 数字变化动画
    if (newCount !== oldCount) {
        countElement.style.animation = 'none';
        setTimeout(() => {
            countElement.style.animation = '';
        }, 10);
    }

    countElement.textContent = newCount;

    // 更新进度环
    updateProgressRing();

    // 更新记录列表
    const recordsList = document.getElementById('recordsList');

    if (records.length === 0) {
        recordsList.innerHTML = '<p class="empty-message">今天还没有喝水记录哦~</p>';
    } else {
        let html = '';
        records.forEach((record, index) => {
            const delay = index * 0.05;
            html += `
                <div class="record-item" style="animation-delay: ${delay}s">
                    <div class="record-number">#${records.length - index}</div>
                    <div class="record-info">
                        <div class="record-time">${record.time}</div>
                        <div class="record-amount">${record.amount}ml</div>
                    </div>
                    <div class="record-icon">💧</div>
                </div>
            `;
        });
        recordsList.innerHTML = html;
    }
}

/**
 * Update progress ring
 */
function updateProgressRing() {
    const totalAmount = records.reduce((sum, record) => sum + (record.amount || 0), 0);
    const percentage = Math.min(100, Math.round((totalAmount / settings.dailyGoal) * 100));

    // 更新百分比文本
    const percentageElement = document.getElementById('progressPercentage');
    percentageElement.textContent = `${percentage}%`;

    // 更新数量文本
    const amountElement = document.getElementById('progressAmount');
    amountElement.textContent = `${totalAmount} / ${settings.dailyGoal}ml`;

    // 更新进度环
    const progressCircle = document.getElementById('progressCircle');
    const circumference = 534.07;
    const offset = circumference * (1 - percentage / 100);
    progressCircle.style.strokeDashoffset = offset;

    // 如果达到100%，添加完成样式
    if (percentage >= 100) {
        progressCircle.classList.add('complete');
        percentageElement.classList.add('complete');
    } else {
        progressCircle.classList.remove('complete');
        percentageElement.classList.remove('complete');
    }
}

/**
 * Modal System Functions
 */

/**
 * Create modal HTML
 */
function createModal(config) {
    const modal = document.createElement('div');
    modal.className = 'modal-card';

    let html = '';

    if (config.title) {
        html += `
            <div class="modal-header">
                <h3 class="modal-title">${config.title}</h3>
            </div>
        `;
    }

    if (config.body) {
        html += `
            <div class="modal-body">
                ${config.body}
            </div>
        `;
    }

    if (config.footer) {
        html += `
            <div class="modal-footer">
                ${config.footer}
            </div>
        `;
    }

    modal.innerHTML = html;
    return modal;
}

/**
 * Show modal
 */
function showModal(modalElement) {
    const overlay = document.getElementById('modalOverlay');
    overlay.innerHTML = '';
    overlay.appendChild(modalElement);

    setTimeout(() => {
        overlay.classList.add('active');
    }, 10);
}

/**
 * Hide modal
 */
function hideModal() {
    const overlay = document.getElementById('modalOverlay');
    overlay.classList.remove('active');

    setTimeout(() => {
        overlay.innerHTML = '';
    }, 300);
}

/**
 * Settings Functions
 */

/**
 * Load settings from localStorage
 */
function loadSettings() {
    try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) {
            settings = JSON.parse(stored);
        } else {
            settings = {
                dailyGoal: 2000,
                lastResetDate: formatDate(new Date())
            };
            saveSettings();
        }
    } catch (e) {
        console.error('加载设置失败:', e);
        settings = {
            dailyGoal: 2000,
            lastResetDate: formatDate(new Date())
        };
    }
}

/**
 * Save settings to localStorage
 */
function saveSettings() {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
        console.error('保存设置失败:', e);
    }
}

/**
 * Handle settings button click
 */
function handleSettingsClick() {
    const modal = createModal({
        title: '⚙️ 设置',
        body: `
            <form class="settings-form" id="settingsForm">
                <div class="settings-group">
                    <label class="settings-label">每日饮水目标 (ml)</label>
                    <input type="number"
                           class="settings-input"
                           id="dailyGoalInput"
                           value="${settings.dailyGoal}"
                           min="500"
                           max="10000"
                           step="100"
                           required>
                    <div class="settings-hint">建议每日饮水量: 1500-3000ml</div>
                </div>
            </form>
        `,
        footer: `
            <button class="modal-btn modal-btn-secondary" id="cancelSettingsBtn">取消</button>
            <button class="modal-btn modal-btn-primary" id="saveSettingsBtn">保存</button>
        `
    });

    showModal(modal);

    // 绑定按钮事件
    document.getElementById('cancelSettingsBtn').addEventListener('click', hideModal);
    document.getElementById('saveSettingsBtn').addEventListener('click', handleSaveSettings);
}

/**
 * Handle save settings
 */
function handleSaveSettings() {
    const goalInput = document.getElementById('dailyGoalInput');
    const newGoal = parseInt(goalInput.value);

    if (newGoal < 500 || newGoal > 10000) {
        alert('请输入有效的目标值 (500-10000ml)');
        return;
    }

    settings.dailyGoal = newGoal;
    saveSettings();
    updateDisplay();
    hideModal();
}

/**
 * Check and reset if new day
 */
function checkAndResetIfNewDay() {
    const today = formatDate(new Date());

    if (settings.lastResetDate !== today) {
        // 新的一天，清空记录
        records = [];
        saveRecords();
        settings.lastResetDate = today;
        saveSettings();
    }
}

/**
 * Celebration Functions
 */

/**
 * Show celebration animation
 */
function showCelebration() {
    const overlay = document.getElementById('celebrationOverlay');
    const confettiContainer = document.getElementById('celebrationConfetti');

    // 生成彩纸
    generateConfetti(confettiContainer);

    // 显示庆祝动画
    overlay.classList.add('active');

    // 3秒后自动隐藏
    setTimeout(() => {
        hideCelebration();
    }, 3000);

    // 点击隐藏
    overlay.addEventListener('click', hideCelebration, { once: true });
}

/**
 * Hide celebration animation
 */
function hideCelebration() {
    const overlay = document.getElementById('celebrationOverlay');
    const confettiContainer = document.getElementById('celebrationConfetti');

    overlay.classList.remove('active');

    // 清理彩纸
    setTimeout(() => {
        confettiContainer.innerHTML = '';
    }, 400);
}

/**
 * Generate confetti particles
 */
function generateConfetti(container) {
    container.innerHTML = '';

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';

        // 随机位置
        confetti.style.left = Math.random() * 100 + '%';

        // 随机延迟
        confetti.style.animationDelay = Math.random() * 0.5 + 's';

        // 随机持续时间
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';

        container.appendChild(confetti);
    }
}
