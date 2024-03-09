import React, { useState, useEffect } from 'react';
import { get, getDatabase, ref, push, set, remove, query, orderByChild, equalTo, update } from "firebase/database";
import InviteModal from './InviteModal.tsx'
import AddBPMNModelModal from './AddBPMNModelModal.tsx';
import AddProjectModal from "./AddProjectModal.tsx";
import ConfirmationModal from "./ConfirmationModal.tsx";

const ProjectList = ({ userId, userEmail, onOpenModel }) => {
    const [projects, setProjects] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isAddModelModalOpen, setIsAddModelModalOpen] = useState(false);
    const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmModalContent, setConfirmModalContent] = useState({ message: '', onConfirm: () => {} });

    // Fetch projects when component mounts or userId changes
    useEffect(() => {
        fetchUserProjects(userId);
        fetchInvites();
    }, [userId]);

    const handleAddProject = (newProjectName) => {
        if (newProjectName) {
            const db = getDatabase();
            const projectsRef = ref(db, 'projects');

            // Generate a new project ID
            const newProjectRef = push(projectsRef);

            // Set the project data
            set(newProjectRef, {
                name: newProjectName,
                description: '',
                ownerId: userId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                members: {
                    [userId]: 'owner' // Assigning the role of 'owner' to the user who created the project
                }
            }).then(() => {
                console.log('New project added successfully');
                fetchUserProjects(userId);
            }).catch((error) => {
                console.error('Error adding new project: ', error);
            });
        }
    };

    const handleAddBPMNModel = (projectId, newModelName) => {
        if (newModelName) {
            const db = getDatabase();
            const bpmnModelsRef = ref(db, 'bpmnModels');

            // Generate a new model ID
            const newModelRef = push(bpmnModelsRef);

            // Set the BPMN model data
            set(newModelRef, {
                projectId: projectId,
                ownerId: userId,
                name: newModelName,
                xmlData: `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:camunda="http://camunda.org/schema/1.0/bpmn" xmlns:modeler="http://camunda.org/schema/modeler/1.0" id="Definitions_1y9ob7p" targetNamespace="http://bpmn.io/schema/bpmn" exporter="Camunda Modeler" exporterVersion="5.19.0" modeler:executionPlatform="Camunda Platform" modeler:executionPlatformVersion="7.20.0">
  <bpmn:process id="${camelize(newModelName)}" name="${newModelName}" isExecutable="true" camunda:historyTimeToLive="180">
    <bpmn:startEvent id="StartEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="${camelize(newModelName)}">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="179" y="79" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }).then(() => {
                console.log('New BPMN model added successfully');
                fetchUserProjects(userId);
            }).catch((error) => {
                console.error('Error adding new BPMN model: ', error);
            });
        }
    };

    function camelize(str) {
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '');
    }

    const fetchUserProjects = async (userId) => {
        const db = getDatabase();
        const usersRef = ref(db, 'users');
        const projectsRef = ref(db, 'projects');
        const bpmnModelsRef = ref(db, 'bpmnModels');

        const [usersSnapshot, projectsSnapshot, bpmnModelsSnapshot] = await Promise.all([
            get(usersRef),
            get(projectsRef),
            get(bpmnModelsRef)
        ]);

        if (projectsSnapshot.exists()) {
            const usersData = usersSnapshot.exists() ? usersSnapshot.val() : {};
            const projectsData = projectsSnapshot.val();
            const bpmnModelsData = bpmnModelsSnapshot.exists() ? bpmnModelsSnapshot.val() : {};
            const userProjects = [];

            Object.keys(projectsData).forEach((projectId) => {
                const project = projectsData[projectId];
                if (project.members && project.members[userId]) {
                    const projectModels = Object.keys(bpmnModelsData)
                        .filter(modelId => bpmnModelsData[modelId].projectId === projectId)
                        .map(modelId => ({
                            id: modelId,
                            ...bpmnModelsData[modelId]
                        }));

                    const projectMembers = Object.keys(project.members).map(memberId => ({
                        id: memberId,
                        role: project.members[memberId],
                        displayName: usersData[memberId]?.displayName || 'Unknown',
                        email: usersData[memberId]?.email || 'Unknown'
                    }));

                    userProjects.push({
                        id: projectId,
                        ...project,
                        models: projectModels,
                        members: projectMembers
                    });
                }
            });

            setProjects(userProjects);
        } else {
            console.log('No projects available');
            return [];
        }
    };

    const fetchInvites = async () => {
        const db = getDatabase();
        const invitationsRef = ref(db, 'invitations');
        const usersRef = ref(db, 'users');
        const projectsRef = ref(db, 'projects');
        const invitationsQuery = query(invitationsRef, orderByChild('invitedEmail'), equalTo(userEmail));

        try {
            const [invitationsSnapshot, usersSnapshot, projectsSnapshot] = await Promise.all([
                get(invitationsQuery),
                get(usersRef),
                get(projectsRef)
            ]);

            if (invitationsSnapshot.exists()) {
                const invitationsData = invitationsSnapshot.val();
                const usersData = usersSnapshot.exists() ? usersSnapshot.val() : {};
                const projectsData = projectsSnapshot.exists() ? projectsSnapshot.val() : {};

                const invitationsList = Object.keys(invitationsData).map((key) => {
                    const invitation = invitationsData[key];
                    return {
                        id: key,
                        ...invitation,
                        senderName: usersData[invitation.senderId]?.displayName || 'Unknown',
                        senderEmail: usersData[invitation.senderId]?.email || 'Unknown',
                        projectName: projectsData[invitation.projectId]?.name || 'Unknown'
                    };
                });

                setInvitations(invitationsList);
            } else {
                console.log('No invitations found');
            }
        } catch (error) {
            console.error('Error fetching invitations:', error);
        }
    }

    const openConfirmModal = (message, onConfirm) => {
        setConfirmModalContent({ message, onConfirm });
        setIsConfirmModalOpen(true);
    };

    const onDeleteModel = (modelId) => {
        const db = getDatabase();
        const modelRef = ref(db, `bpmnModels/${modelId}`);

        remove(modelRef).then(() => {
            console.log('BPMN model deleted successfully');
            fetchUserProjects(userId);
            setIsConfirmModalOpen(false);
        }).catch((error) => {
            console.error('Error deleting BPMN model: ', error);
        });
    }

    const onDeleteProject = (projectId) => {
        const db = getDatabase();
        const modelRef = ref(db, `projects/${projectId}`);

        remove(modelRef).then(() => {
            console.log('Project deleted successfully');
            fetchUserProjects(userId);
            setIsConfirmModalOpen(false);
        }).catch((error) => {
            console.error('Error deleting project: ', error);
        });
    }

    const handleAccept = (invitation) => {
        acceptInvitation(invitation.id, invitation.projectId, userId);
    };

    const acceptInvitation = (invitationId, projectId, userId) => {
        const db = getDatabase();
        const updates = {};
        updates['/invitations/' + invitationId + '/status'] = 'Accepted';
        updates['/projects/' + projectId + '/members/' + userId] = 'editor';

        update(ref(db), updates).then(() => {
            console.log('Invitation accepted and user added to project');
            setIsInviteModalOpen(false);
            fetchInvites();
            fetchUserProjects(userId);
        }).catch((error) => {
            console.error('Error accepting invitation:', error);
        });
    };

    const handleDelete = (invitation) => {
        deleteInvitation(invitation.id);
    };

    const deleteInvitation = (invitationId) => {
        const db = getDatabase();

        const updates = {};
        updates['/invitations/' + invitationId + '/status'] = 'Declined';

        update(ref(db), updates).then(() => {
            console.log('Invitation removed');
            fetchInvites();
        }).catch((error) => {
            console.error('Error removing invitation:', error);
        });
    };

    const handleRemoveMember = (projectId, memberId) => {
        const db = getDatabase();
        const memberRef = ref(db, `projects/${projectId}/members/${memberId}`);

        remove(memberRef).then(() => {
            console.log(`Member ${memberId} removed from project ${projectId}`);
            fetchUserProjects(userId); // Refetch projects to update the UI
            setIsConfirmModalOpen(false); // Close the confirmation modal
        }).catch((error) => {
            console.error('Error removing member:', error);
        });
    };


    return (
        <div className="projects-wrapper">
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                message={confirmModalContent.message}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmModalContent.onConfirm}
            />
            {invitations.filter((invite) => invite.status === 'Pending').length > 0 && <div className="projects-invitations">
                <div className="projects-invitations-title">
                    <h2>You have {invitations.length > 1 ? 'invites' : 'an invite'}!</h2>
                </div>
                {invitations.map((invitation) => (
                    <div key={invitation.id} className="projects-invitations-invite">
                        <div className="projects-invitations-invite-status">
                            {invitation.status}
                        </div>
                        <div className="projects-invitations-invite-text">
                            Invite for the
                            project <strong>{invitation.projectName}</strong> from <strong>{invitation.senderName}</strong>
                        </div>
                        {invitation.status === 'Pending' && <div className="projects-invitations-invite-buttons">
                            <button onClick={() => handleAccept(invitation)}>Accept Invite</button>
                            <button className="button-danger" onClick={() => handleDelete(invitation)}>Decline Invite
                            </button>
                        </div>}
                    </div>
                ))}
            </div>}
            <div className="projects-list">
                <div className="projects-title">
                    <h2>My Projects</h2>
                    <button onClick={() => setIsAddProjectModalOpen(true)}>Add Project</button>
                    <AddProjectModal
                        isOpen={isAddProjectModalOpen}
                        onClose={() => setIsAddProjectModalOpen(false)}
                        onAddProject={handleAddProject}
                    />
                </div>
                {projects.length === 0 && <div className="no-projects">
                    Click the 'Add Project' button to create your first project!
                </div>}
                {projects.map((project) => (
                    <div key={project.id} className="projects-project">
                        <div className="projects-project-title">
                            <h3>{project.name}</h3>
                            <div>
                                {project.ownerId === userId && (
                                    <button className="button-danger" onClick={() => openConfirmModal(
                                        `Are you sure you want to delete project '${project.name}'?`,
                                        () => onDeleteProject(project.id)
                                    )}>Delete Project</button>
                                )}
                            </div>
                        </div>
                        <div>
                            <div className="projects-members-title">
                            <h4>Members</h4>
                                <button onClick={() => {
                                    setIsInviteModalOpen(true);
                                    setSelectedProjectId(project.id);
                                }}>Invite Member</button>
                                <InviteModal
                                    isOpen={isInviteModalOpen}
                                    onClose={() => setIsInviteModalOpen(false)}
                                    projectId={selectedProjectId}
                                    userId={userId}
                                />
                            </div>
                            {project.members.map((member) => (
                                <div key={project.id + member.id} className="projects-members">
                                    <div className="projects-members-role">{member.role}</div>
                                    <div className="projects-members-name">{member.displayName}</div>
                                    <div className="projects-members-email">{member.email}</div>
                                    {project.ownerId === userId && member.id !== userId && (
                                        <button className="projects-members-remove button-danger" onClick={() => openConfirmModal(
                                            `Are you sure you want to remove ${member.displayName} from this project?`,
                                            () => handleRemoveMember(project.id, member.id)
                                        )}>Remove Member</button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div>
                            <div className="projects-models-title">
                                <h4>BPMN Models</h4>
                                <button onClick={() => {
                                    setIsAddModelModalOpen(true);
                                    setSelectedProjectId(project.id);
                                }}>Add BPMN model
                                </button>
                                <AddBPMNModelModal
                                    isOpen={isAddModelModalOpen}
                                    onClose={() => setIsAddModelModalOpen(false)}
                                    onAddModel={handleAddBPMNModel}
                                    projectId={selectedProjectId}
                                />
                            </div>
                            {project.models.length === 0 && <div className="projects-model">
                                Add a new BPMN model and start modeling!
                            </div>}
                            {project.models.map((model) => {
                                return <div className="projects-model" key={model.id}>
                                    <p onClick={() => onOpenModel(project, model)} className="projects-model-title">
                                        {model.name}
                                    </p>
                                    {model.ownerId === userId && (
                                        <button className="button-danger" onClick={() => openConfirmModal(
                                            `Are you sure you want to delete model '${model.name}'?`,
                                            () => onDeleteModel(model.id)
                                        )}>Delete model</button>
                                    )}
                                </div>
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
        ;
};

export default ProjectList;
