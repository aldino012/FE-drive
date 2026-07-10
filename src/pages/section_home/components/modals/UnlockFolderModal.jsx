// src/pages/section_home/components/modals/UnlockFolderModal.jsx
import React, { useState, useEffect } from "react";
import { FaLockOpen, FaEye, FaEyeSlash, FaKey } from "react-icons/fa";
import Modal from "../../../../components/Modal";
import Button from "../../../../components/Button";

const UnlockFolderModal = ({
  isOpen,
  onClose,
  item,
  unlockFolder,
  isActionLoading,
  onSuccess,
  onError,
}) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Reset state saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setShowPassword(false);
    }
  }, [isOpen]);

  const handleUnlock = async () => {
    if (!password) {
      onError("Password wajib diisi");
      return;
    }

    const result = await unlockFolder(item.path, password);

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
      title="Buka Kunci Folder"
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
            onClick={handleUnlock}
            disabled={!password || isActionLoading}
            isLoading={isActionLoading}
            leftIcon={<FaLockOpen className="w-4 h-4" />}
          >
            Buka Kunci
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Info Folder */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-3">
          <FaKey className="text-yellow-600 mt-1 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-yellow-900">
              Folder terkunci: <strong>{item?.name}</strong>
            </p>
            <p className="text-xs text-yellow-700 mt-1 font-mono break-all">
              {item?.path}
            </p>
          </div>
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Masukkan Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password folder atau Master Password"
              disabled={isActionLoading}
              autoFocus
              className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              onKeyDown={(e) => {
                if (e.key === "Enter" && password && !isActionLoading) {
                  handleUnlock();
                }
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Tip: Anda juga bisa menggunakan <strong>Master Password</strong>{" "}
            jika lupa password asli folder ini.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default UnlockFolderModal;
