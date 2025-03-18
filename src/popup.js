document.addEventListener('DOMContentLoaded', () => {
  const domainList = document.getElementById('domainList');
  const newDomainInput = document.getElementById('newDomain');
  const addDomainBtn = document.getElementById('addDomain');
  const resetBtn = document.getElementById('resetDomains');

  loadDomains();

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

  resetBtn.addEventListener('click', () => {
    const defaultDomains = [
      "https://bytedance.larkoffice.com/wiki/*",
      "https://bytedance.sg.larkoffice.com/wiki/*"
    ];
    chrome.storage.sync.set({ domains: defaultDomains }, loadDomains);
  });

  function loadDomains() {
    chrome.storage.sync.get('domains', (data) => {
      const domains = data.domains || [];
      domainList.innerHTML = '';
      
      domains.forEach(domain => {
        const li = document.createElement('li');
        li.textContent = domain;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
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
