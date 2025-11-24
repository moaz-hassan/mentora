/**
 * Avatar Upload Component
 * Handles profile picture upload and display
 */

import { Camera } from "lucide-react";

export default function AvatarUpload({ 
  avatarUrl, 
  firstName, 
  onUpload, 
  disabled 
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Profile Picture
      </label>
      <div className="flex items-center gap-4">
        <div className="relative">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
              {firstName?.charAt(0) || "U"}
            </div>
          )}
          <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm cursor-pointer border border-gray-300 hover:bg-gray-50">
            <Camera className="w-4 h-4 text-gray-600" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onUpload}
              disabled={disabled}
            />
          </label>
        </div>
        <div>
          <p className="text-sm text-gray-600">
            JPG, PNG or GIF. Max size 2MB
          </p>
        </div>
      </div>
    </div>
  );
}
