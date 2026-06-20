import React, { useState, useEffect } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';

const FormCard = ({ title, children }) => (
  <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-md mb-6 animate-in fade-in duration-200">
    <h3 className="text-base font-bold text-[#244e5f] mb-6 pb-3 border-b border-gray-100">{title}</h3>
    {children}
  </div>
);

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

    // Convert features array back to a comma-separated string for compatibility with columns
    const payload = {
      ...form,
      features: form.features.join(', ')
    };
    onSave(payload);
  };

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-200">
      <PageHeader
        title={mode === 'add' ? 'Add Room' : 'Edit Room'}
        breadcrumbs={['Dashboard', 'Front Desk', 'Room Master', mode === 'add' ? 'Add' : 'Edit']}
        showBack
        onBack={onCancel}
      />

      <form onSubmit={handleSubmit} className="mt-6">
        {/* Card 1: Basic Information */}
        <FormCard title="Basic Information">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
            {/* Room Number */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">
                Room Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.roomNo}
                onChange={e => setForm(f => ({ ...f, roomNo: e.target.value }))}
                placeholder="e.g. 101"
                required
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-[#F8FAFC] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all"
              />
            </div>

            {/* Room Name */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">
                Room Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Executive Room 101"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-[#F8FAFC] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all"
              />
            </div>

            {/* Room Floor */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">Room Floor</label>
              <select
                value={form.floor}
                onChange={e => setForm(f => ({ ...f, floor: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-white text-gray-800 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all cursor-pointer"
              >
                <option value="Ground Floor">Ground Floor</option>
                <option value="First Floor">First Floor</option>
                <option value="Second Floor">Second Floor</option>
                <option value="Third Floor">Third Floor</option>
              </select>
            </div>

            {/* Room Category */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">Room Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-white text-gray-800 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all cursor-pointer"
              >
                <option value="Standard Comfort Room">Standard Comfort Room</option>
                <option value="Premium Deluxe King Room">Premium Deluxe King Room</option>
                <option value="Presidential Penthouse Suite">Presidential Penthouse Suite</option>
              </select>
            </div>

            {/* Include in Room Count */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">Include in Room Count</label>
              <select
                value={form.includeInCount}
                onChange={e => setForm(f => ({ ...f, includeInCount: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-white text-gray-800 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all cursor-pointer"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* Active */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">Active</label>
              <select
                value={form.active}
                onChange={e => setForm(f => ({ ...f, active: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-white text-gray-800 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all cursor-pointer"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        </FormCard>

        {/* Card 2: Room Features */}
        <FormCard title="Room Features & Description">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
            {/* Features multi-select checkbox list */}
            <div className="md:col-span-2 flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">Select Room Features</label>
              <div className="grid grid-cols-2 gap-3 p-4 border border-gray-200 rounded-xl bg-[#F8FAFC]">
                {FEATURES_OPTIONS.map((feat) => (
                  <label key={feat} className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.features.includes(feat)}
                      onChange={() => handleFeatureToggle(feat)}
                      className="w-4 h-4 text-[#418a8b] border-gray-300 rounded-sm focus:ring-[#418a8b]/20 cursor-pointer"
                    />
                    <span>{feat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2 flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Enter room details, view features, or amenities notes..."
                rows={4}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-[#F8FAFC] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all"
              />
            </div>
          </div>
        </FormCard>

        <CommonActionButtons
          onCancel={onCancel}
          saveText={mode === 'add' ? 'Save' : 'Update'}
        />
      </form>
    </div>
  );
};

export default RoomMasterForm;
