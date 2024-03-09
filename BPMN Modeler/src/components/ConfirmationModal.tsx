import React from 'react';

const ConfirmationModal = ({ isOpen, message, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className="modal-window">
                <div className="modal-title modal-danger">
                    Delete
                </div>
                <div className="modal-content">
                    <p>{message}</p>
                    <button className="button-danger" onClick={onConfirm}>Confirm</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
