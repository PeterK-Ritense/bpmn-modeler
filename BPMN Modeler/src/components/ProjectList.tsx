import React, {useState, useEffect, ChangeEvent, useRef} from 'react';
import { get, getDatabase, ref, push, set, remove, query, orderByChild, equalTo, update } from "firebase/database";
import InviteModal from './InviteModal.tsx'
import AddBPMNModelModal from './AddBPMNModelModal.tsx';
import AddProjectModal from "./AddProjectModal.tsx";
import ConfirmationModal from "./ConfirmationModal.tsx";
import toastr from 'toastr';
import RenameProjectModal from "./RenameProjectModal.tsx";
import RenameModelModal from "./RenameModelModal.tsx";

const ProjectList = ({ user, viewMode, currentProject, onOpenModel, onNavigateHome, onOpenProject }) => {
    const [projects, setProjects] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isAddModelModalOpen, setIsAddModelModalOpen] = useState(false);
    const [isAddDMNModalOpen, setIsAddDMNModalOpen] = useState(false);
    const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
    const [isRenameProjectModalOpen, setIsRenameProjectModalOpen] = useState(false);
    const [isRenameModelModalOpen, setIsRenameModelModalOpen] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState({});
    const [confirmModalContent, setConfirmModalContent] = useState({ message: '', onConfirm: () => {} });

    const fileInputRef = useRef(null);

    // Fetch projects when component mounts or userId changes
    useEffect(() => {
        fetchUserProjects(user.uid);
        fetchInvites();
    }, [user.uid]);

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
                ownerId: user.uid,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                members: {
                    [user.uid]: 'owner' // Assigning the role of 'owner' to the user who created the project
                }
            }).then(() => {
                toastr.success('New project added successfully');
                fetchUserProjects(user.uid);
            }).catch((error) => {
                toastr.error('Error adding new project: ', error);
            });
        }
    };

    const handleRenameProject = (newProjectName) => {
        const db = getDatabase();
        const projectRef = ref(db, `projects/${currentProject.id}`);

        update(projectRef, { name: newProjectName })
            .then(() => {
                fetchUserProjects(user.uid);
                toastr.success("Project name updated successfully");
            })
            .catch((error) => toastr.error("Error updating project name: ", error));
    }

    const handleAddBPMNModel = (projectId, newModelName) => {
        if (newModelName) {
            const db = getDatabase();
            const bpmnModelsRef = ref(db, 'bpmnModels');

            // Generate a new model ID
            const newModelRef = push(bpmnModelsRef);

            // Set the BPMN model data
            set(newModelRef, {
                projectId: projectId,
                ownerId: user.uid,
                name: newModelName,
                type: 'bpmn',
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
                toastr.success('New BPMN model added successfully');
                fetchUserProjects(user.uid);
            }).catch((error) => {
                toastr.error('Error adding new BPMN model: ', error);
            });
        }
    };

    const handleAddDMNModel = (projectId, newModelName) => {
        if (newModelName) {
            const db = getDatabase();
            const bpmnModelsRef = ref(db, 'bpmnModels');

            // Generate a new model ID
            const newModelRef = push(bpmnModelsRef);

            // Set the BPMN model data
            set(newModelRef, {
                projectId: projectId,
                ownerId: user.uid,
                name: newModelName,
                type: 'dmn',
                xmlData: `<?xml version="1.0" encoding="UTF-8"?>
                            <definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" xmlns:dmndi="https://www.omg.org/spec/DMN/20191111/DMNDI/" xmlns:dc="http://www.omg.org/spec/DMN/20180521/DC/" xmlns:modeler="http://camunda.org/schema/modeler/1.0" id="${camelize(newModelName)}Drd" name="${newModelName} DRD" namespace="http://camunda.org/schema/1.0/dmn" exporter="Camunda Modeler" exporterVersion="5.19.0" modeler:executionPlatform="Camunda Platform" modeler:executionPlatformVersion="7.20.0">
                              <decision id="${camelize(newModelName)}" name="${newModelName}">
                                <decisionTable id="DecisionTable_1tsa30h">
                                  <input id="Input_1">
                                    <inputExpression id="InputExpression_1" typeRef="string">
                                      <text></text>
                                    </inputExpression>
                                  </input>
                                  <output id="Output_1" typeRef="string" />
                                </decisionTable>
                              </decision>
                              <dmndi:DMNDI>
                                <dmndi:DMNDiagram>
                                  <dmndi:DMNShape dmnElementRef="${camelize(newModelName)}">
                                    <dc:Bounds height="80" width="180" x="160" y="100" />
                                  </dmndi:DMNShape>
                                </dmndi:DMNDiagram>
                              </dmndi:DMNDI>
                            </definitions>`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }).then(() => {
                toastr.success('New DMN model added successfully');
                fetchUserProjects(user.uid);
            }).catch((error) => {
                toastr.error('Error adding new BPMN model: ', error);
            });
        }
    };

    const onRenameModel = (model) => {
        setSelectedModel(model);
        setIsRenameModelModalOpen(true);
    }
    
    const handleRenameModel = (newModelName) => {
        const db = getDatabase();
        const modelRef = ref(db, `bpmnModels/${selectedModel.id}`);

        update(modelRef, { name: newModelName })
            .then(() => {
                fetchUserProjects(user.uid);
                toastr.success("Model name updated successfully");
            })
            .catch((error) => toastr.error("Error updating model name: ", error));
    }

    const handleDuplicateModel = (model) => {
        if (model) {
            const db = getDatabase();
            const bpmnModelsRef = ref(db, 'bpmnModels');

            // Generate a new model ID
            const newModelRef = push(bpmnModelsRef);

            // Set the BPMN model data
            set(newModelRef, {
                projectId: model.projectId,
                ownerId: user.uid,
                name: `${model.name} Copy`,
                type: model.type,
                xmlData: model.xmlData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }).then(() => {
                toastr.success('Model duplicated successfully');
                fetchUserProjects(user.uid);
            }).catch((error) => {
                toastr.error('Error duplicating model: ', error);
            });
        }
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>, projectId: string) => {
        const file = event.target.files?.[0];
        console.log('file: ', file);

        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
            const text = e.target?.result;
            if (file.name.endsWith('.bpmn')) {
                handleUploadBPMNModel(projectId, text as string);
            } else if (file.name.endsWith('.dmn')) {
                handleUploadDMNModel(projectId, text as string);
            }
            console.log('xml: ', text as string);
        };
        reader.readAsText(file);
    };

    const handleUploadBPMNModel = (projectId: string, xml: string) => {
        if (xml) {
            const db = getDatabase();
            const bpmnModelsRef = ref(db, 'bpmnModels');

            // Generate a new model ID
            const newModelRef = push(bpmnModelsRef);

            // Set the BPMN model data
            set(newModelRef, {
                projectId: projectId,
                ownerId: user.uid,
                name: extractBpmnProcessName(xml),
                type: 'bpmn',
                xmlData: xml,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }).then(() => {
                toastr.success('New BPMN model added successfully');
                fileInputRef.current.value = '';
                fetchUserProjects(user.uid);
            }).catch((error) => {
                toastr.error('Error adding new BPMN model: ', error);
            });
        }
    };

    const handleUploadDMNModel = (projectId: string, xml: string) => {
        if (xml) {
            const db = getDatabase();
            const bpmnModelsRef = ref(db, 'bpmnModels');

            // Generate a new model ID
            const newModelRef = push(bpmnModelsRef);

            // Set the DMN model data
            set(newModelRef, {
                projectId: projectId,
                ownerId: user.uid,
                name: extractDmnTableName(xml),
                type: 'dmn',
                xmlData: xml,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }).then(() => {
                toastr.success('New BPMN model added successfully');
                fileInputRef.current.value = '';
                fetchUserProjects(user.uid);
            }).catch((error) => {
                toastr.error('Error adding new BPMN model: ', error);
            });
        }
    };

    const handleUploadButtonClick = () => {
        fileInputRef.current.click();
    };

    function extractBpmnProcessName(xmlString: string): string | null {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "application/xml");
        const processElements = Array.from(xmlDoc.getElementsByTagName("bpmn:process"));

        if (processElements.length > 0) {
            return processElements[0].getAttribute("name");
        } else {
            console.error("No BPMN process element found.");
            return null;
        }
    }

    function extractDmnTableName(xmlString: string): string | null {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "application/xml");
        const processElements = Array.from(xmlDoc.getElementsByTagName("decision"));

        if (processElements.length > 0) {
            return processElements[0].getAttribute("name");
        } else {
            console.error("No DMN table element found.");
            return null;
        }
    }

    const downloadXmlAsBpmn = (model) => {
        const element = document.createElement("a");
        const file = new Blob([model.xmlData], { type: 'text/xml' });
        element.href = URL.createObjectURL(file);
        element.download = model.type === 'bpmn' ? toKebabCase(extractBpmnProcessName(model.xmlData)) + '.bpmn' : toKebabCase(extractDmnTableName(model.xmlData)) + '.dmn';
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
        document.body.removeChild(element);
    };

    function camelize(str) {
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '');
    }

    function toKebabCase(str) {
        return str
            .toLowerCase()
            .replace(/-/g, ' ')
            .replace(/\s+/g, ' ')
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/[\s_]+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
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
                    console.log('projectModels: ', projectModels);
                    const projectMembers = Object.keys(project.members).map(memberId => ({
                        id: memberId,
                        role: project.members[memberId],
                        displayName: usersData[memberId]?.displayName || 'Unknown',
                        email: usersData[memberId]?.email || 'Unknown',
                        imageUrl: usersData[memberId]?.imageUrl || 'user.png'
                    }));

                    userProjects.push({
                        id: projectId,
                        ...project,
                        models: projectModels,
                        members: projectMembers
                    });
                }
                console.log('project: ', userProjects);
            });

            setProjects(userProjects);
        } else {
            return [];
        }
    };

    const fetchInvites = async () => {
        const db = getDatabase();
        const invitationsRef = ref(db, 'invitations');
        const usersRef = ref(db, 'users');
        const projectsRef = ref(db, 'projects');
        const invitationsQuery = query(invitationsRef, orderByChild('invitedEmail'), equalTo(user.email));

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
            }
        } catch (error) {
            toastr.error('Error fetching invitations:', error);
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
            toastr.success('Model deleted successfully');
            fetchUserProjects(user.uid);
            setIsConfirmModalOpen(false);
        }).catch((error) => {
            toastr.error('Error deleting model: ', error);
        });
    }

    const onDeleteProject = (projectId) => {
        const db = getDatabase();
        const modelRef = ref(db, `projects/${projectId}`);

        remove(modelRef).then(() => {
            deleteModelsAndInvites(projectId);
            toastr.success('Project deleted successfully');
            fetchUserProjects(user.uid);
            setIsConfirmModalOpen(false);
            onNavigateHome();
        }).catch((error) => {
            toastr.error('Error deleting project: ', error);
        });
    }

    async function deleteModelsAndInvites(projectId) {
        const db = getDatabase();

        const modelsQuery = query(ref(db, 'bpmnModels'), orderByChild('projectId'), equalTo(projectId));
        const modelsSnapshot = await get(modelsQuery);
        modelsSnapshot.forEach((childSnapshot) => {
            remove(ref(db, `bpmnModels/${childSnapshot.key}`));
        });

        const invitesQuery = query(ref(db, 'invitations'), orderByChild('projectId'), equalTo(projectId));
        const invitesSnapshot = await get(invitesQuery);
        invitesSnapshot.forEach((childSnapshot) => {
            remove(ref(db, `invitations/${childSnapshot.key}`));
        });
    }

    const handleAccept = (invitation) => {
        acceptInvitation(invitation.id, invitation.projectId, user.uid);
    };

    const acceptInvitation = (invitationId, projectId, userId) => {
        const db = getDatabase();
        const updates = {};
        updates['/invitations/' + invitationId + '/status'] = 'Accepted';
        updates['/projects/' + projectId + '/members/' + userId] = 'editor';

        update(ref(db), updates).then(() => {
            toastr.success('Invitation accepted and user added to project');
            setIsInviteModalOpen(false);
            fetchInvites();
            fetchUserProjects(userId);
        }).catch((error) => {
            toastr.error('Error accepting invitation:', error);
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
            toastr.success('Invitation successfully declined');
            fetchInvites();
        }).catch((error) => {
            toastr.error('Error removing invitation:', error);
        });
    };

    const handleRemoveMember = (projectId, memberId) => {
        const db = getDatabase();
        const memberRef = ref(db, `projects/${projectId}/members/${memberId}`);

        remove(memberRef).then(() => {
            fetchUserProjects(user.uid);
            setIsConfirmModalOpen(false);
            toastr.success(`Member removed from project successfully`);
        }).catch((error) => {
            toastr.error('Error removing member:', error);
        });
    };

    function convertDateString(inputDateString: string): string {
        const datePart = inputDateString.split('T')[0];
        const timePart = inputDateString.split('T')[1].split(':');

        return `${datePart} ${timePart[0]}:${timePart[1]}`;
    }

    const getExtraMembersAsString = (members) => {
        let membersString = '';
        members.slice(4).forEach((member, i) => {
            membersString += `${member.displayName} (${member.role})`;
            if (i < members.length - 5) {
                membersString += ', ';
            }
        })

        return membersString;
    }

    return (
        <div className="projects-wrapper">
            {invitations.filter((invite) => invite.status === 'Pending').length > 0 &&
                <div className="projects-invitations">
                    <div className="projects-invitations-title">
                        <h2>You have {invitations.filter((item) => item.status === 'Pending').length > 1 ? 'invites' : 'an invite'}!</h2>
                    </div>
                    {invitations.filter((item) => item.status === 'Pending').map((invitation) => (
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
                                <button className="button-danger" onClick={() => handleDelete(invitation)}>Decline
                                    Invite
                                </button>
                            </div>}
                        </div>
                    ))}
                </div>}
            {viewMode === 'ALL_PROJECTS' && <div className="projects-list">
                <div className="projects-title">
                    <h3>My Projects</h3>
                    <button onClick={() => setIsAddProjectModalOpen(true)}>Add Project</button>
                </div>
                {projects.length === 0 && <div className="no-projects">
                    Click the 'Add Project' button to create your first project!
                </div>}
                {projects.map((project) => (
                    <div key={project.id} className="projects-project-row" onClick={() => onOpenProject(project)}>
                        <div className="projects-project-title">
                            <div className="projects-project-title-text">
                                <h3>{project.name}</h3>
                            </div>
                            <div className="projects-project-diagrams">
                                {project.models.length} {project.models.length === 1 ? 'diagram' : 'diagrams'}
                            </div>
                            <div className="projects-project-date">
                                {convertDateString(project.updatedAt)}
                            </div>
                            <div className="projects-members-small">
                                {project.members.length <= 5
                                    ? project.members.map((member) => (
                                        <div key={project.id + member.id} className="projects-member-small">
                                            <div className="projects-members-avatar"><img src={member.imageUrl}
                                                                                          alt="user-avatar"
                                                                                          title={`${member.displayName} (${member.role})`}/>
                                            </div>
                                        </div>
                                    ))
                                    : [...project.members.slice(0, 4), {
                                        id: 'extra',
                                        displayName: `+${project.members.length - 4}`,
                                        imageUrl: '/path/to/placeholder/image',
                                        role: ''
                                    }].map((member, index) => (
                                        index < 4 ? (
                                            <div key={project.id + member.id} className="projects-member-small">
                                                <div className="projects-members-avatar"><img src={member.imageUrl}
                                                                                              alt="user-avatar"
                                                                                              title={`${member.displayName} (${member.role})`}/>
                                                </div>
                                            </div>
                                        ) : (
                                            <div key={project.id + member.id} className="projects-member-small">
                                                <div className="projects-members-extra"
                                                     title={getExtraMembersAsString(project.members)}>+{project.members.length - 4}</div>
                                            </div>
                                        )
                                    ))
                                }
                            </div>
                            <div className="projects-project-actions">
                                {project.ownerId === user.uid && (
                                    <button className="button-danger" onClick={() => openConfirmModal(
                                        `Are you sure you want to delete project '${project.name}'?`,
                                        () => onDeleteProject(project.id)
                                    )}>Delete Project</button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>}

            {viewMode === 'PROJECT' && <div className="projects-list">
                {projects.filter((project) => project.id === currentProject.id).map((project) => (
                    <div key={project.id} className="projects-project">
                        <div className="projects-project-header-title">
                            <h3>{project.name}</h3>
                            <div>
                                {project.ownerId === user.uid && (
                                    <div>
                                        <button onClick={() => setIsRenameProjectModalOpen(true)}>Rename Project</button>
                                        <button className="button-danger" onClick={() => openConfirmModal(
                                            `Are you sure you want to delete project '${project.name}'?`,
                                            () => onDeleteProject(project.id)
                                        )}>Delete Project</button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="projects-overview">
                            <div className="projects-overview-models">
                                <div className="projects-models-title">
                                    <h4>Models</h4>
                                    <div className="projects-models-buttons">
                                        <input style={{display: 'none'}} type="file" accept=".bpmn, .dmn" ref={fileInputRef}
                                               onChange={(event) => handleFileChange(event, project.id)}/>
                                        <button onClick={handleUploadButtonClick}>Import</button>
                                        <button onClick={() => {
                                            setIsAddModelModalOpen(true);
                                            setSelectedProjectId(project.id);
                                        }}>Add BPMN
                                        </button>
                                        <button onClick={() => {
                                            setIsAddDMNModalOpen(true);
                                            setSelectedProjectId(project.id);
                                        }}>Add DMN
                                        </button>
                                    </div>
                                </div>
                                {project.models.length === 0 && <div className="projects-model">
                                    Add a new model and start modeling!
                                </div>}
                                {project.models.map((model) => {
                                    return <div className="projects-model" key={model.id} onClick={() => onOpenModel(project, model)}>
                                        <div
                                             className="projects-model-title">
                                            {model.name}
                                        </div>
                                        <div className="projects-model-type">
                                            {model.type}
                                        </div>
                                        <div className="projects-model-owner">
                                            {project.members.filter((member) => member.id == model.ownerId)[0]?.displayName || 's'}
                                        </div>
                                        <div className="projects-model-date">
                                            {convertDateString(model.updatedAt)}
                                        </div>
                                        <div className="projects-model-buttons">
                                            <div>
                                                <button onClick={(e) => {
                                                    e.stopPropagation();
                                                    downloadXmlAsBpmn(model);
                                                }}>
                                                    Download
                                                </button>
                                                <button onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDuplicateModel(model);
                                                }}>
                                                    Duplicate
                                                </button>
                                                {(model.ownerId === user.uid || project.ownerId === user.uid) && (
                                                    <>
                                                        <button onClick={(e) => {
                                                            e.stopPropagation();
                                                            onRenameModel(model);
                                                        }}>
                                                            Rename
                                                        </button>
                                                        <button className="button-danger"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openConfirmModal(
                                                                    `Are you sure you want to delete model '${model.name}'?`,
                                                                    () => onDeleteModel(model.id)
                                                                    )
                                                                }}>Delete
                                                        </button>
                                                    </>)}
                                            </div>
                                        </div>
                                    </div>
                                })}
                                </div>
                                    <div className="projects-overview-members">
                                <div className="projects-members-title">
                                    <h4>Members</h4>
                                    <button onClick={() => {
                                        setIsInviteModalOpen(true);
                                        setSelectedProjectId(project.id);
                                    }}>Invite Member
                                    </button>
                                </div>
                                {project.members.map((member) => (
                                    <div key={project.id + member.id} className="projects-members" title={`${member.displayName} (${member.role}) ${member.email}`}>
                                        <div className="projects-members-avatar"><img src={member.imageUrl} alt="user-avatar"/>
                                        </div>
                                        <div className="projects-members-name">{member.displayName}</div>
                                        <div className="projects-members-role">{member.role}</div>
                                        {project.ownerId === user.uid && member.id !== user.uid && (
                                            <button className="projects-members-remove button-danger"
                                                    onClick={() => openConfirmModal(
                                                        `Are you sure you want to remove ${member.displayName} from this project?`,
                                                        () => handleRemoveMember(project.id, member.id)
                                                    )}>Remove Member</button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>}

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                message={confirmModalContent.message}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmModalContent.onConfirm}
            />

            <AddProjectModal
                isOpen={isAddProjectModalOpen}
                onClose={() => setIsAddProjectModalOpen(false)}
                onAddProject={handleAddProject}
            />

            <RenameProjectModal
                isOpen={isRenameProjectModalOpen}
                onClose={() => setIsRenameProjectModalOpen(false)}
                onRenameProject={handleRenameProject}
                currentName={currentProject.name}
            />

            <AddBPMNModelModal
                isOpen={isAddModelModalOpen}
                onClose={() => setIsAddModelModalOpen(false)}
                onAddModel={handleAddBPMNModel}
                projectId={selectedProjectId}
            />

            <AddBPMNModelModal
                isOpen={isAddDMNModalOpen}
                onClose={() => setIsAddDMNModalOpen(false)}
                onAddModel={handleAddDMNModel}
                projectId={selectedProjectId}
            />

            <RenameModelModal
                isOpen={isRenameModelModalOpen}
                onClose={() => setIsRenameModelModalOpen(false)}
                onRenameModel={handleRenameModel}
                currentName={selectedModel.name}
            />

            <InviteModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                projectId={selectedProjectId}
                userId={user.uid}
            />
        </div>
    )
        ;
};

export default ProjectList;
