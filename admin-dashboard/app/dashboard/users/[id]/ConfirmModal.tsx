import React, { useState } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  confirmationPhrase: string;
  message: string;
}

export function ConfirmModal({ isOpen, onClose, onConfirm, confirmationPhrase, message }: ConfirmModalProps) {
  const [input, setInput] = useState("");

  if (!isOpen) return null;

  const handleConfirmClick = () => {
    if (input === confirmationPhrase) {
      onConfirm();
      setInput("");
    } else {
      alert("Wrong phrase !");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
        <h2 className="text-lg font-semibold mb-3">Confirmation requiered</h2>
        <p className="mb-4">{message}</p>
        <input
          type="text"
          className="border rounded w-full p-2 mb-4"
          placeholder={`Tapez "${confirmationPhrase}"`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
        />
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
            onClick={() => {
              onClose();
              setInput("");
            }}
          >
            Abort
          </button>
          <button
            className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700"
            onClick={handleConfirmClick}
          >
            Validate
          </button>
        </div>
      </div>
    </div>
  );
}
