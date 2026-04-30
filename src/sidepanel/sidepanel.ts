export const openSiderPanel = async () => {
    const window = await chrome.windows.getCurrent({ populate: true });
    await chrome.sidePanel.open({ windowId: window.id });
}
