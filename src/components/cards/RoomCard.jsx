import React from 'react';

const RoomCard = ({ roomNumber, type, status, price, image }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
      {image && <img src={image} alt={`Room ${roomNumber}`} className="w-full h-48 object-cover" />}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-bold text-lg text-gray-800">Room {roomNumber}</h4>
            <p className="text-sm text-gray-500">{type}</p>
          </div>
          <span className={`px-2 py-1 rounded text-xs font-semibold ${
            status === 'available' ? 'bg-green-100 text-green-800' :
            status === 'occupied' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {status}
          </span>
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
          <span className="text-indigo-600 font-bold">Rs. {price}/night</span>
          <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">Details</button>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
