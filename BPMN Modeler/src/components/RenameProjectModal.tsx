import React, { useState } from 'react';

const RenameProjectModal = ({ isOpen, onClose, onRenameProject, currentName }) => {
    const [newProjectName, setNewProjectName] = useState('');

    const handleRenameProject = () => {
        onRenameProject(newProjectName);
        setNewProjectName('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className="modal-window">
                <div className="modal-title">
                    Rename Project
                    <button className="modal-close button-danger" onClick={onClose}>Close</button>
                </div>
                <div className="modal-content">
                    <input
                        type="text"
                        value={newProjectName !== '' ? newProjectName : currentName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        placeholder="New Project Name"
                    />
                    <button onClick={handleRenameProject}>Rename Project</button>
                </div>
            </div>
        </div>
    );
};

export default RenameProjectModal;
