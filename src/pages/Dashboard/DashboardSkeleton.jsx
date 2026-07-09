import React, { memo } from 'react';

const Bone = ({ w = '100%', h = '16px', r = '6px', style = {} }) => (
  <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', ...style }} />
);

const DashboardSkeleton = memo(() => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
    <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>

    {/* Header */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Bone w="180px" h="22px" />
        <Bone w="240px" h="12px" />
      </div>
      <Bone w="280px" h="34px" r="8px" />
    </div>

    {/* KPI Cards */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
      {[...Array(8)].map((_, i) => (
        <div key={i} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', borderTop: '3px solid #e2e8f0', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Bone w="80px" h="10px" />
            <Bone w="32px" h="32px" r="8px" />
          </div>
          <Bone w="60px" h="26px" />
          <Bone w="100px" h="10px" />
        </div>
      ))}
    </div>

    {/* Quick Actions */}
    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px 20px' }}>
      <Bone w="120px" h="13px" style={{ marginBottom: '14px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '10px' }}>
        {[...Array(10)].map((_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <Bone w="36px" h="36px" r="10px" />
            <Bone w="48px" h="10px" />
          </div>
        ))}
      </div>
    </div>

    {/* Charts */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
        <Bone w="140px" h="13px" style={{ marginBottom: '16px' }} />
        <Bone w="100%" h="200px" r="8px" />
      </div>
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
        <Bone w="140px" h="13px" style={{ marginBottom: '16px' }} />
        <Bone w="100%" h="200px" r="8px" />
      </div>
    </div>

    {/* Activity tables */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
      {[...Array(3)].map((_, i) => (
        <div key={i} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Bone w="120px" h="13px" />
          {[...Array(4)].map((_, j) => (
            <div key={j} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Bone w="32px" h="32px" r="50%" />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <Bone w="80%" h="11px" />
                <Bone w="50%" h="9px" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
));

export default DashboardSkeleton;
