import React, { useState } from 'react';
import { FaClock, FaArrowRight } from 'react-icons/fa';
import PageHeader from '../../../components/common/PageHeader';

const INITIAL_KOTS = [
  { id: 'KOT-402', tableId: 2, itemsCount: 3, status: 'Cooking', time: '12:40 PM' },
  { id: 'KOT-403', tableId: 3, itemsCount: 5, status: 'Sent to Kitchen', time: '12:45 PM' },
  { id: 'KOT-404', tableId: 6, itemsCount: 4, status: 'Ready', time: '12:35 PM' },
  { id: 'KOT-405', tableId: 9, itemsCount: 2, status: 'Served', time: '12:50 PM' }
];

const ViewKOTPage = () => {
  const [kots, setKots] = useState(INITIAL_KOTS);

  const handleKOTStatusTransition = (kotId, nextStatus) => {
    setKots(prev => prev.map(k => {
      if (k.id === kotId) return { ...k, status: nextStatus };
      return k;
    }));
    if (window.showToast) {
      window.showToast(`KOT status successfully updated to ${nextStatus}.`, 'success');
    }
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'var(--font-family)', backgroundColor: 'var(--background)', minHeight: '100%' }}>
      <PageHeader
        title="Kitchen Order Tickets (KOT)"
        breadcrumbs={['Dashboard', 'Restaurant', 'View KOT']}
      />

      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        padding: '24px',
        boxShadow: 'var(--shadow-sm)',
        marginTop: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark)' }}>
              Active Kitchen Tickets
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Monitor and transition active tickets in real-time
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (window.showToast) window.showToast('KOT board refreshed successfully.', 'info');
            }}
            style={{
              padding: '8px 16px', borderRadius: '10px', background: 'var(--primary-light)',
              color: 'var(--primary)', border: 'none', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer'
            }}
          >
            Refresh Board
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {kots.map((kot) => {
            let statusBg = 'rgba(245, 158, 11, 0.08)';
            let statusColor = '#D97706';
            if (kot.status === 'Cooking') {
              statusBg = 'rgba(59, 130, 246, 0.08)';
              statusColor = '#3B82F6';
            } else if (kot.status === 'Ready') {
              statusBg = 'rgba(16, 185, 129, 0.08)';
              statusColor = 'var(--success)';
            } else if (kot.status === 'Served') {
              statusBg = 'rgba(71, 85, 105, 0.08)';
              statusColor = '#475569';
            }

            return (
              <div key={kot.id} style={{
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '20px',
                background: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '8px', background: 'var(--dark-light)',
                      color: 'var(--dark)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 900, fontSize: '0.85rem'
                    }}>
                      T{kot.tableId}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>{kot.id}</h4>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FaClock size={9} /> {kot.time}
                      </span>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '0.65rem', fontWeight: 800, padding: '4px 10px', borderRadius: '8px',
                    background: statusBg, color: statusColor, textTransform: 'uppercase'
                  }}>
                    {kot.status}
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '10px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                  <strong>Details:</strong> Containing {kot.itemsCount} dishes. Select transition to update Chef dashboard:
                </div>

                {/* Transitions */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button" onClick={() => handleKOTStatusTransition(kot.id, 'Cooking')}
                    style={{
                      flex: 1, padding: '6px', borderRadius: '6px', fontSize: '0.7rem', border: '1px solid #3B82F6',
                      background: kot.status === 'Cooking' ? '#3B82F6' : '#ffffff',
                      color: kot.status === 'Cooking' ? '#ffffff' : '#3B82F6', cursor: 'pointer', fontWeight: 700
                    }}
                  >
                    Cook
                  </button>
                  <button
                    type="button" onClick={() => handleKOTStatusTransition(kot.id, 'Ready')}
                    style={{
                      flex: 1, padding: '6px', borderRadius: '6px', fontSize: '0.7rem', border: '1px solid var(--success)',
                      background: kot.status === 'Ready' ? 'var(--success)' : '#ffffff',
                      color: kot.status === 'Ready' ? '#ffffff' : 'var(--success)', cursor: 'pointer', fontWeight: 700
                    }}
                  >
                    Ready
                  </button>
                  <button
                    type="button" onClick={() => handleKOTStatusTransition(kot.id, 'Served')}
                    style={{
                      flex: 1, padding: '6px', borderRadius: '6px', fontSize: '0.7rem', border: '1px solid #475569',
                      background: kot.status === 'Served' ? '#475569' : '#ffffff',
                      color: kot.status === 'Served' ? '#ffffff' : '#475569', cursor: 'pointer', fontWeight: 700
                    }}
                  >
                    Serve
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ViewKOTPage;
