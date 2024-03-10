import React, { useState } from 'react';

const AddBPMNModelModal = ({ isOpen, onClose, onAddModel, projectId }) => {
    const [newModelName, setNewModelName] = useState('');

    const handleAddModel = () => {
        onAddModel(projectId, newModelName);
        setNewModelName('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className="modal-window">
                <div className="modal-title">
                    Add model
                    <button className="modal-close button-danger" onClick={onClose}>Close</button>
                </div>
                <div className="modal-content">
                    <input
                        type="text"
                        value={newModelName}
                        onChange={(e) => setNewModelName(e.target.value)}
                        placeholder="New model Name"
                    />
                    <button onClick={handleAddModel}>Add</button>
                </div>
            </div>
        </div>
    );
};

export default AddBPMNModelModal;
