import React, { useState, useEffect, useMemo } from 'react';
import { FaTimes, FaCheck, FaPlus, FaSlidersH, FaFire } from 'react-icons/fa';

/**
 * ModifierAddonModal
 * Allows cashier / steward to customize menu items with Modifier Groups & Add-ons
 * loaded directly from the database and masters (e.g. Spice Level, Extra Toppings, Sauces).
 */
const ModifierAddonModal = ({
  isOpen,
  onClose,
  item,
  initialSelectedAddons = [],
  modifierGroups = [],
  modifiersList = [],
  onApply
}) => {
  const [selectedAddons, setSelectedAddons] = useState([]);

  // Default fallback modifier groups & addons if none supplied from DB
  const resolvedGroups = useMemo(() => {
    if (Array.isArray(modifierGroups) && modifierGroups.length > 0) {
      return modifierGroups.filter(g => g.status !== 'Inactive' && g.is_active !== 0);
    }
    try {
      const local = localStorage.getItem('alfa_modifier_groups');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.filter(g => g.status !== 'Inactive');
      }
    } catch (e) { }

    return [
      { id: 1, name: 'Spice Level', minSelection: 1, maxSelection: 1, isMandatory: 'Yes' },
      { id: 4, name: 'Extra Toppings', minSelection: 0, maxSelection: 5, isMandatory: 'No' },
      { id: 2, name: 'Choice of Bread', minSelection: 0, maxSelection: 2, isMandatory: 'No' },
      { id: 5, name: 'Choice of Sauce', minSelection: 0, maxSelection: 2, isMandatory: 'No' }
    ];
  }, [modifierGroups]);

  const resolvedAddons = useMemo(() => {
    if (Array.isArray(modifiersList) && modifiersList.length > 0) {
      return modifiersList.filter(a => a.status !== 'Inactive' && a.is_active !== 0);
    }
    try {
      const local = localStorage.getItem('alfa_modifier_addons');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.filter(a => a.status !== 'Inactive');
      }
    } catch (e) { }

    return [
      { id: 1, name: 'Mild Spicy', groupName: 'Spice Level', price: 0, foodType: 'Veg' },
      { id: 2, name: 'Medium Spicy', groupName: 'Spice Level', price: 0, foodType: 'Veg' },
      { id: 3, name: 'Extra Spicy 🔥', groupName: 'Spice Level', price: 10, foodType: 'Veg' },
      { id: 4, name: 'Extra Mozzarella Cheese', groupName: 'Extra Toppings', price: 50, foodType: 'Veg' },
      { id: 5, name: 'Paneer Cubes', groupName: 'Extra Toppings', price: 40, foodType: 'Veg' },
      { id: 6, name: 'Chicken Chunks', groupName: 'Extra Toppings', price: 60, foodType: 'Non-Veg' },
      { id: 7, name: 'Garlic Butter Naan', groupName: 'Choice of Bread', price: 35, foodType: 'Veg' },
      { id: 8, name: 'Tandoori Roti', groupName: 'Choice of Bread', price: 20, foodType: 'Veg' },
      { id: 9, name: 'Mint Mayonnaise', groupName: 'Choice of Sauce', price: 15, foodType: 'Veg' },
      { id: 10, name: 'Peri Peri Dip', groupName: 'Choice of Sauce', price: 20, foodType: 'Veg' }
    ];
  }, [modifiersList]);

  // Sync initial selections on open
  useEffect(() => {
    if (isOpen) {
      setSelectedAddons(Array.isArray(initialSelectedAddons) ? [...initialSelectedAddons] : []);
    }
  }, [isOpen, initialSelectedAddons]);

  if (!isOpen || !item) return null;

  const basePrice = Number(item.unitPrice || item.price || item.rate || 0);
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + Number(a.price || 0), 0);
  const grandTotal = basePrice + addonsTotal;

  const handleToggleAddon = (addon, group) => {
    const isSingleSelect = Number(group.maxSelection || 1) === 1;

    setSelectedAddons(prev => {
      const exists = prev.some(a => a.id === addon.id || a.name === addon.name);

      if (isSingleSelect) {
        // Remove any other addon belonging to this group, then add new (or toggle off if optional)
        const filtered = prev.filter(a => {
          const matchingGroup = a.groupName || a.group;
          return matchingGroup !== group.name;
        });
        if (exists && group.isMandatory !== 'Yes' && group.minSelection === 0) {
          return filtered; // deselect
        }
        return [...filtered, { ...addon, groupName: group.name }];
      } else {
        if (exists) {
          return prev.filter(a => a.id !== addon.id && a.name !== addon.name);
        } else {
          // Check max selection limit
          const inSameGroup = prev.filter(a => (a.groupName || a.group) === group.name);
          if (group.maxSelection && inSameGroup.length >= Number(group.maxSelection)) {
            return prev; // reached maximum for group
          }
          return [...prev, { ...addon, groupName: group.name }];
        }
      }
    });
  };

  const handleSave = () => {
    onApply(selectedAddons, addonsTotal);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '540px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1.5px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0e7490 0%, #0891b2 100%)',
          color: '#ffffff'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaSlidersH style={{ fontSize: '1rem', color: '#67e8f9' }} />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                Customize: {item.itemName || item.name || 'Dish'}
              </h3>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#cffafe', marginTop: '4px' }}>
              Base Price: ₹{basePrice.toFixed(2)} {item.unit ? `• Unit: ${item.unit}` : ''}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'background 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
          >
            <FaTimes />
          </button>
        </div>

        {/* Scrollable Groups & Add-ons list */}
        <div style={{
          padding: '18px 20px',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}>
          {resolvedGroups.map(group => {
            const groupAddons = resolvedAddons.filter(a =>
              (a.groupName || a.group || '').toLowerCase() === (group.name || '').toLowerCase() ||
              String(a.modifier_group_id || '') === String(group.id || '')
            );

            if (groupAddons.length === 0) return null;

            const isSingle = Number(group.maxSelection || 1) === 1;

            return (
              <div
                key={group.id || group.name}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                {/* Group Title */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e293b' }}>
                      {group.name}
                    </span>
                    {group.isMandatory === 'Yes' && (
                      <span style={{ fontSize: '0.65rem', background: '#fee2e2', color: '#dc2626', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        Required
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                    {isSingle ? 'Choose 1' : `Up to ${group.maxSelection || 'any'}`}
                  </span>
                </div>

                {/* Add-on options */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px' }}>
                  {groupAddons.map(addon => {
                    const isSelected = selectedAddons.some(a => a.id === addon.id || a.name === addon.name);
                    const addonPrice = Number(addon.price || 0);

                    return (
                      <button
                        key={addon.id || addon.name}
                        type="button"
                        onClick={() => handleToggleAddon(addon, group)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: isSelected ? '1.5px solid #0e7490' : '1px solid #cbd5e1',
                          background: isSelected ? '#ecfeff' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: isSingle ? '50%' : '4px',
                              border: isSelected ? '2px solid #0e7490' : '1.5px solid #94a3b8',
                              background: isSelected ? '#0e7490' : '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#ffffff',
                              fontSize: '0.65rem',
                              flexShrink: 0
                            }}
                          >
                            {isSelected && (isSingle ? '●' : <FaCheck />)}
                          </span>
                          <span style={{ fontSize: '0.82rem', fontWeight: isSelected ? 800 : 600, color: '#1e293b' }}>
                            {addon.name}
                          </span>
                        </div>
                        <span style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: addonPrice > 0 ? '#047857' : '#64748b'
                        }}>
                          {addonPrice > 0 ? `+₹${addonPrice}` : 'Free'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer with Price breakdown & Apply button */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1.5px solid #e2e8f0',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
              {selectedAddons.length > 0 ? `${selectedAddons.length} add-on(s) selected (+₹${addonsTotal})` : 'No add-ons selected'}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0e7490' }}>
              Total: ₹{grandTotal.toFixed(2)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 16px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                color: '#475569',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              style={{
                padding: '9px 20px',
                borderRadius: '8px',
                border: 'none',
                background: '#0e7490',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(14, 116, 144, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FaCheck /> Apply Customization
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModifierAddonModal;
