document.addEventListener('DOMContentLoaded', () => {
  const domainList = document.getElementById('domainList');
  const newDomainInput = document.getElementById('newDomain');
  const addDomainBtn = document.getElementById('addDomain');
  const resetBtn = document.getElementById('resetDomains');
  const saveStatus = document.getElementById('saveStatus');

  const defaultDomains = [
    "https://bytedance.larkoffice.com/wiki/*",
    "https://bytedance.sg.larkoffice.com/wiki/*"
  ];

  loadDomains();

  addDomainBtn.addEventListener('click', () => {
    addNewDomain();
  });
  
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
            showSaveStatus('domain added');
          });
        } else {
          showSaveStatus('domain already exists');
        }
      });
    }
  }

  resetBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset to default domains?')) {
      chrome.storage.sync.set({ domains: defaultDomains }, () => {
        loadDomains();
        showSaveStatus('reset to default domains');
      });
    }
  });

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
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-btn';
        deleteBtn.addEventListener('click', () => {
          chrome.storage.sync.set({ 
            domains: domains.filter(d => d !== domain) 
          }, () => {
            loadDomains();
            showSaveStatus('domain deleted');
          });
        });
        
        li.appendChild(deleteBtn);
        domainList.appendChild(li);
      });
    });
  }

  function showSaveStatus(message) {
    saveStatus.textContent = message;
    saveStatus.style.opacity = '1';
    
    setTimeout(() => {
      saveStatus.style.opacity = '0';
    }, 2000);
  }
});
