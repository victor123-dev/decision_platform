import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const styles = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-yellow-500',
  info: 'bg-blue-500',
};

export default function Toast({ message, type = 'info', duration = 3000, onClose }) {
  const Icon = icons[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-white shadow-lg border border-slate-200 min-w-[280px]">
      <div className={`w-8 h-8 rounded-full ${styles[type]} flex items-center justify-center flex-shrink-0`}>
        <Icon className="text-white" size={18} />
      </div>
      <span className="text-sm text-slate-700 flex-1">{message}</span>
      <button
        onClick={onClose}
        className="p-1 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
      >
        <X size={16} className="text-slate-400" />
      </button>
    </div>
  );
}

let toastContainer = null;
let currentToast = null;

export function showToast(message, type = 'info', duration = 3000) {
  if (currentToast && toastContainer) {
    toastContainer.removeChild(currentToast);
  }

  const container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'fixed top-4 right-4 z-[100]';
  document.body.appendChild(container);
  toastContainer = container;

  const toastElement = document.createElement('div');
  toastElement.className = 'flex items-center gap-3 px-4 py-3 rounded-xl bg-white shadow-lg border border-slate-200 min-w-[280px]';
  
  const iconDiv = document.createElement('div');
  iconDiv.className = `w-8 h-8 rounded-full ${styles[type]} flex items-center justify-center flex-shrink-0`;
  
  const icon = document.createElement('span');
  icon.innerHTML = type === 'success' 
    ? '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
    : type === 'error'
    ? '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
    : type === 'warning'
    ? '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.29 3.86a10 10 0 1 0 13.42 13.42A10 10 0 0 0 10.29 3.86z"/></svg>'
    : '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
  
  iconDiv.appendChild(icon);
  toastElement.appendChild(iconDiv);

  const messageSpan = document.createElement('span');
  messageSpan.className = 'text-sm text-slate-700 flex-1';
  messageSpan.textContent = message;
  toastElement.appendChild(messageSpan);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'p-1 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0';
  closeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  closeBtn.addEventListener('click', () => {
    container.removeChild(toastElement);
  });
  toastElement.appendChild(closeBtn);

  container.appendChild(toastElement);
  currentToast = toastElement;

  setTimeout(() => {
    if (container.contains(toastElement)) {
      toastElement.style.opacity = '0';
      toastElement.style.transform = 'translateX(20px)';
      toastElement.style.transition = 'opacity 0.3s, transform 0.3s';
      setTimeout(() => {
        container.removeChild(toastElement);
        if (container.children.length === 0) {
          document.body.removeChild(container);
          toastContainer = null;
        }
      }, 300);
    }
  }, duration);
}