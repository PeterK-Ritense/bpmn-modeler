import './App.css'
import BPMNModelerComponent from "./components/BpmnModeler.tsx";
import { auth, signInWithGoogle, logout, saveBPMNModel } from './config/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from "react";
import ProjectList from "./components/ProjectList.tsx";
import SaveModal from "./components/SaveModal.tsx";
import LogoutModal from "./components/LogoutModal.tsx";

function App() {
    const [user, setUser] = useState(null);
    const [model, setModel] = useState({});
    const [project, setProject] = useState({});
    const [modelView, setModelView] = useState(false);
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

    const handleOpenModel = (project, model) => {
        setProject(project);
        setModel(model);
        setModelView(true);
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
            setModelView(false);
            setViewPosition(null);
            setChanges(false);
        } else {
         setIsSaveModalOpen(true);
        }
    }

    const handleOnSave = (model) => {
        saveBPMNModel(model);
        setProject({});
        setModel({});
        setModelView(false);
        setViewPosition(null);
        setChanges(false);
        setIsSaveModalOpen(false);
    }

    const handleOnDiscard = () => {
        setProject({});
        setModel({});
        setModelView(false);
        setViewPosition(null);
        setChanges(false);
        setIsSaveModalOpen(false);
    }

    const onLogoutClick = () => {
        setIsLogoutModalOpen(true);
    }

    const handleOnSaveLogout = (model) => {
        saveBPMNModel(model);
        setProject({});
        setModel({});
        setModelView(false);
        logout();
        setIsLogoutModalOpen(false);
    }

    const handleOnDiscardLogout = () => {
        setProject({});
        setModel({});
        setModelView(false);
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
              {project.id && <div className="header-nav">
                  <div className="nav-projects-folder" onClick={onProjectsFolderClick}>
                      My Projects
                  </div>
                  {project.name && <div>
                      &#8594;
                  </div>}
                  {project.name && <div className="nav-project">
                      {project.name}
                  </div>}
                  {model.name && <div>
                      &#8594;
                  </div>}
                  {model.name && <div className="nav-model">
                      {model.name}
                  </div>}
              </div>}
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
          {modelView && changes &&
              <button onClick={() => onSaveModelClick(model)} className="save-button">
                  Save Model
              </button>}
          {modelView && user && <BPMNModelerComponent xml={model.xmlData} viewPosition={viewPosition} onModelChange={handleModelChange} onViewPositionChange={handleViewPositionChange}/>}
          {!modelView && user && <ProjectList userId={user.uid} userEmail={user.email} onOpenModel={handleOpenModel}/>}
          {!user && <div className="welcome-wrapper">
              <div className="welcome-title">
                  Welcome to the BPMN Modeler!
              </div>
              <div className="welcome-subtitle">
                  Sign in to start modeling
              </div>
          </div>}
          {!modelView && <div className="footer">
              By <a href="https://www.peterkoenen.nl" target="peterkoenen.nl">Peter Koenen</a>
          </div>}
      </div>
    )
}

export default App
