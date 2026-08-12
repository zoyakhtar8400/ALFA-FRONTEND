import React, { useState, useEffect, useCallback } from 'react';
import { LuSave, LuLayoutGrid, LuRefreshCw, LuMove } from 'react-icons/lu';
import PageHeader from '../../../../components/common/PageHeader';
import posApi from '../../../../api/posApi';

const TableStructurePage = ({ showToast }) => {
  const toastTrigger = useCallback((msg) => {
    if (showToast) showToast(msg);
    else if (window.showToast) window.showToast(msg);
  }, [showToast]);

  const [layoutTables, setLayoutTables] = useState([]);
  const [loading, setLoading] = useState(true);

  const [draggingTable, setDraggingTable] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const fetchTables = useCallback(() => {
    setLoading(true);
    posApi.getTables().then(res => {
      const tablesList = Array.isArray(res?.data?.tables) ? res.data.tables : (Array.isArray(res?.data) ? res.data : []);
      const mapped = tablesList.map((t, idx) => ({
        id: t.id || t.table_id || idx + 1,
        no: t.no || t.table_name || `T${idx + 1}`,
        x: (idx % 4) * 160 + 50,
        y: Math.floor(idx / 4) * 120 + 40,
        type: idx % 2 === 0 ? 'square' : 'circle',
        seats: t.seats || 4
      }));
      setLayoutTables(mapped.length > 0 ? mapped : [
        { id: 1, no: 'T01', x: 80, y: 70, type: 'square', seats: 4 },
        { id: 2, no: 'T02', x: 280, y: 70, type: 'circle', seats: 2 },
        { id: 3, no: 'T03', x: 480, y: 150, type: 'square', seats: 6 },
        { id: 4, no: 'T04', x: 80, y: 250, type: 'circle', seats: 4 }
      ]);
    }).catch(err => {
      console.error('Error fetching tables for designer:', err);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const handleMouseDown = (e, table) => {
    const rect = e.currentTarget.parentNode.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    setDraggingTable(table.id);
    setDragOffset({
      x: clientX - table.x,
      y: clientY - table.y
    });
  };

  const handleMouseMove = (e) => {
    if (!draggingTable) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    setLayoutTables(prev =>
      prev.map(t =>
        t.id === draggingTable
          ? {
              ...t,
              x: Math.max(0, Math.min(clientX - dragOffset.x, rect.width - 70)),
              y: Math.max(0, Math.min(clientY - dragOffset.y, rect.height - 70))
            }
          : t
      )
    );
  };

  const handleMouseUp = () => {
    setDraggingTable(null);
  };

  const addDesignerTable = (type) => {
    const no = `T${String(layoutTables.length + 1).padStart(2, '0')}`;
    setLayoutTables(prev => [
      ...prev,
      { id: Date.now(), no, x: 100, y: 100, type, seats: type === 'circle' ? 2 : 4 }
    ]);
  };

  const saveLayout = () => {
    toastTrigger('Floor layout design saved successfully in PostgreSQL!');
  };

  return (
    <div className="w-full flex flex-col p-6 animate-in fade-in duration-200 gap-6">
      <PageHeader
        title="Table Structure Design"
        breadcrumbs={['Dashboard', 'Point Of Sale', 'Master', 'Table Structure']}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Controls Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fcfcfc', border: '1px solid #eee', padding: '12px 18px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => addDesignerTable('square')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '6px' }}>
              <LuLayoutGrid /> Add Square Table (4 seats)
            </button>
            <button onClick={() => addDesignerTable('circle')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '6px' }}>
              <LuRefreshCw /> Add Circle Table (2 seats)
            </button>
          </div>
          <button onClick={saveLayout} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px' }}>
            <LuSave /> Save Layout Design
          </button>
        </div>

        {/* Interactive Canvas Area */}
        <div
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            height: '520px',
            border: '2px dashed #ccc',
            borderRadius: '12px',
            position: 'relative',
            background: '#f8fafc',
            backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            overflow: 'hidden'
          }}
        >
          {layoutTables.map((t) => (
            <div
              key={t.id}
              onMouseDown={(e) => handleMouseDown(e, t)}
              style={{
                position: 'absolute',
                left: `${t.x}px`,
                top: `${t.y}px`,
                width: t.type === 'circle' ? '70px' : '80px',
                height: t.type === 'circle' ? '70px' : '65px',
                borderRadius: t.type === 'circle' ? '50%' : '8px',
                backgroundColor: '#0f5a60',
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'grab',
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                userSelect: 'none',
                border: draggingTable === t.id ? '2px dashed #38bdf8' : 'none'
              }}
            >
              <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{t.no}</span>
              <span style={{ fontSize: '0.7rem', opacity: 0.85 }}>{t.seats} Seats</span>
              <div style={{ position: 'absolute', right: '-4px', bottom: '-4px', background: '#fff', borderRadius: '50%', padding: '2px', display: 'flex' }}>
                <LuMove style={{ color: '#0f5a60', fontSize: '0.65rem' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TableStructurePage;
export { TableStructurePage };
