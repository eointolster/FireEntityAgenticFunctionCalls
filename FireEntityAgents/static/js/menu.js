// menu.js

function createMainEntityMenu(entity) {
    const menu = document.createElement('div');
    menu.className = 'entity-menu main-entity-menu';
    menu.style.position = 'absolute';
    menu.style.backgroundColor = 'rgba(40, 44, 52, 0.9)';
    menu.style.color = 'white';
    menu.style.padding = '20px';
    menu.style.borderRadius = '10px';
    menu.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    menu.style.width = '300px';

    const title = document.createElement('h2');
    title.textContent = 'Fire Entity Menu';
    title.style.marginTop = '0';
    title.style.marginBottom = '20px';
    title.style.textAlign = 'center';
    menu.appendChild(title);

    const createChildButton = document.createElement('button');
    createChildButton.innerHTML = '<i class="fas fa-plus"></i> Create Child Entity';
    createChildButton.className = 'menu-button';
    createChildButton.onclick = () => {
        const childEntity = entity.split();
        fireEntities.push(childEntity);
        updateMainEntityMenu(entity, menu);
    };
    menu.appendChild(createChildButton);

    const inputArea = document.createElement('div');
    inputArea.style.marginTop = '20px';

    const textInput = document.createElement('textarea');
    textInput.placeholder = 'Enter your message here...';
    textInput.style.width = '100%';
    textInput.style.padding = '10px';
    textInput.style.borderRadius = '5px';
    textInput.style.border = 'none';
    textInput.style.marginBottom = '10px';
    textInput.style.resize = 'vertical';

    const submitButton = document.createElement('button');
    submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Text';
    submitButton.className = 'menu-button';
    submitButton.onclick = () => {
        const text = textInput.value.trim();
        if (text) {
            entity.processInput(text);
            textInput.value = '';
        }
    };

    inputArea.appendChild(textInput);
    inputArea.appendChild(submitButton);

    const talkButton = document.createElement('button');
    talkButton.innerHTML = '<i class="fas fa-microphone"></i> Talk';
    talkButton.className = 'menu-button';
    talkButton.onclick = () => entity.talk();
    
    const statusMessage = document.createElement('div');
    statusMessage.id = 'talk-status';
    statusMessage.style.marginTop = '10px';
    statusMessage.style.textAlign = 'center';

    menu.appendChild(inputArea);
    menu.appendChild(talkButton);
    menu.appendChild(statusMessage);

    const childList = document.createElement('ul');
    childList.id = 'child-list';
    childList.style.listStyle = 'none';
    childList.style.padding = '0';
    childList.style.marginTop = '20px';
    menu.appendChild(childList);

    updateMainEntityMenu(entity, menu);

    return menu;
}

function updateMainEntityMenu(entity, menu) {
    const childList = menu.querySelector('#child-list');
    childList.innerHTML = '';
    entity.children.forEach((child, index) => {
        const listItem = document.createElement('li');
        const childName = child.name || `Child ${index + 1}`;
        const childFunctions = child.assignedFunctions.join(', ');
        listItem.textContent = `${childName}: ${childFunctions}`;
        childList.appendChild(listItem);
    });
}

// function createChildEntityMenu(entity) {
//     const menu = document.createElement('div');
//     menu.className = 'entity-menu child-entity-menu';
//     menu.style.position = 'absolute';
//     menu.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
//     menu.style.color = 'white';
//     menu.style.padding = '10px';
//     menu.style.borderRadius = '5px';

//     const nameInput = document.createElement('input');
//     nameInput.type = 'text';
//     nameInput.placeholder = 'Entity Name';
//     nameInput.value = entity.name || '';
//     nameInput.onchange = (e) => { 
//         entity.name = e.target.value; 
//         if (mainFireEntity) {
//             const mainMenu = document.querySelector('.main-entity-menu');
//             if (mainMenu) {
//                 updateMainEntityMenu(mainFireEntity, mainMenu);
//             }
//         }
//     };
//     menu.appendChild(nameInput);

//     const descriptionInput = document.createElement('textarea');
//     descriptionInput.placeholder = 'Entity Description';
//     descriptionInput.value = entity.description || '';
//     descriptionInput.onchange = (e) => { entity.description = e.target.value; };
//     descriptionInput.style.width = '100%';
//     descriptionInput.style.marginTop = '5px';
//     menu.appendChild(descriptionInput);

//     const functionsHeader = document.createElement('h3');
//     functionsHeader.textContent = 'Available Functions';
//     menu.appendChild(functionsHeader);

//     const functionList = document.createElement('ul');
//     functionList.style.listStyleType = 'none';
//     functionList.style.padding = '0';

//     function populateFunctionList() {
//         functionList.innerHTML = ''; // Clear existing items
//         if (entity.availableFunctions && entity.availableFunctions.length > 0) {
//             entity.availableFunctions.forEach(func => {
//                 const listItem = document.createElement('li');
//                 const checkbox = document.createElement('input');
//                 checkbox.type = 'checkbox';
//                 checkbox.id = func;
//                 checkbox.checked = entity.assignedFunctions.includes(func);
//                 checkbox.onchange = (e) => {
//                     if (e.target.checked) {
//                         entity.assignFunction(func);
//                     } else {
//                         entity.removeFunction(func);
//                     }
//                     console.log(`Updated functions for ${entity.name}:`, entity.assignedFunctions);
//                 };
//                 const label = document.createElement('label');
//                 label.htmlFor = func;
//                 label.textContent = func;
//                 listItem.appendChild(checkbox);
//                 listItem.appendChild(label);
//                 functionList.appendChild(listItem);
//             });
//         } else {
//             const loadingItem = document.createElement('li');
//             loadingItem.textContent = 'Loading available functions...';
//             functionList.appendChild(loadingItem);
//         }
//     }

//     populateFunctionList();

//     if (!entity.availableFunctions || entity.availableFunctions.length === 0) {
//         entity.loadAvailableFunctions().then(() => {
//             populateFunctionList();
//         });
//     }

//     menu.appendChild(functionList);

//     return menu;
// }

function createChildEntityMenu(entity) {
    const menu = document.createElement('div');
    menu.className = 'entity-menu child-entity-menu';
    menu.style.position = 'absolute';
    menu.style.backgroundColor = 'rgba(40, 44, 52, 0.95)';
    menu.style.color = 'white';
    menu.style.padding = '20px';
    menu.style.borderRadius = '10px';
    menu.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    menu.style.width = '350px';
    menu.style.maxHeight = '80vh';
    menu.style.overflowY = 'auto';

    const title = document.createElement('h2');
    title.textContent = 'Child Entity Configuration';
    title.style.marginTop = '0';
    title.style.marginBottom = '20px';
    title.style.textAlign = 'center';
    menu.appendChild(title);

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Entity Name';
    nameInput.value = entity.name || '';
    nameInput.style.width = '100%';
    nameInput.style.padding = '10px';
    nameInput.style.marginBottom = '10px';
    nameInput.style.borderRadius = '5px';
    nameInput.style.border = 'none';
    nameInput.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    nameInput.style.color = 'white';
    nameInput.onchange = (e) => { 
        entity.name = e.target.value; 
        if (mainFireEntity) {
            const mainMenu = document.querySelector('.main-entity-menu');
            if (mainMenu) {
                updateMainEntityMenu(mainFireEntity, mainMenu);
            }
        }
    };
    menu.appendChild(nameInput);

    const descriptionInput = document.createElement('textarea');
    descriptionInput.placeholder = 'Entity Description';
    descriptionInput.value = entity.description || '';
    descriptionInput.style.width = '100%';
    descriptionInput.style.padding = '10px';
    descriptionInput.style.marginBottom = '20px';
    descriptionInput.style.borderRadius = '5px';
    descriptionInput.style.border = 'none';
    descriptionInput.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    descriptionInput.style.color = 'white';
    descriptionInput.style.resize = 'vertical';
    descriptionInput.style.minHeight = '100px';
    descriptionInput.onchange = (e) => { entity.description = e.target.value; };
    menu.appendChild(descriptionInput);

    const functionsHeader = document.createElement('h3');
    functionsHeader.textContent = 'Available Functions';
    functionsHeader.style.marginBottom = '10px';
    menu.appendChild(functionsHeader);

    const functionList = document.createElement('div');
    functionList.style.marginBottom = '20px';

    function populateFunctionList() {
        functionList.innerHTML = ''; // Clear existing items
        if (entity.availableFunctions && entity.availableFunctions.length > 0) {
            entity.availableFunctions.forEach(func => {
                const functionItem = document.createElement('div');
                functionItem.style.marginBottom = '10px';
                functionItem.style.display = 'flex';
                functionItem.style.alignItems = 'center';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = func;
                checkbox.checked = entity.assignedFunctions.includes(func);
                checkbox.style.marginRight = '10px';
                checkbox.onchange = (e) => {
                    if (e.target.checked) {
                        entity.assignFunction(func);
                    } else {
                        entity.removeFunction(func);
                    }
                    console.log(`Updated functions for ${entity.name}:`, entity.assignedFunctions);
                };

                const label = document.createElement('label');
                label.htmlFor = func;
                label.textContent = func;
                label.style.flex = '1';

                functionItem.appendChild(checkbox);
                functionItem.appendChild(label);
                functionList.appendChild(functionItem);
            });
        } else {
            const loadingItem = document.createElement('div');
            loadingItem.textContent = 'Loading available functions...';
            loadingItem.style.fontStyle = 'italic';
            functionList.appendChild(loadingItem);
        }
    }

    populateFunctionList();

    if (!entity.availableFunctions || entity.availableFunctions.length === 0) {
        entity.loadAvailableFunctions().then(() => {
            populateFunctionList();
        });
    }

    menu.appendChild(functionList);

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.width = '100%';
    closeButton.style.padding = '10px';
    closeButton.style.backgroundColor = '#4CAF50';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '5px';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = () => {
        document.body.removeChild(menu);
    };
    menu.appendChild(closeButton);

    return menu;
}