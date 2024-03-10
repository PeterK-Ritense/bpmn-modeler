import React, {useState} from "react";
import {getDatabase, push, ref, set} from "firebase/database";
import toastr from 'toastr';

const InviteModal = ({ isOpen, onClose, projectId, userId }) => {
    const [inviteEmail, setInviteEmail] = useState('');

    const handleInvite = () => {
        const db = getDatabase();
        const newInvitationRef = push(ref(db, 'invitations'));

        console.log('invite: ', projectId);
        set(newInvitationRef, {
            projectId: projectId,
            invitedEmail: inviteEmail,
            senderId: userId,
            status: 'Pending',
            sentAt: new Date().toISOString()
        }).then(() => {
            toastr.success('Invitation sent');
            onClose();
            setInviteEmail(''); // Reset the email input field
        }).catch(error => {
            toastr.error('Error sending invitation:', error);
        });
    };

    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className="modal-window">
                <div className="modal-title">
                    Invite member
                    <button className="modal-close button-danger" onClick={onClose}>Close</button>
                </div>
                <div className="modal-content">
                    <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="Enter email address"
                    />
                    <button onClick={handleInvite}>Invite to Project</button>
                </div>
            </div>
        </div>
    );
};

export default InviteModal;