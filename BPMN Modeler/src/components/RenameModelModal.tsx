import React, { useState } from 'react';

const RenameModelModal = ({ isOpen, onClose, onRenameModel, currentName }) => {
    const [newModelName, setNewModelName] = useState('');

    const handleRenameModel = () => {
        onRenameModel(newModelName);
        setNewModelName('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className="modal-window">
                <div className="modal-title">
                    Rename Model
                    <button className="modal-close button-danger" onClick={onClose}>Close</button>
                </div>
                <div className="modal-content">
                    <input
                        type="text"
                        value={newModelName !== '' ? newModelName : currentName}
                        onChange={(e) => setNewModelName(e.target.value)}
                        placeholder="New Project Name"
                    />
                    <button onClick={handleRenameModel}>Rename Model</button>
                </div>
            </div>
        </div>
    );
};

export default RenameModelModal;
