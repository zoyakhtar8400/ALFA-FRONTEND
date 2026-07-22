import React, { memo } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';

const SettingsCard = memo(({ item, isPinned, onTogglePin, onClick }) => {
  const Icon = item.icon;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(item);
    }
  };

  return (
    <div
      tabIndex={0}
      role="button"
      onClick={() => onClick(item)}
      onKeyDown={handleKeyDown}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '74px',
        padding: '14px 18px',
        backgroundColor: isPinned ? '#fffbeb' : '#ffffff',
        border: isPinned ? '1px solid #fde68a' : '1px solid #e2e8f0',
        borderRadius: '14px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        cursor: 'pointer',
        transition: 'all 180ms ease-in-out',
        position: 'relative'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#418a8b';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(65, 138, 139, 0.15)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = isPinned ? '#fde68a' : '#e2e8f0';
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0, paddingRight: '8px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          backgroundColor: '#f0fdfa',
          border: '1px solid #ccfbf1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#418a8b',
          flexShrink: 0
        }}>
          {Icon && <Icon size={20} />}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontSize: '0.88rem',
            fontWeight: 700,
            color: '#1f2937',
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {item.title}
          </h3>
          {item.description && (
            <p style={{
              fontSize: '0.72rem',
              color: '#64748b',
              margin: '2px 0 0 0',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {item.description}
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        tabIndex={-1}
        onClick={(e) => {
          e.stopPropagation();
          onTogglePin(item.id);
        }}
        style={{
          border: 'none',
          background: 'transparent',
          padding: '6px',
          cursor: 'pointer',
          color: isPinned ? '#f59e0b' : '#cbd5e1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
        title={isPinned ? "Unpin setting" : "Pin setting"}
      >
        {isPinned ? <FaStar size={14} /> : <FaRegStar size={14} />}
      </button>
    </div>
  );
});

SettingsCard.displayName = 'SettingsCard';

export default SettingsCard;
