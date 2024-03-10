import './App.css'
import BPMNModelerComponent from "./components/BpmnModeler.tsx";
import {auth, signInWithGoogle, logout, saveBPMNModel, saveDMNodel} from './config/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from "react";
import ProjectList from "./components/ProjectList.tsx";
import SaveModal from "./components/SaveModal.tsx";
import LogoutModal from "./components/LogoutModal.tsx";
import DMNModelerComponent from "./components/DmnModeler.tsx";

function App() {
    const [user, setUser] = useState(null);
    const [model, setModel] = useState({});
    const [project, setProject] = useState({});
    const [viewMode, setViewMode] = useState('ALL_PROJECTS');
    const [changes, setChanges] = useState(false);
    const [viewPosition, setViewPosition] = useState(null);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is signed in, see docs for a list of available properties
                // https://firebase.google.com/docs/reference/js/firebase.User
                setUser(user);
            } else {
                // User is signed out
                setUser(null);
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const onSaveModelClick = (model) => {
        saveBPMNModel(model);
        setChanges(false);
    };

    const onSaveDMNClick = (model) => {
        saveDMNodel(model);
        setChanges(false);
    };

    const handleOpenProject = (project) => {
        setProject(project);
        setViewMode('PROJECT');
    };

    const handleOpenModel = (project, model) => {
        setProject(project);
        setModel(model);
        setViewMode(model.type === 'bpmn' ? 'BPMN' : 'DMN');
    };

    const handleModelChange = (newXml) => {
        setChanges(true);
        setModel({
            ...model,
            xmlData: newXml
        });
    };

    const handleViewPositionChange = (viewbox) => {
        setViewPosition(viewbox);
    }

    const onProjectsFolderClick = () => {
        if (!changes) {
            setProject({});
            setModel({});
            setViewMode('ALL_PROJECTS');
            setViewPosition(null);
            setChanges(false);
        } else {
         setIsSaveModalOpen(true);
        }
    }

    const onProjectNameClick = () => {
        if (!changes) {
            // setProject({});
            setModel({});
            setViewMode('PROJECT');
            setViewPosition(null);
            setChanges(false);
        } else {
         setIsSaveModalOpen(true);
        }
    }

    const handleOnSave = (model) => {
        saveBPMNModel(model);
        setModel({});
        setViewMode('PROJECT');
        setViewPosition(null);
        setChanges(false);
        setIsSaveModalOpen(false);
    }

    const handleOnDiscard = () => {
        setModel({});
        setViewMode('PROJECT');
        setViewPosition(null);
        setChanges(false);
        setIsSaveModalOpen(false);
    }

    const onLogoutClick = () => {
        setIsLogoutModalOpen(true);
    }

    const handleOnSaveLogout = (model) => {
        saveBPMNModel(model);
        setModel({});
        setViewMode('PROJECT');
        logout();
        setIsLogoutModalOpen(false);
    }

    const handleOnDiscardLogout = () => {
        setModel({});
        setViewMode('PROJECT');
        logout();
        setIsLogoutModalOpen(false);
    }

    const handleCloseLogout = () => {
        setIsLogoutModalOpen(false);
    }

    return (
      <div className="App">
          {model && <SaveModal
              isOpen={isSaveModalOpen}
              onSave={() => handleOnSave(model)}
              onDiscard={handleOnDiscard}
          />}
          {model && <LogoutModal
              isOpen={isLogoutModalOpen}
              onSaveAndLogout={() => handleOnSaveLogout(model)}
              onLogout={handleOnDiscardLogout}
              onClose={handleCloseLogout}
              changes={changes}
          />}
          <div className="header">
              <div className="header-logo">
                  BPMN Modeler
              </div>
              <div className="header-nav">
                  <div className="nav-projects-folder" onClick={onProjectsFolderClick}>
                      My Projects
                  </div>
                  {project.name && <div>
                      &#8594;
                  </div>}
                  {project.name && <div className="nav-project" onClick={onProjectNameClick}>
                      {project.name}
                  </div>}
                  {model.name && <div>
                      &#8594;
                  </div>}
                  {model.name && <div className="nav-model">
                      {model.name}
                  </div>}
              </div>
              <div className="header-user">
                  {!user &&
                      <button onClick={signInWithGoogle}>Sign in with Google</button>
                  }
                  {user &&
                      <div className="header-user-signed-in">
                          Welcome, {user.displayName} <button className="button-danger" onClick={onLogoutClick}>Logout</button>
                      </div>
                  }
              </div>
          </div>
          {viewMode === 'BPMN' && changes &&
              <button onClick={() => onSaveModelClick(model)} className="save-button">
                  Save Model
              </button>}
          {viewMode === 'DMN' &&
              <button onClick={() => onSaveDMNClick(model)} className="save-button">
                  Save Model
              </button>}
          {viewMode === 'BPMN' && user && <BPMNModelerComponent xml={model.xmlData} viewPosition={viewPosition} onModelChange={handleModelChange} onViewPositionChange={handleViewPositionChange}/>}
          {viewMode === 'DMN' && user && <DMNModelerComponent xml={model.xmlData} viewPosition={viewPosition} onDMNChange={handleModelChange} onViewPositionChange={handleViewPositionChange}/>}
          {(viewMode !== 'BPMN' && viewMode !== 'DMN') && user && <ProjectList user={user} viewMode={viewMode} currentProject={project} onOpenProject={handleOpenProject} onOpenModel={handleOpenModel}/>}
          {!user && <div className="welcome-wrapper">
              <div className="welcome-title">
                  Welcome to the BPMN Modeler!
              </div>
              <div className="welcome-subtitle">
                  Sign in to start modeling
              </div>
          </div>}
          {(viewMode !== 'BPMN' && viewMode !== 'DMN') && <div className="footer">
              By <a href="https://www.peterkoenen.nl" target="peterkoenen.nl">Peter Koenen</a>
          </div>}
      </div>
    )
}

export default App
