// src/pages/section_home/components/modals/ChangeLockPasswordModal.jsx
import React, { useState, useEffect } from "react";
import { FaKey, FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import Modal from "../../../../components/Modal";
import Button from "../../../../components/Button";

const ChangeLockPasswordModal = ({
  isOpen,
  onClose,
  item,
  changePassword,
  isActionLoading,
  onSuccess,
  onError,
}) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  // Reset state saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswords(false);
    }
  }, [isOpen]);

  const handleChange = async () => {
    if (!oldPassword) {
      onError("Password lama wajib diisi");
      return;
    }
    if (newPassword.length < 4) {
      onError("Password baru minimal 4 karakter");
      return;
    }
    if (newPassword !== confirmPassword) {
      onError("Konfirmasi password baru tidak cocok");
      return;
    }

    const result = await changePassword(item.path, oldPassword, newPassword);

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
      title="Ubah Password Folder"
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
            onClick={handleChange}
            disabled={
              !oldPassword ||
              !newPassword ||
              !confirmPassword ||
              isActionLoading
            }
            isLoading={isActionLoading}
            leftIcon={<FaKey className="w-4 h-4" />}
          >
            Simpan Perubahan
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Info Folder */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-start gap-3">
          <FaLock className="text-purple-600 mt-1 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-purple-900">
              Mengubah password untuk: <strong>{item?.name}</strong>
            </p>
            <p className="text-xs text-purple-700 mt-1 font-mono break-all">
              {item?.path}
            </p>
          </div>
        </div>

        {/* Old Password Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password Lama
          </label>
          <div className="relative">
            <input
              type={showPasswords ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Masukkan password lama atau Master Password"
              disabled={isActionLoading}
              autoFocus
              className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
            <button
              type="button"
              onClick={() => setShowPasswords(!showPasswords)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            💡 Gunakan <strong>Master Password</strong> jika Anda lupa password
            asli folder ini.
          </p>
        </div>

        {/* New Password Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password Baru
          </label>
          <input
            type={showPasswords ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Masukkan password baru (min. 4 karakter)"
            disabled={isActionLoading}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>

        {/* Confirm New Password Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Konfirmasi Password Baru
          </label>
          <input
            type={showPasswords ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Ulangi password baru"
            disabled={isActionLoading}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-red-500 mt-1">Password tidak cocok</p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ChangeLockPasswordModal;