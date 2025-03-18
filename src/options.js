document.addEventListener('DOMContentLoaded', () => {
  const domainList = document.getElementById('domainList');
  const newDomainInput = document.getElementById('newDomain');
  const addDomainBtn = document.getElementById('addDomain');
  const resetBtn = document.getElementById('resetDomains');
  const saveStatus = document.getElementById('saveStatus');

  // 默认域名
  const defaultDomains = [
    "https://bytedance.larkoffice.com/wiki/*",
    "https://bytedance.sg.larkoffice.com/wiki/*"
  ];

  // 加载保存的域名
  loadDomains();

  // 添加新域名
  addDomainBtn.addEventListener('click', () => {
    addNewDomain();
  });
  
  // 支持回车添加域名
  newDomainInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addNewDomain();
    }
  });

  function addNewDomain() {
    const newDomain = newDomainInput.value.trim();
    if (newDomain) {
      chrome.storage.sync.get('domains', (data) => {
        const domains = data.domains || [];
        if (!domains.includes(newDomain)) {
          domains.push(newDomain);
          chrome.storage.sync.set({ domains }, () => {
            loadDomains();
            newDomainInput.value = '';
            showSaveStatus('域名已添加');
          });
        } else {
          showSaveStatus('域名已存在');
        }
      });
    }
  }

  // 重置为默认域名
  resetBtn.addEventListener('click', () => {
    if (confirm('确定要重置为默认域名吗？这将删除所有自定义域名。')) {
      chrome.storage.sync.set({ domains: defaultDomains }, () => {
        loadDomains();
        showSaveStatus('已重置为默认域名');
      });
    }
  });

  // 加载和显示域名列表
  function loadDomains() {
    chrome.storage.sync.get('domains', (data) => {
      const domains = data.domains || defaultDomains;
      domainList.innerHTML = '';
      
      domains.forEach(domain => {
        const li = document.createElement('li');
        const domainSpan = document.createElement('span');
        domainSpan.textContent = domain;
        domainSpan.className = 'domain-text';
        li.appendChild(domainSpan);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '删除';
        deleteBtn.className = 'delete-btn';
        deleteBtn.addEventListener('click', () => {
          chrome.storage.sync.set({ 
            domains: domains.filter(d => d !== domain) 
          }, () => {
            loadDomains();
            showSaveStatus('域名已删除');
          });
        });
        
        li.appendChild(deleteBtn);
        domainList.appendChild(li);
      });
    });
  }

  // 显示保存状态
  function showSaveStatus(message) {
    saveStatus.textContent = message;
    saveStatus.style.opacity = '1';
    
    setTimeout(() => {
      saveStatus.style.opacity = '0';
    }, 2000);
  }
});
