// ==UserScript==
// @name         wutong - 币安刷单助手
// @namespace    https://x.com/wutongge_BTCC
// @version      6.0
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
            wutong - 币安刷单助手
            <button id="cex-alpha-panel-close" style="position:absolute;right:18px;top:12px;width:32px;height:32px;border:none;background:#f5f6fa;border-radius:50%;font-size:20px;color:#888;box-shadow:0 2px 8px #e0e0e0;cursor:pointer;transition:background 0.2s,color 0.2s;">×</button>
        </div>
        <div style="margin-bottom:14px;padding:0 28px;">
            <span style="color:#4f8cff;font-weight:bold;">建议价: <span id="cex-suggest-price" style="color:#00bfae;font-weight:bold;font-size:1.1em;">--</span></span>
        </div>
        <div style="margin-bottom:12px;padding:0 28px;">
            <label style="color:#333;font-weight:500;">USDT: <input id="cex-input-volume" type="number" step="1" style="width:100px;background:#fff;border:1.5px solid #e0e0e0;border-radius:8px;color:#222;padding:5px 10px;outline:none;font-size:1em;transition:border-color 0.2s;"></label>
        </div>
        <div style="margin-bottom:12px;padding:0 28px;">
            <label style="color:#333;font-weight:500;">循环次数: <input id="cex-input-rounds" type="number" step="1" style="width:70px;background:#fff;border:1.5px solid #e0e0e0;border-radius:8px;color:#222;padding:5px 10px;outline:none;font-size:1em;transition:border-color 0.2s;"></label>
        </div>
        <div style="margin-bottom:12px;padding:0 28px;">
            <label style="color:#333;font-weight:500;">超时(秒): <input id="cex-input-timeout" type="number" step="1" style="width:70px;background:#fff;border:1.5px solid #e0e0e0;border-radius:8px;color:#222;padding:5px 10px;outline:none;font-size:1em;transition:border-color 0.2s;"></label>
        </div>
        <div style="margin-bottom:12px;padding:0 28px;">
            <label style="color:#333;font-weight:500;"><input id="cex-input-abort" type="checkbox" style="accent-color:#4f8cff;">遇警告中止</label>
        </div>
        <div style="margin-bottom:18px;padding:0 28px;">
            <button id="cex-btn-start" style="background:linear-gradient(90deg,#4f8cff,#00e0c6);color:#fff;padding:7px 32px;border:none;border-radius:10px;font-size:1.08em;font-weight:bold;box-shadow:0 2px 8px #e0e0e0;cursor:pointer;transition:background 0.2s,box-shadow 0.2s;">启动</button>
            <button id="cex-btn-stop" style="background:linear-gradient(90deg,#00e0c6,#4f8cff);color:#fff;padding:7px 32px;border:none;border-radius:10px;font-size:1.08em;font-weight:bold;box-shadow:0 2px 8px #e0e0e0;cursor:pointer;transition:background 0.2s,box-shadow 0.2s;margin-left:14px;">停止</button>
            <button id="cex-btn-stat" style="background:linear-gradient(90deg,#ffb347,#4f8cff);color:#fff;padding:7px 32px;border:none;border-radius:10px;font-size:1.08em;font-weight:bold;box-shadow:0 2px 8px #e0e0e0;cursor:pointer;transition:background 0.2s,box-shadow 0.2s;margin-left:14px;">统计</button>
        </div>
        <div id="cex-alpha-panel-log" style="font-size:13px;color:#222;background:#f5f6fa;border-radius:8px;max-height:100px;overflow:auto;padding:8px 12px;margin:0 28px;box-shadow:0 0 8px #e0e0e0 inset;"></div>
        <style>
        #cex-alpha-panel button:hover { filter: brightness(1.1) saturate(1.2); background:linear-gradient(90deg,#00e0c6,#4f8cff)!important; }
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
        });
        document.addEventListener('mousemove', function(e) {
            if (isDragging) {
                panel.style.left = (e.clientX - offsetX + panel.offsetWidth/2) + 'px';
                panel.style.top = (e.clientY - offsetY + panel.offsetHeight/2) + 'px';
                panel.style.transform = '';
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
    let ORDER_PRICE_BUY = 0.050112;
    let ORDER_PRICE_SELL = 0.050112;
    let ORDER_VOLUME = 975;
    let MAX_TRADES = 17;
    let ORDER_TIMEOUT_MS = 500000;
    let ABORT_ON_PRICE_WARNING = true;
    let stopTrading = true;

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
        document.getElementById('cex-input-volume').value = ORDER_VOLUME;
        document.getElementById('cex-input-rounds').value = MAX_TRADES;
        document.getElementById('cex-input-timeout').value = Math.floor(ORDER_TIMEOUT_MS/1000);
        document.getElementById('cex-input-abort').checked = ABORT_ON_PRICE_WARNING;

        document.getElementById('cex-btn-start').onclick = function() {
            ORDER_VOLUME = parseFloat(document.getElementById('cex-input-volume').value);
            MAX_TRADES = parseInt(document.getElementById('cex-input-rounds').value);
            ORDER_TIMEOUT_MS = parseInt(document.getElementById('cex-input-timeout').value) * 1000;
            ABORT_ON_PRICE_WARNING = document.getElementById('cex-input-abort').checked;
            stopTrading = false;
            logit('参数已更新，开始自动交易...');
            startTrading();
        };
        document.getElementById('cex-btn-stop').onclick = function() {
            stopTrading = true;
            logit('停止交易刷新页面');
            setTimeout(() => location.reload(), 1000);
        };
        document.getElementById('cex-btn-stat').onclick = function() {
            runStat();
        };
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
      initialDelay = 1000
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
        timeoutId = setTimeout(() => {
          if (finished) return;
          finished = true;
          logit('订单超时未成交');
          alert('订单可能无法正常成交,请人工检查并调整价格');
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
      // 1. 切换到买/卖tab
      const tabText = type === ORDER_TYPE.BUY ? '买入' : '卖出';
      const tab = await waitForElement(() => getTabByText(tabText));
      if (!tab) throw new Error('未找到' + tabText + 'tab');
      tab.click();
      logit(`已点击${tabText}标签`);
      await waitForElement(() => getActiveTabByText(tabText));
      logit(`${tabText}标签已激活`);
      // 2. 切换到限价
      const limitTab = await waitForElement(SELECTORS.limitTab);
      if (!limitTab) throw new Error('未找到限价tab');
      limitTab.click();
      logit('已点击限价标签');

      // 3. 卖出时先设置价格再拉满滑块
      if (type === ORDER_TYPE.SELL) {
        setLimitPrice(price); // 先设置价格
        const slider = document.querySelector('input[role="slider"]');
        if (slider) {
          setInputValue(slider, 100);
          if (slider.value === "0") {
            logit("卖出失败，无存货");
            return { status: "no_stock", message: "无可卖资产" };
          }
        }
      }

      // 4. 买入才设置数量
      if (type === ORDER_TYPE.BUY) {
        setLimitPrice(price);
        setVolume(volume);
      }
      logit(`已设置限价${price}` + (type === ORDER_TYPE.BUY ? `和数量${volume}` : '，全部可卖资产'));

      // 5. 点击买/卖按钮
      const config = SELECTORS[type];
      const actionButton = await waitForElement(config.button);
      if (!actionButton) throw new Error('未找到' + config.logPrefix + '按钮');
      actionButton.click();
      logit(`已点击${config.logPrefix}按钮`);
      // 7. 检查价格警告弹窗
      try {
        const confirmModal = await waitForElement(SELECTORS.confirmModal, null, null, 3, 500, 500);
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
            }, null, null, 5, 1000, 0);
            if (continueButton && continueButton.textContent.includes('继续')) {
              continueButton.click();
              logit('已点击下单手滑提醒弹窗的继续按钮');
            }
          }
        }
      } catch (err) {
        // 如果没有弹窗出现就继续执行
      }
      // 8. 检查手续费弹窗
      try {
        const feeModal = await waitForElement(
          SELECTORS.feeModal,
          null,
          null,
          5,
          1000,
          0
        );
        if (feeModal && feeModal.textContent.includes('预估手续费')) {
          logit('检测到预估手续费弹窗');
          const confirmButton = await waitForElement(() => {
            const dialog = document.querySelector('div[role="dialog"]');
            if (!dialog) return null;
            const buttons = dialog.querySelectorAll('button');
            return Array.from(buttons).find(btn => btn.textContent.includes('继续'));
          }, null, null, 5, 1000, 0);
          if (confirmButton && confirmButton.textContent.includes('继续')) {
            confirmButton.click();
            logit('已点击预估手续费弹窗的继续按钮');
          }
        }
      } catch (e) {
        logit('未检测到预估手续费弹窗，继续...');
      }
      // 9. 等待订单成交
      const orderResult = await checkOrderStatus();
      logit('订单状态:', orderResult);
      return orderResult || {status: 'unknown'};
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
      let tradeCount = 0;
      while (tradeCount < MAX_TRADES) {
        if (stopTrading) {
          logit('检测到 stopTrading 标志，自动刷单已被强制中断');
          break;
        }
        try {
          logit(`开始第${tradeCount + 1}次买入...`);
          const buyResult = await buy(ORDER_VOLUME, ABORT_ON_PRICE_WARNING);
          logit('本次买入返回:', buyResult);
          if (buyResult && buyResult.status === 'completed') {
            logit('买入成功,开始卖出...');
            const sellResult = await sell(ORDER_VOLUME, ABORT_ON_PRICE_WARNING);
            logit('本次卖出返回:', sellResult);
            if (sellResult && sellResult.status === 'completed') {
              logit('卖出成功,继续下一轮交易');
              tradeCount++;
            } else {
              logit('卖出失败,暂停交易，返回值:', sellResult);
              alert('卖出失败,已停止交易');
              break;
            }
          } else {
            logit('买入失败,暂停交易，返回值:', buyResult);
            alert('买入失败,已停止交易');
            break;
          }
          // 每轮交易间隔1-5秒，防止被风控
          await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 4000));
        } catch (err) {
          logit('交易出错:', err);
          alert(`交易出错: ${err.message}`);
          break;
        }
      }
      if (tradeCount >= MAX_TRADES) {
        logit('wutong提醒:已完成设定的交易次数');
        alert('wutong提醒:已完成设定的交易次数');
      }
    }

    // ====== 历史委托统计功能（融合自lixi.js） ======
    async function runStat() {
        alert('开始统计所有历史委托数据，过程自动翻页，请勿手动操作分页！');
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
                        await sleep(100);
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
        showStatResultByTokenDate(tokenStat);
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
        // 内容填充到内容区
        let html = '';
        for (const token in tokenStat) {
            html += `<div style=\"margin-top:10px;\"><b style=\"color:#4f8cff;\">${token}</b><br>`;
            for (const date in tokenStat[token]) {
                const s = tokenStat[token][date];
                const totalFee = (s.buyTotal + s.sellTotal) * 0.0001; // 万分之0.1
                html += `<span style=\"color:#888;\">${date}</span>：<br>
                买入总额：<span style=\"color:#00bfae;\">${s.buyTotal.toFixed(2)} USDT</span>（${s.buyCount}笔）<br>
                卖出总额：<span style=\"color:#ff4f4f;\">${s.sellTotal.toFixed(2)} USDT</span>（${s.sellCount}笔）<br>
                净差值：<span style=\"color:#4f8cff;\">${(s.sellTotal - s.buyTotal).toFixed(2)} USDT</span><br>
                当日总费用：<span style=\"color:#ff6b35;\">${totalFee.toFixed(4)} USDT</span><br><br>`;
            }
            html += `</div>`;
        }
        statDiv.querySelector('#wutong-stat-content').innerHTML = html;
        statDiv.querySelector('#wutong-stat-close').onclick = () => statDiv.remove();
    }
    function sleep(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    // === 启动自动交易 ===
    createDraggablePanel();
    setTimeout(bindPanelEvents, 500);

})();
