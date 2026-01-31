/**
 * 喝水打卡应用
 */

// 等待Cordova设备就绪
document.addEventListener('deviceready', onDeviceReady, false);

// 存储键名
const STORAGE_KEY = 'waterRecords';

// 应用状态
let records = [];

function onDeviceReady() {
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);

    // 初始化应用
    initApp();
}

/**
 * 初始化应用
 */
function initApp() {
    // 加载记录
    loadRecords();

    // 绑定事件
    document.getElementById('checkInBtn').addEventListener('click', handleCheckIn);
    document.getElementById('clearBtn').addEventListener('click', handleClear);

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
    const now = new Date();
    const record = {
        id: Date.now(),
        timestamp: now.toISOString(),
        date: formatDate(now),
        time: formatTime(now)
    };

    // 添加记录
    records.unshift(record);

    // 保存
    saveRecords();

    // 更新显示
    updateDisplay();

    // 显示反馈
    showFeedback();
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
    document.getElementById('todayCount').textContent = records.length;

    // 更新记录列表
    const recordsList = document.getElementById('recordsList');

    if (records.length === 0) {
        recordsList.innerHTML = '<p class="empty-message">今天还没有喝水记录哦~</p>';
    } else {
        let html = '';
        records.forEach((record, index) => {
            html += `
                <div class="record-item">
                    <div class="record-number">#${records.length - index}</div>
                    <div class="record-time">${record.time}</div>
                    <div class="record-icon">💧</div>
                </div>
            `;
        });
        recordsList.innerHTML = html;
    }
}
