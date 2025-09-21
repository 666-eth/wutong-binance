// ==UserScript==
// @name         wutong - 币安刷单助手 9.1
// @namespace    https://x.com/wutongge_BTCC
// @version      9.1
// @description  币安刷单助手
// @author       @wutongge_BTCC
// @match        https://www.binance.com/*/alpha/bsc/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/666-eth/wutong-binance/refs/heads/main/wutong-binance.js
// @downloadURL  https://raw.githubusercontent.com/666-eth/wutong-binance/refs/heads/main/wutong-binance.js
// ==/UserScript==

(function() {
    'use strict';

    // === 可拖动参数窗口 ===
    function createDraggablePanel() {
        const panel = document.createElement('div');
        panel.id = 'cex-alpha-panel';
        panel.style.position = 'fixed';
        panel.style.top = '230px';
        panel.style.left = '20px';
        panel.style.transform = '';
        panel.style.zIndex = 99999;
        panel.style.background = '#fff';
        panel.style.border = 'none';
        panel.style.borderRadius = '18px';
        panel.style.boxShadow = '0 8px 32px 0 rgba(31,38,135,0.10), 0 2px 8px 0 rgba(0,0,0,0.10)';
        panel.style.padding = '0 0 18px 0';
        panel.style.minWidth = '340px';
        panel.style.fontFamily = 'system-ui,Segoe UI,Arial,sans-serif';
        panel.style.overflow = 'hidden';

        panel.innerHTML = `
        <div style="height:6px;width:100%;background:linear-gradient(90deg,#4f8cff,#00e0c6);border-radius:18px 18px 0 0;"></div>
        <div id="cex-alpha-panel-header" style="cursor:move;font-weight:bold;margin-bottom:16px;position:relative;letter-spacing:1px;font-size:1.18rem;padding:18px 28px 0 28px;color:#222;">
            wutong - 币安刷单助手 9.1 
            <button id="cex-alpha-panel-close" style="position:absolute;right:18px;top:12px;width:32px;height:32px;border:none;background:#f5f6fa;border-radius:50%;font-size:20px;color:#888;box-shadow:0 2px 8px #e0e0e0;cursor:pointer;transition:background 0.2s,color 0.2s;">×</button>
        </div>
        <div style="padding:0 28px;margin-bottom:12px;">
          <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
            <div style="display:flex;align-items:center;gap:8px;background:#f5f9ff;border:1px solid #e3edff;color:#185adb;border-radius:10px;padding:6px 10px;">
              <span style="font-weight:600;">建议价</span>
              <span id="cex-suggest-price" style="color:#00bfae;font-weight:bold;font-size:1.1em;">--</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;background:#fff7f0;border:1px solid #ffe2cc;color:#a64b2a;border-radius:10px;padding:6px 10px;">
              <span style="font-weight:600;">剩余次数</span>
              <span id="cex-remaining" style="color:#ff6b35;font-weight:bold;font-size:1.1em;">--</span>
            </div>
            <button id="cex-btn-reset-remaining" title="将剩余次数设置为当前循环次数" style="background:#f5f6fa;color:#444;padding:6px 10px;border:1px solid #e5e7eb;border-radius:8px;font-size:0.92em;font-weight:600;cursor:pointer;">重置</button>
            <button id="cex-btn-save" style="background:linear-gradient(90deg,#00BFAE,#22C55E);color:#fff;padding:6px 14px;border:none;border-radius:10px;font-size:0.98em;font-weight:700;box-shadow:0 2px 8px rgba(0,191,174,0.2);cursor:pointer;">保存参数</button>
          </div>
        </div>
        <div style="padding:0 28px;margin-bottom:8px;">
          <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
            <label style="color:#333;font-weight:500;">USDT: 
              <input id="cex-input-volume" type="number" step="1" style="width:120px;background:#fff;border:1.5px solid #e0e0e0;border-radius:8px;color:#222;padding:5px 10px;outline:none;font-size:1em;transition:border-color 0.2s;">
            </label>
            <label style="color:#333;font-weight:500;">循环次数: 
              <input id="cex-input-rounds" type="number" step="1" style="width:90px;background:#fff;border:1.5px solid #e0e0e0;border-radius:8px;color:#222;padding:5px 10px;outline:none;font-size:1em;transition:border-color 0.2s;">
            </label>
            <label style="color:#333;font-weight:500;">超时(秒): 
              <input id="cex-input-timeout" type="number" step="1" style="width:90px;background:#fff;border:1.5px solid #e0e0e0;border-radius:8px;color:#222;padding:5px 10px;outline:none;font-size:1em;transition:border-color 0.2s;">
            </label>
          </div>
        </div>
        <div style="margin-bottom:12px;padding:0 24px;display:flex;gap:10px;">
          <button id="cex-btn-start" style="flex:1;background:linear-gradient(90deg,#00C853,#00E5FF);color:#fff;padding:10px 18px;border:none;border-radius:12px;font-size:1.06em;font-weight:700;box-shadow:0 4px 14px rgba(0,200,83,0.25);cursor:pointer;">启动</button>
          <button id="cex-btn-stop" style="flex:1;background:linear-gradient(90deg,#FF3D00,#D50000);color:#fff;padding:10px 18px;border:none;border-radius:12px;font-size:1.06em;font-weight:700;box-shadow:0 4px 14px rgba(213,0,0,0.25);cursor:pointer;">停止</button>
          <button id="cex-btn-quick-sell" style="flex:1;background:linear-gradient(90deg,#FF6A00,#FF3D00);color:#fff;padding:10px 18px;border:none;border-radius:12px;font-size:1.06em;font-weight:700;box-shadow:0 4px 14px rgba(255,106,0,0.25);cursor:pointer;">快卖</button>
        </div>
        <div style="margin-bottom:18px;padding:0 24px;display:flex;gap:10px;">
          <button id="cex-btn-lock" style="flex:1;background:linear-gradient(90deg,#00B4DB,#0083B0);color:#fff;padding:10px 18px;border:none;border-radius:12px;font-size:1.02em;font-weight:700;box-shadow:0 2px 8px rgba(0,131,176,0.25);cursor:pointer;">锁一手价</button>
          <button id="cex-btn-stat" style="flex:1;background:linear-gradient(90deg,#5C6BC0,#42A5F5);color:#fff;padding:10px 18px;border:none;border-radius:12px;font-size:1.02em;font-weight:700;box-shadow:0 2px 8px rgba(66,165,245,0.25);cursor:pointer;">统计</button>
          <button id="cex-btn-stat-history" style="flex:1;background:linear-gradient(90deg,#F9A825,#F57C00);color:#fff;padding:10px 18px;border:none;border-radius:12px;font-size:1.02em;font-weight:700;box-shadow:0 2px 8px rgba(245,124,0,0.25);cursor:pointer;">历史</button>
        </div>
        <div id="cex-alpha-panel-log" style="font-size:13px;color:#222;background:#f5f6fa;border-radius:8px;height:120px;overflow:auto;padding:8px 12px;margin:0 28px;box-shadow:0 0 8px #e0e0e0 inset;"></div>
        <style>
        #cex-alpha-panel button:hover { filter: brightness(1.05) saturate(1.05); }
        #cex-alpha-panel input:focus { border-color: #4f8cff!important; box-shadow:0 0 6px #4f8cff22 inset; }
        #cex-alpha-panel-close:hover { background:#4f8cff; color:#fff; }
        </style>
        `;
        document.body.appendChild(panel);

        // 关闭按钮
        panel.querySelector('#cex-alpha-panel-close').onclick = function() {
            panel.remove();
        };

        // 拖动实现
        let isDragging = false, offsetX = 0, offsetY = 0;
        const header = panel.querySelector('#cex-alpha-panel-header');
        header.addEventListener('mousedown', function(e) {
            if (e.target.id === 'cex-alpha-panel-close') return;
            isDragging = true;
            offsetX = e.clientX - panel.getBoundingClientRect().left;
            offsetY = e.clientY - panel.getBoundingClientRect().top;
            document.body.style.userSelect = 'none';
            e.preventDefault();
        });
        document.addEventListener('mousemove', function(e) {
            if (isDragging) {
                panel.style.left = (e.clientX - offsetX) + 'px';
                panel.style.top = (e.clientY - offsetY) + 'px';
                panel.style.transform = '';
                // 同步历史统计面板位置（若用户未手动拖动过统计面板）
                try {
                    const statDiv = document.getElementById('wutong-stat-result');
                    if (statDiv && !window.__wutong_stat_user_moved) {
                        const rect = panel.getBoundingClientRect();
                        statDiv.style.left = (rect.right + 10) + 'px';
                        statDiv.style.top = rect.top + 'px';
                    }
                } catch (e2) {}
            }
        });
        document.addEventListener('mouseup', function() {
            isDragging = false;
            document.body.style.userSelect = '';
        });
    }

    // 建议价变量
    let SUGGEST_PRICE = null;

    // 自动获取建议价函数（下单前自动调用）
    // 支持type参数，先切换到买入/卖出tab
    async function fetchSuggestPrice(type = 'buy') {
        // 1. 切换到买入/卖出tab
        const tabText = type === 'buy' ? '买入' : '卖出';
        const tabs = Array.from(document.querySelectorAll('.bn-tab.bn-tab__buySell'));
        const tab = tabs.find(tab => tab.textContent.trim() === tabText);
        if (tab) {
            tab.click();
            await new Promise(r => setTimeout(r, 200));
        }
        // 2. 先切换到市价tab再切回限价tab，强制刷新价格div
        const marketTab = document.querySelector('#bn-tab-MARKET');
        const limitTab = document.querySelector('#bn-tab-LIMIT');
        if (marketTab && limitTab) {
            marketTab.click();
            await new Promise(r => setTimeout(r, 200));
            limitTab.click();
            await new Promise(r => setTimeout(r, 200));
        } else if (limitTab) {
            limitTab.click();
            await new Promise(r => setTimeout(r, 200));
        }
        // 3. 查找最新价格div
        const priceDivs = Array.from(document.querySelectorAll('div.text-PrimaryText.cursor-pointer'));
        let price = null;
        let priceDiv = null;
        for (const div of priceDivs) {
            if (div.textContent.trim().startsWith('$')) {
                price = div.textContent.trim().replace('$', '');
                priceDiv = div;
                break;
            }
        }
        if (priceDiv) {
            priceDiv.click(); // 模拟点击建议价div
            await new Promise(r => setTimeout(r, 200));
            // 读取输入框的值作为最终建议价
            const input = document.querySelector('#limitPrice');
            if (input && input.value) {
                SUGGEST_PRICE = parseFloat(input.value);
            } else {
                SUGGEST_PRICE = parseFloat(price);
            }
        } else {
            SUGGEST_PRICE = null;
        }
        // 显示到面板
        const priceSpan = document.getElementById('cex-suggest-price');
        if (SUGGEST_PRICE) {
            if (priceSpan) priceSpan.innerText = SUGGEST_PRICE;
            logit('已获取建议价:', SUGGEST_PRICE);
        } else {
            if (priceSpan) priceSpan.innerText = '--';
            logit('未找到建议价，请确认页面结构');
        }
        return SUGGEST_PRICE;
    }

    // === 参数与逻辑 ===
    // 默认参数

    let ORDER_VOLUME = 255;
    let MAX_TRADES = 65;
    let ORDER_TIMEOUT_MS = 5000; // 单位: 毫秒（默认5秒）
    let ABORT_ON_PRICE_WARNING = false;
    let stopTrading = true;

    // 本地存储
    const STORAGE_KEY = 'wutong_shuju';
    const BACKUP_STORAGE_KEY = 'wutong_shuju2';
    const STAT_STORAGE_KEY = 'wutong_stat_result';
    let REMAINING_TRADES = null; // 持久化的剩余次数

    function updateRemainingDisplay() {
        const el = document.getElementById('cex-remaining');
        if (el) {
            if (typeof REMAINING_TRADES === 'number' && !isNaN(REMAINING_TRADES)) {
                el.innerText = REMAINING_TRADES;
            } else {
                el.innerText = '--';
            }
        }
    }
    function saveParamsToStorage() {
        try {
            const data = {
                ORDER_VOLUME,
                MAX_TRADES,
                ORDER_TIMEOUT_MS,
                ABORT_ON_PRICE_WARNING,
                remainingTrades: REMAINING_TRADES
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            logit('参数已保存');
        } catch (e) {
            console.warn('保存参数失败:', e);
        }
    }
    function saveBackupParamsToStorage() {
        try {
            const data = {
                ORDER_VOLUME,
                MAX_TRADES,
                ORDER_TIMEOUT_MS,
                ABORT_ON_PRICE_WARNING
            };
            localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(data));
            logit('备份参数已保存到', BACKUP_STORAGE_KEY);
        } catch (e) {
            console.warn('保存备份参数失败:', e);
        }
    }
    function loadParamsFromStorage() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const data = JSON.parse(raw);
            if (typeof data.ORDER_VOLUME === 'number' && !isNaN(data.ORDER_VOLUME)) ORDER_VOLUME = data.ORDER_VOLUME;
            if (typeof data.MAX_TRADES === 'number' && !isNaN(data.MAX_TRADES)) MAX_TRADES = data.MAX_TRADES;
            if (typeof data.ORDER_TIMEOUT_MS === 'number' && !isNaN(data.ORDER_TIMEOUT_MS)) ORDER_TIMEOUT_MS = data.ORDER_TIMEOUT_MS;
            if (typeof data.ABORT_ON_PRICE_WARNING === 'boolean') ABORT_ON_PRICE_WARNING = data.ABORT_ON_PRICE_WARNING;
            if (typeof data.remainingTrades === 'number' && !isNaN(data.remainingTrades)) REMAINING_TRADES = data.remainingTrades;
            logit('已从本地加载参数');
        } catch (e) {
            console.warn('读取参数失败:', e);
        }
    }

    function resetParamsFromBackup() {
        try {
            const raw = localStorage.getItem(BACKUP_STORAGE_KEY);
            if (!raw) {
                logit('未找到备份参数，无法重置');
                return;
            }
            const data = JSON.parse(raw);
            if (typeof data.ORDER_VOLUME === 'number' && !isNaN(data.ORDER_VOLUME)) ORDER_VOLUME = data.ORDER_VOLUME;
            if (typeof data.MAX_TRADES === 'number' && !isNaN(data.MAX_TRADES)) MAX_TRADES = data.MAX_TRADES;
            if (typeof data.ORDER_TIMEOUT_MS === 'number' && !isNaN(data.ORDER_TIMEOUT_MS)) ORDER_TIMEOUT_MS = data.ORDER_TIMEOUT_MS;
            if (typeof data.ABORT_ON_PRICE_WARNING === 'boolean') ABORT_ON_PRICE_WARNING = data.ABORT_ON_PRICE_WARNING;
            REMAINING_TRADES = MAX_TRADES;
            saveParamsToStorage();
            // 更新UI
            const volEl = document.getElementById('cex-input-volume');
            const roundsEl = document.getElementById('cex-input-rounds');
            const timeoutEl = document.getElementById('cex-input-timeout');
            const abortEl = document.getElementById('cex-input-abort');
            if (volEl) volEl.value = ORDER_VOLUME;
            if (roundsEl) roundsEl.value = MAX_TRADES;
            if (timeoutEl) timeoutEl.value = Math.floor(ORDER_TIMEOUT_MS);
            if (abortEl) abortEl.checked = ABORT_ON_PRICE_WARNING;
            updateRemainingDisplay();
            logit('已从备份重置参数并刷新剩余次数');
        } catch (e) {
            console.warn('从备份重置失败:', e);
        }
    }

    // 日志输出到面板
    function logit() {
        const args = Array.from(arguments);
        const timestamp = new Date().toLocaleTimeString();
        const prefix = `[${timestamp}]`;
        const msg = args.map(x => typeof x === 'object' ? JSON.stringify(x) : x).join(' ');
        const logDiv = document.getElementById('cex-alpha-panel-log');
        if (logDiv) {
            logDiv.innerText += `\n${prefix} ${msg}`;
            logDiv.scrollTop = logDiv.scrollHeight;
        }
        // 也输出到控制台
        console.log(prefix, ...args);
    }

    // 绑定面板事件
    function bindPanelEvents() {
        // 先加载已保存的参数
        loadParamsFromStorage();
        document.getElementById('cex-input-volume').value = ORDER_VOLUME;
        document.getElementById('cex-input-rounds').value = MAX_TRADES;
        document.getElementById('cex-input-timeout').value = Math.floor(ORDER_TIMEOUT_MS/1000);
        (function(){ const el = document.getElementById('cex-input-abort'); if (el) el.checked = ABORT_ON_PRICE_WARNING; })();
        updateRemainingDisplay();

        document.getElementById('cex-btn-start').onclick = function() {
            ORDER_VOLUME = parseFloat(document.getElementById('cex-input-volume').value);
            MAX_TRADES = parseInt(document.getElementById('cex-input-rounds').value);
            ORDER_TIMEOUT_MS = parseInt(document.getElementById('cex-input-timeout').value) * 1000;
            (function(){ const el = document.getElementById('cex-input-abort'); ABORT_ON_PRICE_WARNING = el ? el.checked : false; })();
            // 启动时决定是否继续未完成的剩余次数
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (raw) {
                    const data = JSON.parse(raw);
                    if (typeof data.remainingTrades === 'number' && data.remainingTrades > 0) {
                        REMAINING_TRADES = data.remainingTrades;
                        logit('检测到未完成的剩余次数，继续执行。剩余:', REMAINING_TRADES);
                    } else {
                        REMAINING_TRADES = MAX_TRADES;
                    }
                } else {
                    REMAINING_TRADES = MAX_TRADES;
                }
            } catch (e) {
                REMAINING_TRADES = MAX_TRADES;
            }
            saveParamsToStorage();
            updateRemainingDisplay();
            stopTrading = false;
            logit('参数已更新，开始自动交易...');
            startTrading();
        };
        document.getElementById('cex-btn-stop').onclick = function() {
            stopTrading = true;
            logit('停止交易刷新页面');
            setTimeout(() => location.reload(), 200);
        };
        document.getElementById('cex-btn-stat').onclick = function() {
            runStat();
        };
        const histBtn = document.getElementById('cex-btn-stat-history');
        if (histBtn) {
            histBtn.onclick = function() {
                showSavedStat();
            };
        }
        const saveBtn = document.getElementById('cex-btn-save');
        if (saveBtn) {
            saveBtn.onclick = function() {
                ORDER_VOLUME = parseFloat(document.getElementById('cex-input-volume').value);
                MAX_TRADES = parseInt(document.getElementById('cex-input-rounds').value);
                ORDER_TIMEOUT_MS = parseInt(document.getElementById('cex-input-timeout').value) * 1000;
                (function(){ const el = document.getElementById('cex-input-abort'); ABORT_ON_PRICE_WARNING = el ? el.checked : false; })();
                // 仅保存参数，不重置剩余次数，避免统计被覆盖
                saveParamsToStorage();
                // 另外保存一份备份参数
                saveBackupParamsToStorage();
                updateRemainingDisplay();
            };
        }
        const resetRemainBtn = document.getElementById('cex-btn-reset-remaining');
        if (resetRemainBtn) {
            resetRemainBtn.onclick = function() {
                MAX_TRADES = parseInt(document.getElementById('cex-input-rounds').value);
                if (!isFinite(MAX_TRADES) || MAX_TRADES <= 0) return;
                REMAINING_TRADES = MAX_TRADES;
                saveParamsToStorage();
                updateRemainingDisplay();
                logit('已将剩余次数重置为循环次数:', REMAINING_TRADES);
            };
        }
        // 锁定一手价按钮（完全按照你提供的实现）
        const lockBtn = document.getElementById('cex-btn-lock');
        const quickSellBtn = document.getElementById('cex-btn-quick-sell');
        if (lockBtn) {
            let priceUpdateInterval = null;
            function updatePrice() {
                // 判断当前是否是买入窗口（按你的选择器）
                const buyTab = document.querySelector('#bn-tab-0');
                const isBuyTabActive = buyTab && buyTab.classList && buyTab.classList.contains('active');
                // 如果有正在运行的 interval 需要清除
                if (priceUpdateInterval) {
                    clearInterval(priceUpdateInterval);
                }
                // 设置新的 interval 更新价格
                priceUpdateInterval = setInterval(() => {
                    let priceValue = '';
                    let finalPrice = 0;
                    if (isBuyTabActive) {
                        // 如果是买入窗口，选择“卖出”价格（按你的选择器）
                        const priceElement = document.querySelector('div.flex-1.cursor-pointer[style*="--color-Buy"]');
                        priceValue = priceElement ? priceElement.textContent.trim() : '';
                        if (priceValue) {
                            finalPrice = parseFloat(priceValue) * 1.00001;  // 买入价格乘以 1.00001
                        }
                    } else {
                        // 如果是卖出窗口，选择“买入”价格（按你的选择器）
                        const priceElement = document.querySelector('div.flex-1.cursor-pointer[style*="--color-Sell"]');
                        priceValue = priceElement ? priceElement.textContent.trim() : '';
                        if (priceValue) {
                            finalPrice = parseFloat(priceValue) * 0.9999;  // 卖出价格乘以 0.9999
                        }
                    }
                    // 更新到输入框
                    const limitPriceInput = document.querySelector('#limitPrice');
                    if (limitPriceInput && finalPrice) {
                        setInputValue(limitPriceInput, Number(finalPrice).toFixed(8));
                    }
                }, 100); // 每100ms更新一次
            }
            lockBtn.onclick = function() {
                updatePrice();
                // 监听 tab 切换事件，动态重新调用 updatePrice（按你的实现）
                document.querySelectorAll('.bn-tab').forEach(tab => {
                    tab.addEventListener('click', () => {
                        updatePrice();
                    });
                });
                logit('锁定一手价已启动');
            };
        }
        // 快卖按钮：执行统一的“快卖”函数
        if (quickSellBtn) {
            quickSellBtn.onclick = async function() {
                await performQuickSell();
            };
        }
    }

    // 复用“快卖”逻辑为函数，供按钮和自动触发调用
    async function performQuickSell() {
        try {
            async function handleQuickSellModals() {
                // 下单手滑提醒
                try {
                    const confirmModal = await waitForElement(SELECTORS.confirmModal, null, null, 3, 200, 100);
                    if (confirmModal && confirmModal.textContent.includes('下单手滑提醒')) {
                        const continueButton = await waitForElement(() => {
                            const dialog = document.querySelector('div[role="dialog"]') || document.querySelector(SELECTORS.confirmModal);
                            if (!dialog) return null;
                            const buttons = dialog.querySelectorAll('button');
                            return Array.from(buttons).find(btn => btn.textContent.includes('继续'));
                        }, null, null, 5, 120, 0);
                        if (continueButton) {
                            continueButton.click();
                            logit('快卖：已点击下单手滑提醒继续');
                        }
                    }
                } catch (e) {}
                // 预估手续费
                try {
                    const feeModal = await waitForElement(SELECTORS.feeModal, null, null, 3, 200, 0);
                    if (feeModal && feeModal.textContent.includes('预估手续费')) {
                        const confirmButton = await waitForElement(() => {
                            const dialog = document.querySelector('div[role="dialog"]') || document.querySelector(SELECTORS.feeModal);
                            if (!dialog) return null;
                            const buttons = dialog.querySelectorAll('button');
                            return Array.from(buttons).find(btn => btn.textContent.includes('继续'));
                        }, null, null, 5, 120, 0);
                        if (confirmButton) {
                            confirmButton.click();
                            logit('快卖：已点击预估手续费继续');
                        }
                    }
                } catch (e) {}
            }
            async function clickSellTab() {
                const activeTab = document.querySelector('.bn-tab.bn-tab__buySell[aria-selected="true"]');
                if (activeTab && activeTab.textContent.trim() === '卖出') {
                    return true;
                }
                await new Promise(resolve => setTimeout(resolve, 200));
                const tabs = Array.from(document.querySelectorAll('.bn-tab.bn-tab__buySell'));
                const sellTab = tabs.find(el => el.textContent.trim() === '卖出');
                if (!sellTab) return false;
                sellTab.click();
                await new Promise(resolve => setTimeout(resolve, 200));
                return true;
            }
            function setSliderMax() {
                const getSlider = () => {
                    const list = Array.from(document.querySelectorAll('input[role="slider"]'));
                    return list.find(el => el.offsetParent !== null) || list[0] || null;
                };
                const slider = getSlider();
                if (!slider) return;
                const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
                setter.call(slider, '100');
                slider.dispatchEvent(new Event('input', { bubbles: true }));
                slider.dispatchEvent(new Event('change', { bubbles: true }));
            }
            const ok = await clickSellTab();
            if (!ok) { logit('快卖：未找到卖出tab'); return; }
            setSliderMax();
            let sellBtn = document.querySelector('button.bn-button__sell');
            if (sellBtn) { sellBtn.click(); }
            await new Promise(resolve => setTimeout(resolve, 300));
            await handleQuickSellModals();
            let btn2 = document.evaluate('//*[@id="__APP"]/div[3]/div/div/button', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if (btn2) btn2.click();
            await handleQuickSellModals();
            logit('已执行快卖');
        } catch (e) {
            logit('快卖执行异常:', e);
        }
    }

    // 检查买入面板是否出现“余额不足”提示
    function hasInsufficientBalanceBanner() {
        try {
            // 优先精准匹配错误提示样式
            const errNodes = Array.from(document.querySelectorAll('.text-Error, .text-Error *'));
            if (errNodes.some(el => el && typeof el.textContent === 'string' && el.textContent.trim().includes('余额不足'))) {
                return true;
            }
            // 兜底：附近含“添加USDT余额”按钮也视为余额不足区域
            const addBtns = Array.from(document.querySelectorAll('button.bn-button__primary'));
            if (addBtns.some(btn => btn && typeof btn.textContent === 'string' && btn.textContent.trim().includes('添加USDT余额'))) {
                return true;
            }
            // 最后再全局模糊匹配一次
            const candidates = Array.from(document.querySelectorAll('div, span, p'));
            return candidates.some(el => el && typeof el.textContent === 'string' && el.textContent.trim().includes('余额不足'));
        } catch (e) {
            return false;
        }
    }

    // 检测余额不足后，刷新并恢复为：先尝试卖出，再继续自动循环
    async function resumeAfterInsufficient() {
        try {
            // 先尝试卖出一轮（按限价逻辑），以释放资金
            try {
                logit('不足自动恢复：尝试先卖出以恢复余额');
                const sellResult = await sell(ORDER_VOLUME, ABORT_ON_PRICE_WARNING);
                logit('不足自动恢复：卖出返回', sellResult);
            } catch (e) {
                logit('不足自动恢复：卖出异常', e);
            }
            // 然后继续正常自动循环（不重置剩余次数）
            stopTrading = false;
            logit('不足自动恢复：继续自动买卖循环');
            startTrading();
        } catch (e) {
            console.warn('resumeAfterInsufficient error:', e);
        }
    }

    // 仅继续循环（不再尝试额外卖出）
    async function resumeContinueOnly() {
        try {
            stopTrading = false;
            logit('刷新后：继续自动买卖循环');
            startTrading();
        } catch (e) {
            console.warn('resumeContinueOnly error:', e);
        }
    }

    // 监听下单接口返回，若余额不足则刷新并在刷新后自动卖出
    function setupOrderPlaceMonitor() {
        try {
            const RESUME_KEY = 'wutong_auto_resume_after_reload';
            const RESUME_CONTINUE_KEY = 'wutong_auto_resume_continue_only';
            const markAndReload = () => {
                try { localStorage.setItem(RESUME_KEY, '1'); } catch (e) {}
                setTimeout(() => location.reload(), 200);
            };
            // fetch 代理
            if (window.fetch && !window.__wutong_fetch_patched) {
                const originalFetch = window.fetch.bind(window);
                window.fetch = async function() {
                    const args = arguments;
                    let url = '';
                    try {
                        url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url) ? args[0].url : '';
                    } catch (e) { url = ''; }
                    const res = await originalFetch.apply(window, args);
                    try {
                        if (url.includes('/bapi/asset/v1/private/alpha-trade/order/place')) {
                            const clone = res.clone();
                            const data = await clone.json().catch(() => null);
                            if (data && (data.code === '481020' || (data.message && data.message.includes('余额不足')))) {
                                logit('检测到余额不足，下单失败，准备刷新并自动恢复循环');
                                markAndReload();
                            }
                        }
                    } catch (e) {}
                    return res;
                };
                window.__wutong_fetch_patched = true;
            }
            // XHR 代理
            if (window.XMLHttpRequest && !window.__wutong_xhr_patched) {
                const origOpen = XMLHttpRequest.prototype.open;
                const origSend = XMLHttpRequest.prototype.send;
                XMLHttpRequest.prototype.open = function(method, url) {
                    try { this.__wutong_url = url || ''; } catch (e) { this.__wutong_url = ''; }
                    return origOpen.apply(this, arguments);
                };
                XMLHttpRequest.prototype.send = function(body) {
                    try {
                        this.addEventListener('load', function() {
                            try {
                                const url = this.__wutong_url || this.responseURL || '';
                                if (url.includes('/bapi/asset/v1/private/alpha-trade/order/place')) {
                                    let data = null;
                                    try { data = JSON.parse(this.responseText); } catch (e) { data = null; }
                                    if (data && (data.code === '481020' || (data.message && data.message.includes('余额不足')))) {
                                        logit('检测到余额不足(XHR)，准备刷新并自动恢复循环');
                                        markAndReload();
                                    }
                                }
                            } catch (e) {}
                        });
                    } catch (e) {}
                    return origSend.apply(this, arguments);
                };
                window.__wutong_xhr_patched = true;
            }
            // 刷新后自动恢复循环
            try {
                const flag = localStorage.getItem(RESUME_KEY);
                if (flag === '1') {
                    localStorage.removeItem(RESUME_KEY);
                    logit('刷新后自动恢复触发');
                    // 等待面板绑定与参数加载
                    setTimeout(() => { resumeAfterInsufficient(); }, 800);
                    // 刷新后自动执行锁一手价
                    setTimeout(() => { triggerLockOneHandPrice(); }, 900);
                }
                const flag2 = localStorage.getItem(RESUME_CONTINUE_KEY);
                if (flag2 === '1') {
                    localStorage.removeItem(RESUME_CONTINUE_KEY);
                    logit('刷新后自动继续触发');
                    setTimeout(() => { resumeContinueOnly(); }, 800);
                    setTimeout(() => { triggerLockOneHandPrice(); }, 900);
                }
            } catch (e) {}
        } catch (e) {
            console.warn('setupOrderPlaceMonitor error:', e);
        }
    }

    // 刷新后自动点击“锁一手价”按钮
    function triggerLockOneHandPrice() {
        try {
            const btn = document.getElementById('cex-btn-lock');
            if (btn) {
                btn.click();
                logit('刷新后已自动启动锁一手价');
            }
        } catch (e) {
            console.warn('triggerLockOneHandPrice error:', e);
        }
    }

    // === 交易主逻辑（复用原有核心代码，略作调整） ===
    // 订单类型常量
    const ORDER_TYPE = {
      BUY: 'buy',
      SELL: 'sell'
    };

    // 选择器配置（如需适配其他交易所请修改此处）
    const SELECTORS = {
      [ORDER_TYPE.BUY]: {
        button: '.bn-button.bn-button__buy',
        logPrefix: '买入'
      },
      [ORDER_TYPE.SELL]: {
        button: '.bn-button.bn-button__sell',
        logPrefix: '卖出'
      },
      limitTab: '#bn-tab-LIMIT',
      priceInput: '#limitPrice',
      volumeInput: '#limitTotal',
      confirmModal: '.bn-modal-confirm',
      feeModal: '.bn-trans.data-show.bn-mask.bn-modal'
    };

    /**
     * 等待元素出现并可选执行操作
     * @param {string|Function} selector - CSS选择器或返回元素的函数
     * @param {Function|null} checker - 可选的元素检查函数
     * @param {Function|null} onReady - 元素出现后要执行的操作（接收元素作为参数，可为async）
     * @param {number} maxAttempts - 最大尝试次数
     * @param {number} interval - 重试间隔(毫秒)
     * @param {number} initialDelay - 初始延迟(毫秒)
     * @returns {Promise<any>} - 返回 onReady 的结果
     */
    function waitForElement(
      selector,
      checker = null,
      onReady = null,
      maxAttempts = 10,
      interval = 2000,
      initialDelay = 100
    ) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          let attempts = 0;
          function attempt() {
            let el = null;
            try {
              el = typeof selector === "string"
                ? document.querySelector(selector)
                : selector();
            } catch (e) {
              el = null;
            }
            if (el && (!checker || checker(el))) {
              if (onReady) {
                Promise.resolve(onReady(el))
                  .then(resolve)
                  .catch(reject);
              } else {
                resolve(el);
              }
            } else {
              attempts++;
              if (attempts < maxAttempts) {
                setTimeout(attempt, interval);
              } else {
                reject(new Error("元素未找到: " + selector));
              }
            }
          }
          attempt();
        }, initialDelay);
      });
    }

    /**
     * 通过文本内容获取买入/卖出tab
     * @param {string} text - tab文本（如“买入”或“卖出”）
     * @returns {HTMLElement|null}
     */
    function getTabByText(text) {
      const tabs = document.querySelectorAll('.bn-tab.bn-tab__buySell');
      return Array.from(tabs).find(tab => tab.textContent.trim() === text);
    }

    /**
     * 获取已激活的买入/卖出tab
     * @param {string} text - tab文本
     * @returns {HTMLElement|null}
     */
    function getActiveTabByText(text) {
      const tabs = document.querySelectorAll('.bn-tab.bn-tab__buySell');
      return Array.from(tabs).find(tab =>
        tab.textContent.trim() === text &&
        tab.classList.contains('active') &&
        tab.getAttribute('aria-selected') === 'true'
      );
    }

    /**
     * 设置输入框的值并触发input/change事件
     * @param {HTMLElement} inputElement - 目标输入框元素
     * @param {string|number} value - 要设置的值
     */
    function setInputValue(inputElement, value) {
      if (!inputElement) return;
      inputElement.focus();
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      ).set;
      nativeInputValueSetter.call(inputElement, "");
      nativeInputValueSetter.call(inputElement, value);
      inputElement.dispatchEvent(new Event("input", { bubbles: true }));
      inputElement.dispatchEvent(new Event("change", { bubbles: true }));
      inputElement.blur();
    }

    /**
     * 设置买入/卖出数量（仅买入时用）
     * @param {number} amount
     */
    function setVolume(amount) {
      const input = document.querySelector(SELECTORS.volumeInput);
      if (input) setInputValue(input, amount);
    }

    /**
     * 设置限价价格
     * @param {number} price
     */
    function setLimitPrice(price) {
      const input = document.querySelector(SELECTORS.priceInput);
      if (input) setInputValue(input, price);
    }

    // 卖出无存货时，切换买入->卖出页面两次
    async function toggleBuySellTwice() {
      try {
        for (let i = 0; i < 2; i++) {
          const buyTab = await waitForElement(() => getTabByText('买入'));
          if (buyTab) {
            buyTab.click();
            await new Promise(r => setTimeout(r, 200));
          }
          const sellTab = await waitForElement(() => getTabByText('卖出'));
          if (sellTab) {
            sellTab.click();
            await new Promise(r => setTimeout(r, 200));
          }
        }
        logit('已切换买入/卖出页面2次');
      } catch (e) {
        logit('切换买入/卖出页面出错:', e);
      }
    }

    // 尝试点击卖出表单中的“100%/最大/全部/MAX”按钮
    async function clickSellMax() {
      try {
        const sellTab = await waitForElement(() => getTabByText('卖出'));
        if (sellTab) {
          sellTab.click();
          await new Promise(r => setTimeout(r, 120));
        }
        const dialog = document;
        const candidates = Array.from(dialog.querySelectorAll('button, span, div'));
        const btn = candidates.find(el => el && typeof el.textContent === 'string' &&
          (el.textContent.trim() === '100%' ||
           el.textContent.includes('100%') ||
           el.textContent.includes('最大') ||
           el.textContent.toUpperCase().includes('MAX') ||
           el.textContent.includes('全部')));
        if (btn) {
          btn.click();
          logit('已点击卖出最大(100%)按钮');
          await new Promise(r => setTimeout(r, 180));
        } else {
          logit('未找到卖出最大(100%)按钮');
        }
      } catch (e) {
        logit('点击卖出最大按钮出错:', e);
      }
    }

    // 取消所有进行中的订单（点击“全部取消”，并确认）
    async function cancelAllOpenOrders() {
      try {
        const cancelAllByXPath = document.evaluate('//*[@id="bn-tab-pane-orderOrder"]/div/div[3]/div/div/div[1]/table/thead/tr/th[9]/div', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        let cancelAllBtn = cancelAllByXPath;
        if (!cancelAllBtn) {
          cancelAllBtn = Array.from(document.querySelectorAll('#bn-tab-pane-orderOrder th div, #bn-tab-pane-orderOrder th button, #bn-tab-pane-orderOrder th span'))
            .find(el => el && typeof el.textContent === 'string' && el.textContent.includes('全部取消')) || null;
        }
        if (cancelAllBtn) {
          cancelAllBtn.click();
          logit('已点击全部取消按钮');
          await new Promise(r => setTimeout(r, 150));
          let confirmBtn = document.evaluate('//*[@id="__APP"]/div[3]/div/div/div[2]/button', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          if (!confirmBtn) {
            const dialog = document.querySelector('div[role="dialog"], .bn-modal, .bn-dialog');
            if (dialog) {
              confirmBtn = Array.from(dialog.querySelectorAll('button'))
                .find(b => ['确认', '确定', '是', '继续', '确认取消', '取消订单']
                  .some(t => b.textContent && b.textContent.includes(t))) || null;
            }
          }
          if (confirmBtn) {
            confirmBtn.click();
            logit('已确认取消全部订单');
            await new Promise(r => setTimeout(r, 300));
          } else {
            logit('未找到确认取消按钮');
          }
        } else {
          logit('未找到全部取消按钮');
        }
      } catch (err) {
        logit('取消全部订单时出错:', err);
      }
    }

    /**
     * 检查订单状态，判断是否已成交
     * @returns {Promise<{status: string, message?: string}>}
     */
    function checkOrderStatus() {
      const orderTab = document.querySelector('#bn-tab-orderOrder');
      const limitTab = document.querySelector('#bn-tab-limit');
      if (orderTab) orderTab.click();
      if (limitTab) limitTab.click();
      return new Promise((resolve, reject) => {
        let finished = false;
        let timeoutId = null;
        const checkOrder = () => {
          if (finished) return;
          // 检查“无进行中的订单”提示
          const noOrderTip = Array.from(document.querySelectorAll('div.text-TertiaryText'))
            .find(div => div.textContent.includes('无进行中的订单'));
          if (noOrderTip) {
            finished = true;
            if (timeoutId) clearTimeout(timeoutId);
            resolve({status: 'completed'});
            return;
          }
          // 兼容旧逻辑（如有表格）
          const tbody = document.querySelector('.bn-web-table-tbody');
          if (tbody && tbody.children && tbody.children.length > 0) {
            setTimeout(checkOrder, 1000 + Math.random() * 2000); // 1~3秒随机延迟
          } else {
            setTimeout(checkOrder, 1000 + Math.random() * 2000); // 1~3秒随机延迟
          }
        };
        setTimeout(checkOrder, 1000 + Math.random() * 2000);
        timeoutId = setTimeout(async () => {
          if (finished) return;
          finished = true;
          logit('订单超时未成交，执行全部取消');
          await cancelAllOpenOrders();
          resolve({
            status: 'timeout',
            message: '订单超时未成交,需要人工干预'
          });
        }, ORDER_TIMEOUT_MS);
      });
    }

    /**
     * 通用下单函数（买入/卖出）
     * @param {Object} options
     * @param {'buy'|'sell'} options.type - 订单类型
     * @param {number} options.price - 价格
     * @param {number} options.volume - 数量
     * @param {boolean} options.abortOnPriceWarning - 是否遇到价格警告时中止
     * @returns {Promise<{status: string, message?: string}>}
     */
    async function placeOrder({ type, price, volume, abortOnPriceWarning = false }) {
      for (let attempt = 1; attempt <= 10; attempt++) {
        try {
          // 1. 切换到买/卖tab
          const tabText = type === ORDER_TYPE.BUY ? '买入' : '卖出';
          const tab = await waitForElement(() => getTabByText(tabText));
          if (!tab) throw new Error('未找到' + tabText + 'tab');
          tab.click();
          logit(`已点击${tabText}标签（第${attempt}次尝试）`);
          await waitForElement(() => getActiveTabByText(tabText));
          logit(`${tabText}标签已激活`);
          // 2. 切换到限价
          const limitTab = await waitForElement(SELECTORS.limitTab);
          if (!limitTab) throw new Error('未找到限价tab');
          limitTab.click();
          logit('已点击限价标签');

          // 尝试>1时刷新建议价
          let usePrice = price;
          if (attempt > 1) {
            try {
              const fresh = await fetchSuggestPrice(type === ORDER_TYPE.BUY ? 'buy' : 'sell');
              if (fresh) usePrice = fresh;
            } catch (e) {
              usePrice = price;
            }
          }

          // 3. 卖出：先设置价格再拉满滑块（内部最多重试10次；最终再尝试点击100%按钮）
          if (type === ORDER_TYPE.SELL) {
            setLimitPrice(usePrice);
            let slider = document.querySelector('input[role="slider"]');
            if (slider) {
              let sAttempt = 0;
              while (sAttempt < 10) {
                setInputValue(slider, 100);
                await new Promise(r => setTimeout(r, 150));
                if (slider.value !== '0') {
                  break;
                }
                sAttempt++;
                if (sAttempt < 10) {
                  logit(`卖出滑块设置失败，重试第${sAttempt}次`);
                  slider = document.querySelector('input[role="slider"]');
                }
              }
              if (slider.value === '0') {
                // 滑块失效兜底：尝试点击100%/最大
                await clickSellMax();
              }
            }
          } else {
            // 4. 买入：设置价格与数量
            setLimitPrice(usePrice);
            setVolume(volume);
            // 填充成交额后检查是否出现“余额不足”提示
            await new Promise(r => setTimeout(r, 150));
            if (hasInsufficientBalanceBanner()) {
              logit('买入填充后检测到余额不足，执行正常卖出全部并刷新继续');
              try {
                const sellResult = await sell(ORDER_VOLUME, ABORT_ON_PRICE_WARNING);
                logit('余额不足预处理：卖出返回', sellResult);
              } catch (e) {
                logit('余额不足预处理：卖出异常', e);
              }
              // 标记刷新后仅继续，不重复卖出
              try { localStorage.setItem('wutong_auto_resume_continue_only', '1'); } catch (e) {}
              setTimeout(() => location.reload(), 800);
              return { status: 'aborted', message: 'insufficient-balance-detected-after-fill' };
            }
          }
          logit(`已设置限价${usePrice}` + (type === ORDER_TYPE.BUY ? `和数量${volume}` : '，全部可卖资产'));

          // 5. 点击买/卖按钮
          const config = SELECTORS[type];
          const actionButton = await waitForElement(config.button);
          if (!actionButton) throw new Error('未找到' + config.logPrefix + '按钮');
          actionButton.click();
          logit(`已点击${config.logPrefix}按钮`);

          // 6. 价格警告弹窗
          try {
            const confirmModal = await waitForElement(SELECTORS.confirmModal, null, null, 3, 200, 200);
            if (confirmModal && confirmModal.textContent.includes('下单手滑提醒')) {
              if (abortOnPriceWarning) {
                logit('检测到下单手滑提醒,停止交易');
                alert('检测到下单手滑提醒,已停止交易');
                return {status: 'aborted', message: '下单手滑提醒，已中止'};
              } else {
                logit('检测到下单手滑提醒,继续交易');
                const continueButton = await waitForElement(() => {
                  const dialog = document.querySelector('div[role="dialog"]');
                  if (!dialog) return null;
                  const buttons = dialog.querySelectorAll('button');
                  return Array.from(buttons).find(btn => btn.textContent.includes('继续'));
                }, null, null, 5, 100, 0);
                if (continueButton && continueButton.textContent.includes('继续')) {
                  continueButton.click();
                  logit('已点击下单手滑提醒弹窗的继续按钮');
                }
              }
            }
          } catch (err) {
            // 无弹窗则继续
          }

          // 7. 手续费弹窗
          try {
            const feeModal = await waitForElement(
              SELECTORS.feeModal,
              null,
              null,
              5,
              100,
              0
            );
            if (feeModal && feeModal.textContent.includes('预估手续费')) {
              logit('检测到预估手续费弹窗');
              const confirmButton = await waitForElement(() => {
                const dialog = document.querySelector('div[role="dialog"]');
                if (!dialog) return null;
                const buttons = dialog.querySelectorAll('button');
                return Array.from(buttons).find(btn => btn.textContent.includes('继续'));
              }, null, null, 5, 100, 0);
              if (confirmButton && confirmButton.textContent.includes('继续')) {
                confirmButton.click();
                logit('已点击预估手续费弹窗的继续按钮');
              }
            }
          } catch (e) {
            logit('未检测到预估手续费弹窗，继续...');
          }

          // 8. 等待订单成交
          const orderResult = await checkOrderStatus();
          logit('订单状态:', orderResult);
          if (orderResult && orderResult.status === 'completed') {
            return orderResult;
          }
          if (orderResult && orderResult.status === 'timeout') {
            logit(`第${attempt}次下单超时，已取消进行中的订单`);
            if (attempt < 10) {
              continue; // 继续下一次尝试
            } else {
              return { status: 'timeout', message: '订单超时，已重试10次仍未成交' };
            }
          }
          // 其他状态：直接返回
          return orderResult || {status: 'unknown'};
        } catch (err) {
          logit('下单流程异常:', err);
          if (attempt >= 10) {
            return { status: 'error', message: '下单异常，重试10次失败: ' + (err && err.message ? err.message : err) };
          }
        }
      }
      // 不应到达
      return { status: 'unknown' };
    }

    // buy/sell分别传入类型
    async function buy(volume, abortOnPriceWarning = false) {
        const price = await fetchSuggestPrice('buy');
        if (!price) throw new Error('未能获取买入建议价');
        return placeOrder({ type: ORDER_TYPE.BUY, price, volume, abortOnPriceWarning });
    }
    async function sell(volume, abortOnPriceWarning = false) {
        const price = await fetchSuggestPrice('sell');
        if (!price) throw new Error('未能获取卖出建议价');
        return placeOrder({ type: ORDER_TYPE.SELL, price, volume, abortOnPriceWarning });
    }

    /**
     * 主交易循环，自动买入卖出刷交易量
     */
    async function startTrading() {
      if (typeof REMAINING_TRADES !== 'number' || isNaN(REMAINING_TRADES)) {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const data = JSON.parse(raw);
            if (typeof data.remainingTrades === 'number' && !isNaN(data.remainingTrades)) {
              REMAINING_TRADES = data.remainingTrades; // 包含0在内
            } else {
              REMAINING_TRADES = MAX_TRADES;
            }
          } else {
            REMAINING_TRADES = MAX_TRADES;
          }
        } catch (e) {
          REMAINING_TRADES = MAX_TRADES;
        }
        saveParamsToStorage();
      }
      updateRemainingDisplay();
      while (REMAINING_TRADES > 0) {
        if (stopTrading) {
          logit('检测到 stopTrading 标志，自动刷单已被强制中断');
          break;
        }
        try {
          const roundIndex = (MAX_TRADES - REMAINING_TRADES) + 1;
          logit(`开始第${roundIndex}次买入...（剩余:${REMAINING_TRADES}）`);
          const buyResult = await buy(ORDER_VOLUME, ABORT_ON_PRICE_WARNING);
          logit('本次买入返回:', buyResult);
          if (buyResult && buyResult.status === 'completed') {
            logit('买入成功,开始卖出...');
            const sellResult = await sell(ORDER_VOLUME, ABORT_ON_PRICE_WARNING);
            logit('本次卖出返回:', sellResult);
            if (sellResult && sellResult.status === 'completed') {
              // 成功买入+卖出，递减剩余次数并持久化
              REMAINING_TRADES = Math.max(0, (REMAINING_TRADES || 0) - 1);
              saveParamsToStorage();
              updateRemainingDisplay();
              logit('卖出成功,剩余次数递减为:', REMAINING_TRADES);
              if (REMAINING_TRADES <= 0) {
                logit('已完成全部循环次数');
                break;
              }
            } else {
              logit('卖出失败,暂停交易，返回值:', sellResult);
              break;
            }
          } else {
            logit('买入失败,暂停交易，返回值:', buyResult);
 
            break;
          }
          // 每轮交易间隔1-5秒，防止被风控
          await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 0));
        } catch (err) {
          logit('交易出错:', err);
          alert(`交易出错: ${err.message}`);
          break;
        }
      }
      if (REMAINING_TRADES <= 0) {
        logit('wutong提醒:已完成设定的交易次数');
        alert('wutong提醒:已完成设定的交易次数');
        // 全部完成后，从备份中重置主参数与剩余次数
        resetParamsFromBackup();
      }
    }

    // ====== 历史委托统计功能（融合自lixi.js） ======
    async function runStat() {
        // 1. 切换到“历史委托”tab
        const hisTab = Array.from(document.getElementsByClassName('text-[14px]')).find(el => el.classList.contains('font-[500]') && el.textContent.includes('历史委托'));
        if (hisTab) { hisTab.click(); logit('点击历史委托tab'); }
        await sleep(1000);
        // 2. 切换到“限价”tab
        const limitTab = Array.from(document.querySelectorAll('div[role="tab"]')).find(el => el.textContent.includes('限价'));
        if (limitTab) { limitTab.click(); logit('点击限价tab'); }
        await sleep(1000);
        // 3. 切换到“1天”tab
        const oneDayTab = Array.from(document.querySelectorAll('.bn-flex')).find(el => el.textContent.includes('1天'));
        if (oneDayTab) { oneDayTab.click(); logit('点击1天tab'); }
        await sleep(1000);
        
        // 4. 获取总页数
        let pageBtns = Array.from(document.querySelectorAll('.bn-pagination-item'));
        let totalPages = 1;
        if (pageBtns.length > 0) {
            totalPages = Math.max(...pageBtns.map(a => parseInt(a.textContent.trim())).filter(n => !isNaN(n)));
        }
        logit('总页数', totalPages);
        // 5. 遍历所有分页，抓取数据
        let tokenStat = {}; // { 代币: { 日期: { buyTotal, sellTotal, buyCount, sellCount } } }
        let lastFirstRowKey = '';
        for (let page = 1; page <= totalPages; page++) {
            if (page > 1) {
                const firstRow = document.querySelector('table tbody tr');
                let firstKey = firstRow ? firstRow.innerText : '';
                let nextBtn = Array.from(document.querySelectorAll('.bn-pagination-item')).find(a => a.textContent.trim() == page.toString());
                if (nextBtn) {
                    nextBtn.click();
                    let retry = 0;
                    while (retry < 20) {
                        await sleep(20);
                        const newFirstRow = document.querySelector('table tbody tr');
                        let newKey = newFirstRow ? newFirstRow.innerText : '';
                        if (newKey && newKey !== firstKey) break;
                        retry++;
                    }
                } else {
                    break;
                }
            }
            const rows = document.querySelectorAll('table tbody tr');
            for (const row of rows) {
                const tds = row.querySelectorAll('td');
                if (tds.length < 11) continue;
                // 时间在第1列
                const timeStr = tds[1].innerText.trim(); // 2025-07-29 00:23:25
                if (!/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(timeStr)) {
                    continue; // 跳过无效时间行
                }
                // 币种在第2列
                const token = tds[2].innerText.trim(); // BR
                // 方向在第4列
                const directionDiv = tds[4].querySelector('div');
                const direction = directionDiv ? directionDiv.innerText.trim() : '';
                // 调试输出方向内容
                // console.log('方向内容:', direction, '整行:', row.innerText);

                // 成交金额在第9列
                const amountDiv = tds[9].querySelector('div');
                const amountStr = amountDiv ? amountDiv.innerText.replace(/,/g, '').replace('USDT', '').trim() : '';
                const amount = parseFloat(amountStr);
                // 日期分组（北京时间8:00~次日7:59为一天）
                let date = '';
                if (/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(timeStr)) {
                    let [d, t] = timeStr.split(' ');
                    let [y, m, day] = d.split('-').map(Number);
                    let [hh, mm, ss] = t.split(':').map(Number);
                    // 原始时间已为北京时间，直接判断
                    let bjDate = new Date(y, m-1, day, hh, mm, ss);
                    let bjYear = bjDate.getFullYear();
                    let bjMonth = bjDate.getMonth() + 1;
                    let bjDay = bjDate.getDate();
                    let bjHour = bjDate.getHours();
                    if (bjHour < 8) {
                        bjDate.setDate(bjDate.getDate() - 1);
                        bjYear = bjDate.getFullYear();
                        bjMonth = bjDate.getMonth() + 1;
                        bjDay = bjDate.getDate();
                    }
                    date = `${bjMonth}-${bjDay}日`;
                    // 调试输出
                    // console.log('原始:', timeStr, '北京时间:', `${bjYear}-${bjMonth}-${bjDay} ${bjHour}:${mm}:${ss}`, '分组:', date, '方向:', direction);
                } else {
                    continue;
                }
                // 分类统计
                if (!tokenStat[token]) tokenStat[token] = {};
                if (!tokenStat[token][date]) tokenStat[token][date] = {buyTotal:0,sellTotal:0,buyCount:0,sellCount:0};
                if (direction === '买入') {
                    tokenStat[token][date].buyTotal += amount;
                    tokenStat[token][date].buyCount++;
                } else if (direction === '卖出') {
                    tokenStat[token][date].sellTotal += amount;
                    tokenStat[token][date].sellCount++;
                }
            }
        }
        saveStat(tokenStat);
        // 保存后跳转到历史委托第一页
        await clickHistoryFirstPage();
        showStatResultByTokenDate(tokenStat);
    }
    function saveStat(tokenStat) {
        try {
            localStorage.setItem(STAT_STORAGE_KEY, JSON.stringify({
                ts: Date.now(),
                data: tokenStat
            }));
            logit('统计结果已保存');
        } catch (e) {
            console.warn('保存统计失败:', e);
        }
    }
    function loadStat() {
        try {
            const raw = localStorage.getItem(STAT_STORAGE_KEY);
            if (!raw) return null;
            const obj = JSON.parse(raw);
            return obj && obj.data ? obj.data : null;
        } catch (e) {
            return null;
        }
    }
    function showSavedStat() {
        const data = loadStat();
        if (!data) {
            alert('没有已保存的统计结果');
            return;
        }
        showStatResultByTokenDate(data);
    }
    async function clickHistoryFirstPage() {
        try {
            const hisTab = Array.from(document.getElementsByClassName('text-[14px]')).find(el => el.classList.contains('font-[500]') && el.textContent.includes('历史委托'));
            if (hisTab) { hisTab.click(); logit('点击历史委托tab'); }
            await sleep(500);
            const page1 = Array.from(document.querySelectorAll('.bn-pagination-item'))
                .find(a => a && typeof a.textContent === 'string' && a.textContent.trim() === '1');
            if (page1) { page1.click(); logit('点击历史委托第一页'); }
        } catch (e) {
            logit('点击历史委托第一页出错:', e);
        }
    }
    function showStatResultByTokenDate(tokenStat) {
        let statDiv = document.getElementById('wutong-stat-result');
        if (!statDiv) {
            statDiv = document.createElement('div');
            statDiv.id = 'wutong-stat-result';
            // 定位到cex助手面板右侧
            const panel = document.getElementById('cex-alpha-panel');
            if (panel) {
                const rect = panel.getBoundingClientRect();
                statDiv.style.position = 'fixed';
                statDiv.style.left = (rect.right + 10) + 'px'; // 右侧10px
                statDiv.style.top = rect.top + 'px'; // 顶部对齐
                statDiv.style.zIndex = 100000;
            } else {
                statDiv.style.position = 'fixed';
                statDiv.style.top = '180px';
                statDiv.style.right = '40px';
                statDiv.style.zIndex = 99999;
            }
            statDiv.style.background = '#fff';
            statDiv.style.border = '2px solid #4f8cff';
            statDiv.style.borderRadius = '12px';
            statDiv.style.padding = '18px 28px 18px 28px';
            statDiv.style.fontSize = '1.1em';
            statDiv.style.boxShadow = '0 2px 8px #e0e0e0';
            statDiv.style.color = '#222';
            statDiv.style.maxHeight = '70vh';
            statDiv.style.overflowY = 'auto';
            statDiv.style.minWidth = '340px';
            // 添加关闭按钮和标题栏
            statDiv.innerHTML = `<div id="wutong-stat-header" style="cursor:move;position:relative;font-weight:bold;margin-bottom:10px;letter-spacing:1px;font-size:1.08em;color:#222;user-select:none;">历史委托统计（按币种/日期）<button id="wutong-stat-close" style="position:absolute;right:0;top:0;width:32px;height:32px;border:none;background:#f5f6fa;border-radius:50%;font-size:20px;color:#888;box-shadow:0 2px 8px #e0e0e0;cursor:pointer;">×</button></div><div id="wutong-stat-content"></div>`;
            document.body.appendChild(statDiv);
            // 拖动实现
            let isDraggingStat = false, offsetXStat = 0, offsetYStat = 0;
            const headerStat = statDiv.querySelector('#wutong-stat-header');
            headerStat.addEventListener('mousedown', function(e) {
                if (e.target.id === 'wutong-stat-close') return;
                isDraggingStat = true;
                offsetXStat = e.clientX - statDiv.getBoundingClientRect().left;
                offsetYStat = e.clientY - statDiv.getBoundingClientRect().top;
                document.body.style.userSelect = 'none';
                window.__wutong_stat_user_moved = true;
                e.preventDefault();
            });
            document.addEventListener('mousemove', function(e) {
                if (isDraggingStat) {
                    statDiv.style.left = (e.clientX - offsetXStat) + 'px';
                    statDiv.style.top = (e.clientY - offsetYStat) + 'px';
                }
            });
            document.addEventListener('mouseup', function() {
                isDraggingStat = false;
                document.body.style.userSelect = '';
            });
        }
        // 内容填充到内容区（先计算“今日汇总/下一档”，置顶显示）
        let summaryHtml = '';
        try {
            function getTodayKeyByBeijing8() {
                const now = new Date();
                const bjNow = new Date(now.getTime() + (8 * 60 - now.getTimezoneOffset()) * 60000);
                let y = bjNow.getFullYear();
                let m = bjNow.getMonth() + 1;
                let d = bjNow.getDate();
                let h = bjNow.getHours();
                if (h < 8) {
                    const prev = new Date(bjNow.getTime() - 24 * 3600000);
                    y = prev.getFullYear();
                    m = prev.getMonth() + 1;
                    d = prev.getDate();
                }
                return `${m}-${d}日`;
            }
            const todayKey = getTodayKeyByBeijing8();
            let todayBuyTotal = 0;
            for (const token in tokenStat) {
                if (tokenStat[token] && tokenStat[token][todayKey]) {
                    todayBuyTotal += tokenStat[token][todayKey].buyTotal || 0;
                }
            }
            const nextThreshold = todayBuyTotal < 2 ? 2 : Math.pow(2, Math.floor(Math.log2(Math.max(2, todayBuyTotal))) + 1);
            const gap = Math.max(0, nextThreshold - todayBuyTotal);
            const basePts = todayBuyTotal >= 2 ? Math.floor(Math.log2(todayBuyTotal)) : 0;
            const POINTS_OFFSET = 2; // 使 16400 -> 16 分, 32800 -> 17 分
            const currentPoints = basePts + POINTS_OFFSET;
            const nextPoints = currentPoints + 1;
            // 按阈值计算“还差金额”（达标时为0）
            const remain16400 = Math.max(0, 16400 - todayBuyTotal);
            const remain32800 = Math.max(0, 32800 - todayBuyTotal);
            const unitInput = document.getElementById('cex-input-volume');
            const unit = unitInput ? parseFloat(unitInput.value) : 0;
            const formatCount = (amount) => {
                if (!unit || !isFinite(unit) || unit <= 0) return '-';
                const n = Math.abs(amount) / unit;
                return isFinite(n) ? Math.ceil(n) : '-';
            };
            summaryHtml = `<div style=\"margin-top:6px;margin-bottom:10px;padding-bottom:10px;border-bottom:1px dashed #e5e7eb;\">`
                 + `<b style=\"color:#111;\">当日汇总</b><br>`
                 + `今日已刷：<span style=\"color:#00bfae;font-weight:600;\">${todayBuyTotal.toFixed(2)} USDT</span> | <span style=\"color:#4f8cff;font-weight:600;\">${currentPoints} 积分</span> <br>`
                 + `16400档还差：<span style=\"color:#4f8cff;font-weight:600;\">${remain16400.toFixed(2)} USDT</span>`
                 + (remain16400 > 0 ? ` | <span class=\"wutong-fill-rounds\" data-rounds=\"${formatCount(remain16400)}\" style=\"cursor:pointer;color:#111;text-decoration:underline;\">差 ${formatCount(remain16400)} 笔</span>` : ` | <span style=\"color:#22c55e;font-weight:600;\">达标</span>`) + `<br>`
                 + `32800档还差：<span style=\"color:#4f8cff;font-weight:600;\">${remain32800.toFixed(2)} USDT</span>`
                 + (remain32800 > 0 ? ` | <span class=\"wutong-fill-rounds\" data-rounds=\"${formatCount(remain32800)}\" style=\"cursor:pointer;color:#111;text-decoration:underline;\">差 ${formatCount(remain32800)} 笔</span>` : ` | <span style=\"color:#22c55e;font-weight:600;\">达标</span>`) + `<br>`
                 + `距离下一档还差：<span style=\"color:#ff6b35;font-weight:600;\">${gap.toFixed(2)} USDT</span> | <span style=\"color:#4f8cff;font-weight:600;\"> ${nextPoints} 积分</span> `
                 + ` <span style=\"color:#888;font-size:12px;\">下一档阈值 ${nextThreshold.toFixed(2)} USDT</span>`
                 + `</div>`;
        } catch (e) {}
        let html = summaryHtml;
        for (const token in tokenStat) {
            html += `<div style=\"margin-top:10px;\"><b style=\"color:#4f8cff;\">${token}</b><br>`;
            for (const date in tokenStat[token]) {
                const s = tokenStat[token][date];
                const netValue = s.sellTotal - s.buyTotal;
                const totalFee = -(s.buyTotal * 0.0001 - netValue); // 万分之0.1
                html += `<span style=\"color:#888;\">${date}</span>：<br>
                买入总额：<span style=\"color:#00bfae;\">${s.buyTotal.toFixed(2)} USDT</span>（${s.buyCount}笔）<br>
                卖出总额：<span style=\"color:#ff4f4f;\">${s.sellTotal.toFixed(2)} USDT</span>（${s.sellCount}笔）<br>
                净差值：<span style=\"color:#4f8cff;\">${(s.sellTotal - s.buyTotal).toFixed(2)} USDT</span><br>
                当日总费用：<span style=\"color:#ff6b35;\">${totalFee.toFixed(4)} USDT</span><br><br>`;
            }
            html += `</div>`;
        }
        statDiv.querySelector('#wutong-stat-content').innerHTML = html;
        try {
            if (!statDiv.__bindFillRounds) {
                statDiv.addEventListener('click', function(e) {
                    const target = e.target.closest('.wutong-fill-rounds');
                    if (!target) return;
                    const raw = (target.getAttribute('data-rounds') || '').trim();
                    const n = parseInt(raw, 10);
                    if (!isFinite(n) || n <= 0) return;
                    const roundsEl = document.getElementById('cex-input-rounds');
                    if (roundsEl) {
                        setInputValue(roundsEl, n);
                        logit('已填充循环次数为', n);
                    }
                });
                statDiv.__bindFillRounds = true;
            }
        } catch (e) {}
        statDiv.querySelector('#wutong-stat-close').onclick = () => statDiv.remove();
    }
    function sleep(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    // === 启动自动交易 ===
    createDraggablePanel();
    setupOrderPlaceMonitor();
    setTimeout(bindPanelEvents, 500);

})();
