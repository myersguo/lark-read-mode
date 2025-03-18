const defaultDomains = [
  "https://bytedance.larkoffice.com/wiki/",
  "https://bytedance.sg.larkoffice.com/wiki/"
];

// 检查当前网页是否匹配已配置的域名
function checkIfDomainMatches(url, domainPatterns) {
  return domainPatterns.some(pattern => {
    // 转换通配符模式为正则表达式
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return regex.test(url);
  });
}

// 主要处理逻辑
function processPage(retries = 2, interval = 1500) {
  const navigationBar = document.querySelector('.navigation-bar');
  const only_read = navigationBar && navigationBar.hasAttribute('contenteditable') && navigationBar.getAttribute('contenteditable') == 'true';
  if (only_read) {
    return;
  }

  let attempts = 0;
  const checkInterval = setInterval(() => {
    const trigger = document.querySelector('.docs_mode_switch_content');
    if (!trigger) {
      if (++attempts >= retries) {
        clearInterval(checkInterval);
        return;
      }
      return; // 继续重试
    }

    trigger.click();

    const items = document.querySelectorAll('.docs_mode_switch_item_content');
    if (items.length >= 3) {
      clearInterval(checkInterval);
      items[2].click();
    } else {
      if (++attempts >= retries) {
        clearInterval(checkInterval);
        return;
      }
    }
  }, interval);
}

// 初始化并执行
function initAndRun() {
  // 获取存储的域名配置
  chrome.storage.sync.get('domains', (data) => {
    const domains = data.domains || defaultDomains;
    
    // 检查当前URL是否匹配配置的域名
    if (checkIfDomainMatches(window.location.href, domains)) {
      processPage();
    }
  });
}

// 页面加载时执行
window.addEventListener('load', initAndRun);

// 监听URL变化
const observer = new MutationObserver(() => {
  if (window.location.href !== observer.lastUrl) {
    observer.lastUrl = window.location.href;
    initAndRun();
  }
});

// 启动监听
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: false,
  characterData: false
});

// 初始化存储
chrome.runtime.sendMessage({action: "initStorage"});
