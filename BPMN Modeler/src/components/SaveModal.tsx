import React from 'react';

const SaveModal = ({ isOpen, onSave, onDiscard }) => {
    if (!isOpen) return null;

    return (
        <div className="modal modal-modeler">
            <div className="modal-window">
                <div className="modal-title modal-danger">
                    Do you want to save your changes?
                </div>
                <div className="modal-content">
                    <p>You have unsaved changes in your BPMN model, do you want to save your model before leaving?</p>
                    <button onClick={onSave}>Save changes</button>
                    <button className="button-danger" onClick={onDiscard}>Discard changes</button>
                </div>
            </div>
        </div>
    );
};

export default SaveModal;
