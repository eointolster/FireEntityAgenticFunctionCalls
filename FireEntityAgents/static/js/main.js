// main.js
/**
 * main.js
 * 
 * This file serves as the main entry point for the Fire Entity Project.
 * It handles the initialization and management of the 3D scene, camera, and renderer,
 * as well as the creation and animation of fire entities.
 * 
 * Key responsibilities:
 * 1. Setting up and managing the THREE.js scene, camera, and renderer.
 * 2. Handling window resize events to maintain proper display.
 * 3. Managing the creation and storage of fire entities.
 * 4. Coordinating the animation loop for all entities.
 * 5. Handling user interactions (e.g., button clicks to create new entities).
 * 
 * The script maintains a list of all fire entities and designates the first created entity
 * as the main entity, which will serve as the manager for future inter-entity communications.
 * 
 * Future development areas:
 * - Implementation of more complex user interactions (e.g., clicking on entities, dragging)
 * - Integration with voice commands or text input for entity control
 * - Enhanced visual effects and scene complexity
 * - Implementation of a more sophisticated entity management system
 * - Integration with backend services for extended functionality
 * 
 * This script works in conjunction with FireEntity.js to create a dynamic and
 * interactive 3D environment for the fire entities.
 * 
 * @requires THREE.js
 * @requires FireEntity.js
 */

let scene, camera, renderer;
let fireEntities = [];
let mainFireEntity;
let draggedEntity = null;
let dragOffset = new THREE.Vector3();
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let activeMenu = null;
let lastClickTime = 0;
let backgroundMesh;

function initBackground() {
    const geometry = new THREE.PlaneGeometry(1600, 1600, 200, 200);  // Make it larger
    const material = new THREE.MeshBasicMaterial({
        color: 0x3498db,
        wireframe: true,
        transparent: true,
        opacity: 0.5  // Increase opacity
    });

    backgroundMesh = new THREE.Mesh(geometry, material);
    backgroundMesh.rotation.x = -Math.PI / 3;
    backgroundMesh.position.z = -100;  // Move it further back
    scene.add(backgroundMesh);
}

function animateBackground(time) {
    if (backgroundMesh) {
        const positions = backgroundMesh.geometry.attributes.position.array;

        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            const z = 5 * Math.sin(x / 10 + time / 1000) * Math.cos(y / 10 + time / 1000);
            positions[i + 2] = z;
        }

        backgroundMesh.geometry.attributes.position.needsUpdate = true;
        //backgroundMesh.rotation.y = time * 0.00005;
    }
}



function init() {
    scene = new THREE.Scene();
    
    const canvasContainer = document.getElementById('canvas-container');
    const aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
    camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    canvasContainer.appendChild(renderer.domElement);

    camera.position.z = 15; // Moved the camera closer

    // Initialize the speech handler
    speechHandler = new SpeechHandler();

    // Create main entity
    mainFireEntity = createFireEntity(0, 0);

    initBackground(); 

    animate();
}

function animate(time) {
    requestAnimationFrame(animate);
    
    // Animate all fire entities
    fireEntities.forEach(entity => entity.animate(time / 1000));
    animateBackground(time);

    renderer.render(scene, camera);
}

// Update the speech handler to process commands
speechHandler.processCommand = async (command) => {
    if (mainFireEntity) {
        await mainFireEntity.handleCommand(command);
    } else {
        console.error('Main fire entity not initialized');
    }
};

function createFireEntity(x, y, isChild = false)  {
    const fireEntity = new FireEntity(scene, x, y, isChild);
    fireEntities.push(fireEntity);

    if (isChild && mainFireEntity) {
        mainFireEntity.addChild(fireEntity);
    }

    return fireEntity;
}

function createChildEntity() {
    if (mainFireEntity) {
        const childEntity = mainFireEntity.split();
        childEntity.loadAvailableFunctions().then(() => {
            fireEntities.push(childEntity);
            console.log('Child entity created:', childEntity);
            openFunctionSelectionMenu(childEntity);
        });
    } else {
        console.error('Main entity not initialized');
    }
}

function openFunctionSelectionMenu(childEntity) {
    if (activeMenu) {
        document.body.removeChild(activeMenu);
    }

    const menu = createChildEntityMenu(childEntity);
    const canvasContainer = document.getElementById('canvas-container');
    const rect = canvasContainer.getBoundingClientRect();
    const screenPosition = new THREE.Vector3(childEntity.position.x, childEntity.position.y, childEntity.position.z);
    screenPosition.project(camera);

    menu.style.left = (rect.left + (screenPosition.x + 1) * rect.width / 2) + 'px';
    menu.style.top = (rect.top + (-screenPosition.y + 1) * rect.height / 2) + 'px';

    document.body.appendChild(menu);
    activeMenu = menu;
}

function onEntityClick(entity, event) {
    const currentTime = new Date().getTime();
    const timeSinceLastClick = currentTime - lastClickTime;
    lastClickTime = currentTime;

    if (timeSinceLastClick > 300) {
        // Single click, do nothing
        return;
    }

    // Double click detected
    if (activeMenu) {
        document.body.removeChild(activeMenu);
    }

    let menu;
    if (entity === mainFireEntity) {
        menu = createMainEntityMenu(entity);
    } else {
        menu = createChildEntityMenu(entity);
    }

    const canvasContainer = document.getElementById('canvas-container');
    const rect = canvasContainer.getBoundingClientRect();
    const screenPosition = new THREE.Vector3(entity.position.x, entity.position.y, entity.position.z);
    screenPosition.project(camera);

    menu.style.left = (rect.left + (screenPosition.x + 1) * rect.width / 2) + 'px';
    menu.style.top = (rect.top + (-screenPosition.y + 1) * rect.height / 2) + 'px';

    document.body.appendChild(menu);
    activeMenu = menu;

    event.stopPropagation();
}

function onCanvasClick(event) {
    updateMousePosition(event);
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        const clickedEntity = fireEntities.find(entity => 
            entity.visuals.particleSystem === clickedObject
        );
        if (clickedEntity) {
            onEntityClick(clickedEntity, event);
        }
    } else {
        closeActiveMenu();
    }
}

function closeActiveMenu() {
    if (activeMenu) {
        document.body.removeChild(activeMenu);
        activeMenu = null;
    }
}

function onMouseDown(event) {
    event.preventDefault();
    updateMousePosition(event);
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        draggedEntity = fireEntities.find(entity => 
            entity.visuals.particleSystem === clickedObject
        );
        
        if (draggedEntity) {
            const intersectionPoint = intersects[0].point;
            dragOffset.subVectors(draggedEntity.position, intersectionPoint);
        }
    }
}

function onMouseMove(event) {
    event.preventDefault();
    updateMousePosition(event);
    
    if (draggedEntity) {
        raycaster.setFromCamera(mouse, camera);
        const planeNormal = new THREE.Vector3(0, 0, 1);
        const plane = new THREE.Plane(planeNormal, 0);
        const intersectionPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, intersectionPoint);
        
        draggedEntity.updatePosition(intersectionPoint.add(dragOffset));
    }
}

function onMouseUp(event) {
    event.preventDefault();
    draggedEntity = null;
}


function updateMousePosition(event) {
    const canvasContainer = document.getElementById('canvas-container');
    const rect = canvasContainer.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}


async function handleFunctionExecution(entity, functionName, args) {
    try {
        const result = await entity.executeFunction(functionName, args);
        console.log(`Function ${functionName} executed with result:`, result);
        return result;
    } catch (error) {
        console.error(`Error executing function ${functionName}:`, error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    init();

    const createChildEntityButton = document.getElementById('create-child-entity');
    if (createChildEntityButton) {
        createChildEntityButton.addEventListener('click', createChildEntity);
    }

    const canvasContainer = document.getElementById('canvas-container');
    if (canvasContainer) {
        canvasContainer.addEventListener('mousedown', onMouseDown);
        canvasContainer.addEventListener('mousemove', onMouseMove);
        canvasContainer.addEventListener('mouseup', onMouseUp);
        canvasContainer.addEventListener('click', onCanvasClick);
    }
    const talkButton = document.getElementById('talk-button');
    if (talkButton) {
        talkButton.addEventListener('click', () => mainFireEntity.talk());
    }

    // Remove the talk-button event listener if it's not needed anymore
});

window.addEventListener('resize', () => {
    const canvasContainer = document.getElementById('canvas-container');
    camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
});