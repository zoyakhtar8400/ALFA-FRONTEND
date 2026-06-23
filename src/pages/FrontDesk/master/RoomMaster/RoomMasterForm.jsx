import React, { useState, useEffect } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import FormCard from '../../../../components/common/FormCard';

const FEATURES_OPTIONS = [
  'Air Conditioning',
  'LED Television',
  'Mini Bar',
  'High-Speed Wi-Fi',
  'Ocean Front View Balcony',
  'Private Jacuzzi Tub',
  'Room Safe',
  'Tea/Coffee Maker'
];

const RoomMasterForm = ({ mode, initialData, onSave, onCancel }) => {
  const [form, setForm] = useState({
    roomNo: '',
    name: '',
    floor: 'First Floor',
    category: 'Standard Comfort Room',
    includeInCount: 'Yes',
    active: 'Yes',
    features: [],
    description: ''
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        name: initialData.name || `Room ${initialData.roomNo}`,
        includeInCount: initialData.includeInCount || 'Yes',
        features: Array.isArray(initialData.features) ? initialData.features : (initialData.features ? initialData.features.split(', ') : []),
        description: initialData.description || ''
      });
    } else {
      setForm({
        roomNo: '',
        name: '',
        floor: 'First Floor',
        category: 'Standard Comfort Room',
        includeInCount: 'Yes',
        active: 'Yes',
        features: [],
        description: ''
      });
    }
  }, [initialData]);

  const handleFeatureToggle = (feature) => {
    setForm(prev => {
      const alreadySelected = prev.features.includes(feature);
      const newFeatures = alreadySelected
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature];
      return { ...prev, features: newFeatures };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.roomNo.trim()) return;

    const payload = {
      ...form,
      features: form.features.join(', ')
    };
    onSave(payload);
  };

  return (
    <div className="animate-in duration-200">
      <PageHeader
        title={mode === 'add' ? 'Add Room' : 'Edit Room'}
        breadcrumbs={['Dashboard', 'Front Desk', 'Room Master', mode === 'add' ? 'Add' : 'Edit']}
        showBack
        onBack={onCancel}
      />

      <form onSubmit={handleSubmit} className="m-6 p-4 flex flex-col gap-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Basic Information */}
          <FormCard title="Basic Information">
            <div className="form-grid-2">
              {/* Room Number */}
              <div className="form-field">
                <label className="form-label">
                  Room Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.roomNo}
                  onChange={e => setForm(f => ({ ...f, roomNo: e.target.value }))}
                  placeholder="e.g. 101"
                  required
                  className="form-input"
                />
              </div>

              {/* Room Name */}
              <div className="form-field">
                <label className="form-label">
                  Room Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Executive Room 101"
                  className="form-input"
                />
              </div>

              {/* Room Floor */}
              <div className="form-field">
                <label className="form-label">Room Floor</label>
                <select
                  value={form.floor}
                  onChange={e => setForm(f => ({ ...f, floor: e.target.value }))}
                  className="form-select"
                >
                  <option value="Ground Floor">Ground Floor</option>
                  <option value="First Floor">First Floor</option>
                  <option value="Second Floor">Second Floor</option>
                  <option value="Third Floor">Third Floor</option>
                </select>
              </div>

              {/* Room Category */}
              <div className="form-field">
                <label className="form-label">Room Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="form-select"
                >
                  <option value="Standard Comfort Room">Standard Comfort Room</option>
                  <option value="Premium Deluxe King Room">Premium Deluxe King Room</option>
                  <option value="Presidential Penthouse Suite">Presidential Penthouse Suite</option>
                </select>
              </div>

              {/* Include in Room Count */}
              <div className="form-field">
                <label className="form-label">Include in Room Count</label>
                <select
                  value={form.includeInCount}
                  onChange={e => setForm(f => ({ ...f, includeInCount: e.target.value }))}
                  className="form-select"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {/* Active */}
              <div className="form-field">
                <label className="form-label">Active</label>
                <select
                  value={form.active}
                  onChange={e => setForm(f => ({ ...f, active: e.target.value }))}
                  className="form-select"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>
          </FormCard>

          {/* Card 2: Room Features & Description */}
          <FormCard title="Room Features & Description">
            <div className="form-grid-2">
              {/* Features check list */}
              <div className="form-field form-span-2">
                <label className="form-label">Select Room Features</label>
                <div className="grid grid-cols-2 gap-3 p-4 border border-slate-200 rounded-xl bg-[#F8FAFC]">
                  {FEATURES_OPTIONS.map((feat) => (
                    <label key={feat} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={form.features.includes(feat)}
                        onChange={() => handleFeatureToggle(feat)}
                        className="w-4 h-4 text-[#418a8b] border-gray-300 rounded focus:ring-[#418a8b]/20 cursor-pointer"
                      />
                      <span>{feat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="form-field form-span-2">
                <label className="form-label">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Enter room details, view features, or amenities notes..."
                  rows={3}
                  className="form-textarea"
                />
              </div>
            </div>
          </FormCard>
        </div>

        <div className="mt-2 border-t border-slate-100 pt-4">
          <CommonActionButtons
            onCancel={onCancel}
            saveText={mode === 'add' ? 'Save' : 'Update'}
          />
        </div>
      </form>
    </div>
  );
};

export default RoomMasterForm;
