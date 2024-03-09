import React, { useState } from 'react';

const AddProjectModal = ({ isOpen, onClose, onAddProject }) => {
    const [newProjectName, setNewProjectName] = useState('');

    const handleAddProject = () => {
        onAddProject(newProjectName);
        setNewProjectName('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className="modal-window">
                <div className="modal-title">
                    Add Project
                    <button className="modal-close button-danger" onClick={onClose}>Close</button>
                </div>
                <div className="modal-content">
                    <input
                        type="text"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        placeholder="New Project Name"
                    />
                    <button onClick={handleAddProject}>Add Project</button>
                </div>
            </div>
        </div>
    );
};

export default AddProjectModal;
