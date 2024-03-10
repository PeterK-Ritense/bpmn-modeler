import React, { useEffect, useRef } from 'react';
import DmnModeler from 'dmn-js/lib/Modeler';
import 'dmn-js/dist/assets/diagram-js.css';
import 'dmn-js/dist/assets/dmn-js-decision-table.css';
import 'dmn-js/dist/assets/dmn-js-decision-table-controls.css';
import 'dmn-js/dist/assets/dmn-js-drd.css';
import 'dmn-js/dist/assets/dmn-js-literal-expression.css';
import 'dmn-js/dist/assets/dmn-js-shared.css';
import 'dmn-js/dist/assets/dmn-font/css/dmn.css';
import 'dmn-js/dist/assets/dmn-font/css/dmn-embedded.css';
import 'dmn-js/dist/assets/dmn-font/css/dmn-codes.css';

const DMNModelerComponent = ({ xml, viewPosition, onDMNChange, onViewPositionChange }) => {
    const dmnModelerRef = useRef(null);

    useEffect(() => {
        const dmnModeler = new DmnModeler({
            container: dmnModelerRef.current,
            keyboard: {
                bindTo: window,
            },
        });
        console.log('modeler: ', dmnModeler);
        console.log('xml: ', xml);
        dmnModeler.importXML(xml).then(() => {
            if (viewPosition) {
                setViewPosition(dmnModeler);
            }
        });

        // dmnModeler.on('canvas.viewbox.changed', () => {
        //     const viewbox = getViewPosition(dmnModeler);
        //     if (viewPosition !== viewbox) {
        //         onViewPositionChange(viewbox);
        //     }
        // });

        dmnModeler.on('views.changed', async (event) => {
            // This event is emitted when switching between views, such as from DRD to a decision table and vice versa.
            const { activeView } = event;

            if (activeView.type === 'drd') {
                console.log('Switched to DRD view');
                // You can add more DRD-specific listeners here
            } else if (activeView.type === 'decisionTable') {
                console.log('Switched to Decision Table view');
                // Add decision table-specific listeners or actions here
            }
        });

        dmnModeler.on('commandStack.changed', async () => {
            console.log('change!')
            try {
                const { xml } = await dmnModeler.saveXML({ format: true });
                onDMNChange(xml);
            } catch (err) {
                console.error('Error saving XML', err);
            }
        });

        return () => {
            dmnModeler.destroy();
        };
    }, [xml, viewPosition, onDMNChange, onViewPositionChange]); // Added dependencies to useEffect for proper updates

    function getViewPosition(modeler) {
        // DMN might not support the same viewbox properties as BPMN
        // This function may need adjustment based on how DMN modeler exposes the view position and zoom
        const canvas = modeler.getActiveViewer().get('canvas');
        const zoom = canvas.zoom();
        const scroll = canvas.viewbox();

        return {
            zoom,
            scroll
        };
    }

    function setViewPosition(modeler) {
        // This function similarly might need adjustments
        const canvas = modeler.getActiveViewer().get('canvas');
        canvas.zoom(viewPosition.zoom);
        canvas.viewbox({
            x: viewPosition.scroll.x,
            y: viewPosition.scroll.y,
            width: viewPosition.scroll.width,
            height: viewPosition.scroll.height
        });
    }

    return <div ref={dmnModelerRef} className="dmn-modeler" />;
};

export default DMNModelerComponent;
