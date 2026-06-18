import React, { useState, useEffect } from 'react';
import { Trash2, Plus, MessageSquare, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { getConversations, deleteConversation, createNewSession, formatDate, generateSessionTitle } from '../utils/sessionStorage';

const STORAGE_KEY = 'ai_agent_sidebar_collapsed';

export default function SessionList({ currentSessionId, onSelectSession, onNewSession }) {
  const [conversations, setConversations] = useState(getConversations);
  const [deletingId, setDeletingId] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'true';
  });
  const [hoveredSession, setHoveredSession] = useState(null);
  const [toggleHover, setToggleHover] = useState(false);
  const [newSessionBtnHover, setNewSessionBtnHover] = useState(false);
  const [collapsedNewBtnHover, setCollapsedNewBtnHover] = useState(false);
  const [deleteHoverId, setDeleteHoverId] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(isCollapsed));
  }, [isCollapsed]);

  const handleDelete = (e, sessionId) => {
    e.stopPropagation();
    if (sessionId === currentSessionId) {
      return;
    }
    
    setDeletingId(sessionId);
    
    setTimeout(() => {
      const updated = deleteConversation(sessionId);
      setConversations(updated);
      setDeletingId(null);
    }, 300);
  };

  const handleNewSession = () => {
    // Do NOT create a new session here. Just notify parent to reset dialog.
    // Session will be created when user sends the first message.
    if (onNewSession) {
      onNewSession(null);
    }
  };

  const handleSelectSession = (session) => {
    if (onSelectSession) {
      onSelectSession(session);
    }
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isSelected = (sessionId) => currentSessionId === sessionId;

  return (
    <div 
      className={`flex flex-col h-full transition-all duration-300 ease-in-out border-r`}
      style={{ 
        background: 'var(--surface-2)', 
        borderColor: 'var(--border)',
        flex: isCollapsed ? '0 0 48px' : '0 0 10%',
        minWidth: isCollapsed ? 48 : 120,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
        {!isCollapsed && (
          <h2 className="text-base font-semibold" style={{ color: 'var(--fg)' }}>会话列表</h2>
        )}
        <button
          onClick={handleToggleCollapse}
          className="flex items-center justify-center w-8 h-8 transition-colors flex-shrink-0"
          style={{ 
            background: toggleHover ? 'var(--surface-3)' : 'transparent',
            color: 'var(--fg-3)',
            borderRadius: 'var(--seed-radius-md)'
          }}
          onMouseEnter={() => setToggleHover(true)}
          onMouseLeave={() => setToggleHover(false)}
          title={isCollapsed ? '展开面板' : '折叠面板'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* New session button (expanded) */}
      {!isCollapsed && (
        <div className="p-2 border-b" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={handleNewSession}
            className="w-full flex items-center gap-3 px-3 py-2.5 border-2 border-dashed transition-colors"
            style={{ 
              borderColor: newSessionBtnHover 
                ? 'color-mix(in srgb, var(--primary) 40%, transparent)' 
                : 'var(--border)',
              background: newSessionBtnHover 
                ? 'color-mix(in srgb, var(--primary) 6%, transparent)' 
                : 'transparent',
              borderRadius: 'var(--seed-radius-lg)'
            }}
            onMouseEnter={() => setNewSessionBtnHover(true)}
            onMouseLeave={() => setNewSessionBtnHover(false)}
          >
            <Plus size={18} style={{ color: 'var(--fg-3)' }} />
            <span className="text-sm" style={{ color: 'var(--fg-3)' }}>新建会话</span>
          </button>
        </div>
      )}

      {/* New session button (collapsed) */}
      {isCollapsed && (
        <div className="p-2 border-b" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={handleNewSession}
            className="w-full flex items-center justify-center p-2.5 border-2 border-dashed transition-colors"
            style={{ 
              borderColor: collapsedNewBtnHover 
                ? 'color-mix(in srgb, var(--primary) 40%, transparent)' 
                : 'var(--border)',
              background: collapsedNewBtnHover 
                ? 'color-mix(in srgb, var(--primary) 6%, transparent)' 
                : 'transparent',
              borderRadius: 'var(--seed-radius-lg)'
            }}
            onMouseEnter={() => setCollapsedNewBtnHover(true)}
            onMouseLeave={() => setCollapsedNewBtnHover(false)}
            title="新建会话"
          >
            <Plus size={18} style={{ color: 'var(--fg-3)' }} />
          </button>
        </div>
      )}

      {/* Session list */}
      <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
        {conversations.length === 0 ? (
          isCollapsed ? (
            <div className="flex flex-col items-center justify-center h-full" style={{ color: 'var(--fg-3)' }}>
              <MessageSquare size={24} className="mb-2 opacity-50" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full" style={{ color: 'var(--fg-3)' }}>
              <MessageSquare size={48} className="mb-3 opacity-50" />
              <p className="text-sm">暂无会话</p>
              <p className="text-xs mt-1">点击上方按钮开始新会话</p>
            </div>
          )
        ) : (
          conversations.map((session) => {
            const selected = isSelected(session.id);
            const hovered = hoveredSession === session.id;
            return (
              <div
                key={session.id}
                onClick={() => handleSelectSession(session)}
                className="relative flex items-start gap-2 px-2 py-2 cursor-pointer transition-all"
                style={{
                  background: selected 
                    ? 'color-mix(in srgb, var(--primary) 10%, transparent)' 
                    : hovered 
                      ? 'var(--surface-3)' 
                      : 'transparent',
                  border: selected 
                    ? '1px solid color-mix(in srgb, var(--primary) 30%, transparent)' 
                    : '1px solid transparent',
                  borderRadius: 'var(--seed-radius-lg)',
                  opacity: deletingId === session.id ? 0.5 : 1,
                  transform: deletingId === session.id ? 'scale(0.95)' : 'scale(1)',
                }}
                onMouseEnter={() => setHoveredSession(session.id)}
                onMouseLeave={() => setHoveredSession(null)}
              >
                <div 
                  className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ 
                    background: selected ? 'var(--primary)' : 'var(--surface-3)',
                    color: selected ? '#fff' : 'var(--fg-3)',
                  }}
                >
                  <MessageSquare size={13} />
                </div>
                
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium truncate" style={{ color: 'var(--fg-2)' }} title={session.title || '新会话'}>
                      {session.title || (session.messages && session.messages.length > 0 
                        ? generateSessionTitle(session.messages[0]?.content) 
                        : '新会话')}
                    </h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock size={9} style={{ color: 'var(--fg-3)' }} />
                      <span className="text-xs" style={{ color: 'var(--fg-3)' }}>
                        {formatDate(session.updatedAt)}
                      </span>
                    </div>
                  </div>
                )}
                
                {!isCollapsed && !selected && (
                  <button
                    onClick={(e) => handleDelete(e, session.id)}
                    className="p-1 rounded-lg transition-colors flex-shrink-0"
                    style={{ 
                      color: deleteHoverId === session.id ? 'var(--danger)' : 'var(--fg-3)',
                      background: deleteHoverId === session.id ? 'color-mix(in srgb, var(--danger) 8%, transparent)' : 'transparent',
                    }}
                    onMouseEnter={() => setDeleteHoverId(session.id)}
                    onMouseLeave={() => setDeleteHoverId(null)}
                    title="删除会话"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="text-xs text-center" style={{ color: 'var(--fg-3)' }}>
            共 {conversations.length} 个会话
          </div>
        </div>
      )}
    </div>
  );
}
