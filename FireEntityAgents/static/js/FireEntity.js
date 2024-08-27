// FireEntity.js
/**
 * FireEntity.js
 * 
 * This file defines the FireEntity class, which represents a fire entity in a 3D scene.
 * 
 * Key features and responsibilities:
 * 1. Creation and management of the 3D mesh representing the fire entity.
 * 2. Handling of entity animation, including pulsing effect.
 * 3. Management of child entities, supporting a hierarchical structure.
 * 4. Foundation for inter-entity communication and message passing.
 * 
 * Future development areas:
 * - Enhanced visual effects (particle systems, dynamic textures)
 * - Advanced animation patterns
 * - Improved child entity management and communication
 * - Integration with AI for autonomous behavior
 * - Implementation of specific functionalities (e.g., weather information, task execution)
 * 
 * This class serves as the core building block for the fire entity system,
 * allowing for scalable and modular development of entity behaviors and interactions.
 * 
 * @requires THREE.js
 */
class FireEntity {
    constructor(scene, x, y, isChild = false) {
        this.scene = scene;
        this.position = new THREE.Vector3(x, y, 0);
        this.children = [];
        this.isChild = isChild;
        this.visuals = new FireEntityVisuals(scene, this.position, isChild);
        this.name = '';
        this.description = '';
        this.isMainEntity = !isChild;
        this.availableFunctions = [];
        this.assignedFunctions = [];
        this.speechRecognition = null;
        this.commandHistory = [];
        this.handleSpeechCommand = this.handleSpeechCommand.bind(this);
        if (this.isMainEntity) {
           //this.loadChildEntitiesInfo();
           this.initMainEntityControls();
        } else {
            this.loadAvailableFunctions();
        }
    }

    handleSpeechCommand(command) {
        console.log(`Fire entity received command: ${command}`);
        // Process the command here
        // For example:
        if (command.toLowerCase().includes('hello')) {
            this.speak("Hello! I am the fire entity. How can I help you?");
        }
        // Add more command interpretations as needed
    }

    async handleCommand(command) {
        const relevantChildren = this.findRelevantChildren(command);
        if (relevantChildren.length > 0) {
            for (const child of relevantChildren) {
                await this.moveTo(child.position);
                const result = await this.communicateWithChild(child, command);
                //this.displayResult(result);
                this.displayResult(data.response, data.execution_details);
            }
            await this.moveTo(this.position); // Move back to original position
        } else {
            console.log('No relevant child entities found for the command');
            this.displayResult("I couldn't find a child entity to handle this command.");
        }
    }

    animate(time) {
        this.visuals.animate(time);
        this.children.forEach(child => child.animate(time));
    }

    addChild(child) {
        this.children.push(child);
    }

    removeChild(child) {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            this.children.splice(index, 1);
        }
    }

    updatePosition(newPosition) {
        this.position.copy(newPosition);
        this.visuals.updatePosition(newPosition);
    }

    split() {
        const offsetX = 0.5;
        const offsetY = -0.5;
        const childX = this.position.x + offsetX;
        const childY = this.position.y + offsetY;
        const childEntity = new FireEntity(this.scene, childX, childY, true);
        this.addChild(childEntity);
        return childEntity;
    }

    createChildEntity() {
        if (this.isMainEntity) {
            const childEntity = this.split();
            childEntity.name = "New Child Entity";
            console.log(`Created child entity: ${childEntity.name}`);
            console.log('Current children:', this.children.map(child => ({name: child.name, functions: child.assignedFunctions})));
            return childEntity;
        } else {
            console.error('Only the main entity can create child entities');
        }
    }

    // For main entity
    async loadChildEntitiesInfo() {
        try {
            const response = await fetch('/get_child_entities_info');
            const childInfo = await response.json();
            this.childEntitiesInfo = childInfo;
        } catch (error) {
            console.error('Error loading child entities info:', error);
        }
    }

    // For child entities
    async loadAvailableFunctions() {
        try {
            const response = await fetch('/get_available_functions');
            this.availableFunctions = await response.json();
        } catch (error) {
            console.error('Error loading available functions:', error);
            this.availableFunctions = [];
        }
    }

    assignFunction(functionName) {
        if (this.availableFunctions.includes(functionName) && !this.assignedFunctions.includes(functionName)) {
            this.assignedFunctions.push(functionName);
            console.log(`Assigned function ${functionName} to entity ${this.name}`);
            return true;
        }
        return false;
    }

    removeFunction(functionName) {
        const index = this.assignedFunctions.indexOf(functionName);
        if (index !== -1) {
            this.assignedFunctions.splice(index, 1);
            return true;
        }
        return false;
    }

    initMainEntityControls() {
        // This method will be called to set up the "Talk" button in the main entity's menu
        console.log("Initializing main entity controls");
    }

    async processInput(input) {
        console.log(`Processing input: ${input}`);
        if (this.isMainEntity) {
            try {
                const childEntities = this.children.map(child => ({
                    name: child.name,
                    functions: child.assignedFunctions
                }));
                console.log('Child entities:', childEntities);
                const response = await fetch('/process_command', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        command: input,
                        child_entities: childEntities
                    }),
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log('Response from backend:', data);
                if (data.execution_details && data.execution_details.length > 0) {
                    console.log('Execution details:', data.execution_details);
                    data.execution_details.forEach(detail => {
                        console.log(`Entity ${detail.entity} executed function ${detail.function} with args: ${JSON.stringify(detail.args)} and result: ${detail.result}`);
                    });
                } else {
                    console.log('No execution details received from backend');
                }
                this.displayResult(data.response, data.execution_details);
            } catch (error) {
                console.error('Error processing input:', error);
                this.displayResult("An error occurred while processing your request.");
            }
        } else {
            // Child entity processing
            console.log(`Child entity ${this.name} processing input: ${input}`);
            const functionMatch = this.assignedFunctions.find(func => 
                input.toLowerCase().includes(func.toLowerCase())
            );
            if (functionMatch) {
                console.log(`Child entity ${this.name} executing function: ${functionMatch}`);
                const result = await this.executeFunction(functionMatch, { command: input });
                this.displayResult(result);
            } else {
                console.log(`Child entity ${this.name} couldn't process the input`);
                this.displayResult("I couldn't process this input.");
            }
        }
    }

    async talk() {
        console.log('Listening for speech...');
        // You can add a visual indicator here that the system is listening
        try {
            const userInput = await this.getUserInput();
            await this.processInput(userInput);
        } catch (error) {
            console.error('Error in talk method:', error);
            this.displayResult("An error occurred while processing your speech. Please try again.");
        }
    }

async getUserInput() {
    return new Promise((resolve, reject) => {
        console.log('Initializing speech recognition');
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.continuous = false;

        recognition.onstart = () => {
            console.log('Speech recognition started. Please start speaking.');
            // You can add a visual indicator here that listening has started
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log("Recognized speech:", transcript);
            resolve(transcript);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'no-speech') {
                console.log('No speech was detected. Please try again.');
                // You can add a visual feedback here
            }
            reject(new Error(event.error));
        };

        recognition.onend = () => {
            console.log('Speech recognition ended');
            // You can remove the visual indicator here
        };

        recognition.start();

        // Set a timeout to stop listening if no speech is detected
        setTimeout(() => {
            recognition.stop();
        }, 10000); // Stop after 10 seconds
    });
}

    async processCommand(command) {
    if (this.isMainEntity) {
        console.log(`Main entity processing command: ${command}`);
        const childEntities = this.children.map(child => ({
            name: child.name,
            functions: child.assignedFunctions
        }));
        console.log('Child entities:', JSON.stringify(childEntities, null, 2));
        try {
            const requestBody = {
                command: command,
                chat_history: this.commandHistory,
                child_entities: childEntities
            };
            console.log('Sending request to backend:', JSON.stringify(requestBody, null, 2));
            const response = await fetch('/process_command', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            this.commandHistory.push({ role: "user", content: command });
            this.commandHistory.push({ role: "assistant", content: result.response });
            this.displayResult(result.response);
            console.log('Execution details:', result.execution_details);
            if (result.execution_details && result.execution_details.length > 0) {
                result.execution_details.forEach(detail => {
                    console.log(`Entity ${detail.entity} executed function ${detail.function} with result: ${detail.result}`);
                });
            }
        } catch (error) {
            console.error('Error processing command:', error);
            this.displayResult("An error occurred while processing the command.");
        }
    } else {
        // Child entity processing remains the same
        console.log(`Child entity ${this.name} processing command: ${command}`);
        const functionMatch = this.assignedFunctions.find(func => 
            command.toLowerCase().includes(func.toLowerCase())
        );
        if (functionMatch) {
            console.log(`Child entity ${this.name} executing function: ${functionMatch}`);
            return await this.executeFunction(functionMatch, { command });
        }
        console.log(`Child entity ${this.name} couldn't process the command`);
        return "I couldn't process this command.";
    }
}
    findRelevantChildren(command) {
        return this.children.filter(child => 
            child.assignedFunctions.some(func => command.toLowerCase().includes(func.toLowerCase())) ||
            (child.description && command.toLowerCase().includes(child.description.toLowerCase()))
        );
    }

    async communicateWithChild(child, command) {
        console.log(`Communicating with child ${child.name} about: ${command}`);
        return await child.processCommand(command);
    }

    async executeFunction(functionName, args) {
        try {
            const response = await fetch('/execute_function', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ functionName, args }),
            });
            const result = await response.json();
            return `The result of ${functionName} is ${result.result}`;
        } catch (error) {
            console.error('Error executing function:', error);
            return `Error executing ${functionName}: ${error.message}`;
        }
    }

    async moveTo(position) {
        // Implement a simple animation to move the entity
        const duration = 1000; // 1 second
        const startTime = Date.now();
        const startPosition = this.position.clone();

        return new Promise((resolve) => {
            const animate = () => {
                const now = Date.now();
                const progress = Math.min((now - startTime) / duration, 1);
                this.position.lerpVectors(startPosition, position, progress);
                this.updatePosition(this.position);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            animate();
        });
    }
    
    async handleResult(result) {
        console.log('Command result:', result);
        this.speak(result);
    }

    // displayResult(result, executionDetails) {
    //     const popup = document.createElement('div');
    //     popup.style.position = 'absolute';
    //     popup.style.left = '50%';
    //     popup.style.top = '20%';
    //     popup.style.transform = 'translate(-50%, -50%)';
    //     popup.style.backgroundColor = 'white';
    //     popup.style.padding = '20px';
    //     popup.style.borderRadius = '10px';
    //     popup.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
    //     popup.style.zIndex = '1000';
    //     popup.style.maxWidth = '80%';
    //     popup.style.maxHeight = '80%';
    //     popup.style.overflow = 'auto';
    
    //     const resultText = document.createElement('p');
    //     resultText.textContent = result;
    //     popup.appendChild(resultText);
    
    //     if (executionDetails && executionDetails.length > 0) {
    //         const detailsHeader = document.createElement('h3');
    //         detailsHeader.textContent = 'Execution Details:';
    //         popup.appendChild(detailsHeader);
    
    //         executionDetails.forEach(detail => {
    //             const detailText = document.createElement('p');
    //             detailText.textContent = `Entity ${detail.entity} executed function ${detail.function} with result: ${detail.result}`;
    //             if (detail.args) {
    //                 detailText.textContent += ` (Args: ${JSON.stringify(detail.args)})`;
    //             }
    //             popup.appendChild(detailText);
    //         });
    //     }
    
    //     const closeButton = document.createElement('button');
    //     closeButton.textContent = 'Close';
    //     closeButton.onclick = () => document.body.removeChild(popup);
    //     popup.appendChild(closeButton);
    
    //     document.body.appendChild(popup);
    // }



    displayResult(result, executionDetails) {
        const popup = document.createElement('div');
        popup.style.position = 'fixed';
        popup.style.left = '50%';
        popup.style.top = '20%';
        popup.style.transform = 'translate(-50%, -50%) scale(0.5)';
        popup.style.backgroundColor = 'rgba(40, 44, 52, 0.9)';
        popup.style.color = 'white';
        popup.style.padding = '20px';
        popup.style.borderRadius = '10px';
        popup.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        popup.style.zIndex = '1000';
        popup.style.maxWidth = '80%';
        popup.style.maxHeight = '80%';
        popup.style.overflow = 'auto';
        popup.style.opacity = '0';
        popup.style.transition = 'all 0.3s ease-out';
    
        const resultText = document.createElement('p');
        resultText.textContent = result;
        popup.appendChild(resultText);
    
        if (executionDetails && executionDetails.length > 0) {
            const detailsHeader = document.createElement('h3');
            detailsHeader.textContent = 'Execution Details:';
            popup.appendChild(detailsHeader);
    
            executionDetails.forEach(detail => {
                const detailText = document.createElement('p');
                detailText.textContent = `Entity ${detail.entity} executed function ${detail.function} with result: ${detail.result}`;
                popup.appendChild(detailText);
            });
        }
    
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.marginTop = '10px';
        closeButton.onclick = () => {
            popup.style.opacity = '0';
            popup.style.transform = 'translate(-50%, -50%) scale(0.5)';
            setTimeout(() => document.body.removeChild(popup), 300);
        };
        popup.appendChild(closeButton);
    
        document.body.appendChild(popup);
    
        // Trigger animation
        setTimeout(() => {
            popup.style.opacity = '1';
            popup.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 10);
    
        // Create and animate particles
        this.createParticles(popup);
    }



    createParticles(popup) {
        const particleCount = 50;
        const colors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#8b00ff'];
    
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.left = '50%';
            particle.style.top = '20%';
            particle.style.width = '10px';
            particle.style.height = '10px';
            particle.style.borderRadius = '50%';
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.pointerEvents = 'none';
            document.body.appendChild(particle);
    
            const angle = Math.random() * Math.PI * 2;
            const velocity = 1 + Math.random() * 2;
            const lifetime = 1000 + Math.random() * 1000;
    
            const startTime = Date.now();
    
            function animateParticle() {
                const elapsed = Date.now() - startTime;
                if (elapsed < lifetime) {
                    const progress = elapsed / lifetime;
                    const x = (velocity * elapsed * Math.cos(angle)) / 20;
                    const y = (velocity * elapsed * Math.sin(angle)) / 20 + (progress * progress * 100);
                    particle.style.transform = `translate(${x}px, ${y}px) scale(${1 - progress})`;
                    particle.style.opacity = 1 - progress;
                    requestAnimationFrame(animateParticle);
                } else {
                    document.body.removeChild(particle);
                }
            }
    
            requestAnimationFrame(animateParticle);
        }
    }

    // Keeping these methods for potential future use or expansion
    initSpeechRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.speechRecognition = new webkitSpeechRecognition();
            this.speechRecognition.continuous = true;
            this.speechRecognition.interimResults = false;

            this.speechRecognition.onresult = (event) => {
                const last = event.results.length - 1;
                const command = event.results[last][0].transcript;
                console.log('Voice command:', command);
                this.processCommand(command);
            };

            this.speechRecognition.start();
        } else {
            console.error('Speech recognition not supported');
        }
    }
    speak(text) {
        speechHandler.speak(text);
    }

    speakResult(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        } else {
            console.error('Speech synthesis not supported');
        }
    }
}