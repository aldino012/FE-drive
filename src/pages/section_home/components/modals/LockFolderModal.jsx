// src/pages/section_home/components/modals/LockFolderModal.jsx
import React, { useState, useEffect } from "react";
import { FaLock, FaEye, FaEyeSlash, FaShieldAlt } from "react-icons/fa";
import Modal from "../../../../components/Modal";
import Button from "../../../../components/Button";

const LockFolderModal = ({
  isOpen,
  onClose,
  item,
  lockFolder,
  isActionLoading,
  onSuccess,
  onError,
}) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Reset state saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setConfirmPassword("");
      setShowPassword(false);
    }
  }, [isOpen]);

  const handleLock = async () => {
    if (password.length < 4) {
      onError("Password minimal 4 karakter");
      return;
    }
    if (password !== confirmPassword) {
      onError("Konfirmasi password tidak cocok");
      return;
    }

    const result = await lockFolder(item.path, password);

    if (result.success) {
      onSuccess();
    } else {
      onError(result.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kunci Folder"
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isActionLoading}
          >
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleLock}
            disabled={!password || !confirmPassword || isActionLoading}
            isLoading={isActionLoading}
            leftIcon={<FaLock className="w-4 h-4" />}
          >
            Kunci Folder
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Info Folder */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
          <FaShieldAlt className="text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              Mengunci folder: <strong>{item?.name}</strong>
            </p>
            <p className="text-xs text-blue-700 mt-1 font-mono break-all">
              {item?.path}
            </p>
            <p className="text-xs text-blue-600 mt-2">
              Folder yang dikunci tidak akan bisa diakses, di-search, atau
              di-download tanpa password.
            </p>
          </div>
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password (min. 4 karakter)"
              disabled={isActionLoading}
              autoFocus
              className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* Confirm Password Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Konfirmasi Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password"
              disabled={isActionLoading}
              className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-red-500 mt-1">Password tidak cocok</p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default LockFolderModal;
