// 监听来自背景脚本的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "format") {
    const formattedText = formatText(request.text);
    replaceSelectedText(formattedText);
    // 发送响应
    sendResponse({success: true});
  } else if (request.action === "formatSelection") {
    // 获取当前选中的文本
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      const formattedText = formatText(selection.toString());
      replaceSelectedText(formattedText);
    }
    sendResponse({success: true});
  }
  // 返回 true 表示会异步发送响应
  return true;
});

// 格式化文本的函数
function formatText(text) {
  // 在中英文之间添加空格
  text = text.replace(/([\u4e00-\u9fa5])([A-Za-z])/g, '$1 $2');
  text = text.replace(/([A-Za-z])([\u4e00-\u9fa5])/g, '$1 $2');
  
  // 在中文和数字之间添加空格
  text = text.replace(/([\u4e00-\u9fa5])(\d)/g, '$1 $2');
  text = text.replace(/(\d)([\u4e00-\u9fa5])/g, '$1 $2');
  
  // 处理日期格式
  text = text.replace(/(\d+)年(\d+)月(\d+)日/g, ' $1 年 $2 月 $3 日');
  
  return text;
}

// 替换选中的文本
function replaceSelectedText(newText) {
  try {
    const activeElement = document.activeElement;
    const isEditable = activeElement.isContentEditable || 
                       activeElement.tagName === 'TEXTAREA' || 
                       activeElement.tagName === 'INPUT';

    if (isEditable) {
      // 如果是可编辑区域，使用 execCommand
      document.execCommand('insertText', false, newText);
    } else {
      // 对于普通文本选择，使用剪贴板 API
      navigator.clipboard.writeText(newText).then(() => {
        // 尝试使用 execCommand paste
        if (!document.execCommand('paste')) {
          // 如果 paste 失败，至少确保文本在剪贴板中
          console.log('Text copied to clipboard:', newText);
        }
      }).catch(err => {
        console.error('Failed to write to clipboard:', err);
      });
    }
  } catch (error) {
    console.error('Error replacing text:', error);
  }
} 