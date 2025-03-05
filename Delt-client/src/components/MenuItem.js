import React, { useState } from 'react';
import { Trash2 } from "lucide-react";

const MenuItem = ({ item, onSelect, isSelected, isAdmin, disabled, onDelete, onDeleteItem, isRegistered, className }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);

  const handleMouseEnter = () => {
    const timeout = setTimeout(() => {
      setIsHovered(true);
    }, 900);
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout);
    setIsHovered(false);
  };

  const isFull = item.spotsTaken >= item.spotsAvaliable;
  const status = isFull ? "Full" : "Open";
  
  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={!isFull && !disabled ? () => onSelect(item.mealID) : undefined}
      className={`
        relative
        flex-shrink-0
        flex 
        flex-col 
        items-center 
        justify-between 
        p-4 
        rounded-lg 
        shadow-md 
        w-48
        h-64
        mx-2
        transition-all
        duration-200
        ${isFull || disabled 
          ? "bg-gray-100" 
          : isSelected
            ? "bg-blue-50 border-2 border-blue-500" 
            : "bg-white hover:bg-gray-50 hover:shadow-lg cursor-pointer"
        }
      `+ (className ? ` ${className}` : "")
    }
    >
      {/* Admin Delete Button - Positioned at top right */}
      {isAdmin && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteItem(item.mealID);
          }}
          className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
          title="Delete item (Admin only)"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}

      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-800">
          {item.day}
        </h2>
        <p className="text-sm text-gray-500 mb-2">{item.date}</p>
      </div>

      <p className="text-sm text-gray-700 text-center flex-grow">
        {item.description}
      </p>
      {isHovered && item.names.length > 0 && (
        <div className="mt-2 w-full max-h-18 overflow-y-auto text-center px-2 border-t border-gray-200 pt-1">
          <p className="text-sm font-medium text-gray-700">Attendees:</p>
          {item.names.map((name, index) => (
            <>
            <p key={index} className="text-sm text-gray-600  py-0.5">{name}</p>
            </>
          ))}
        </div>
      )}
      <div className="mt-auto">
        <p className={`text-sm font-medium ${isFull ? "text-red-500" : "text-green-500"}`}>
          {status}
        </p>
        <p className="text-sm text-gray-600">
          {item.spotsTaken}/{item.spotsAvaliable} spots
        </p>

        {isRegistered && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.mealID);
            }}
            className="mt-2 flex items-center gap-1 px-3 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span className="text-sm">Cancel</span>
          </button>
        )}
      </div>

      
    </div>
  );
};

export default MenuItem;