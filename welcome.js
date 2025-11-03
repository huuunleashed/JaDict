(() => {
  const API = (() => {
    if (typeof browser !== 'undefined' && browser.runtime) {
      return browser;
    }
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      return chrome;
    }
    console.error('JaDict: No extension API available');
    return null;
  })();

  const SETTINGS = window.JA_SETTINGS;

  if (!API || !SETTINGS) {
    console.error('JaDict: Welcome page thiếu API hoặc module cài đặt');
    return;
  }

  const consentCheckbox = document.getElementById('consent-checkbox');
  const acceptButton = document.getElementById('accept-button');

  if (!consentCheckbox || !acceptButton) {
    console.error('JaDict: Thiếu phần tử giao diện trên trang welcome');
    return;
  }

  // Enable button when checkbox is checked
  consentCheckbox.addEventListener('change', (event) => {
    acceptButton.disabled = !event.target.checked;
  });

  // Handle accept button click
  acceptButton.addEventListener('click', async () => {
    if (!consentCheckbox.checked) {
      return;
    }

    acceptButton.disabled = true;
    acceptButton.textContent = 'Đang lưu...';

    try {
      // Mark first run as completed
      await SETTINGS.saveExtensionSettings({
        firstRunCompleted: true,
        extensionEnabled: true
      });

      // Close welcome page and open options page
      if (API.runtime?.openOptionsPage) {
        await API.runtime.openOptionsPage();
      } else {
        // Fallback for browsers without openOptionsPage
        const optionsUrl = API.runtime.getURL('options.html');
        await API.tabs.create({ url: optionsUrl });
      }

      // Close current welcome tab
      const currentTab = await API.tabs.getCurrent();
      if (currentTab?.id) {
        await API.tabs.remove(currentTab.id);
      }
    } catch (error) {
      console.error('JaDict: Lỗi khi lưu cài đặt welcome', error);
      acceptButton.disabled = false;
      acceptButton.textContent = 'Tiếp tục sử dụng JaDict';
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  });

  // Auto-focus checkbox for accessibility
  consentCheckbox.focus();
})();
