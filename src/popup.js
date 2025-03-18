document.addEventListener('DOMContentLoaded', () => {
  const domainList = document.getElementById('domainList');
  const newDomainInput = document.getElementById('newDomain');
  const addDomainBtn = document.getElementById('addDomain');
  const resetBtn = document.getElementById('resetDomains');

  // 加载保存的域名
  loadDomains();

  // 添加新域名
  addDomainBtn.addEventListener('click', () => {
    const newDomain = newDomainInput.value.trim();
    if (newDomain) {
      chrome.storage.sync.get('domains', (data) => {
        const domains = data.domains || [];
        if (!domains.includes(newDomain)) {
          domains.push(newDomain);
          chrome.storage.sync.set({ domains }, () => {
            loadDomains();
            newDomainInput.value = '';
          });
        }
      });
    }
  });

  // 重置为默认域名
  resetBtn.addEventListener('click', () => {
    const defaultDomains = [
      "https://bytedance.larkoffice.com/wiki/*",
      "https://bytedance.sg.larkoffice.com/wiki/*"
    ];
    chrome.storage.sync.set({ domains: defaultDomains }, loadDomains);
  });

  // 加载和显示域名列表
  function loadDomains() {
    chrome.storage.sync.get('domains', (data) => {
      const domains = data.domains || [];
      domainList.innerHTML = '';
      
      domains.forEach(domain => {
        const li = document.createElement('li');
        li.textContent = domain;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '删除';
        deleteBtn.addEventListener('click', () => {
          chrome.storage.sync.set({ 
            domains: domains.filter(d => d !== domain) 
          }, loadDomains);
        });
        
        li.appendChild(deleteBtn);
        domainList.appendChild(li);
      });
    });
  }
});
