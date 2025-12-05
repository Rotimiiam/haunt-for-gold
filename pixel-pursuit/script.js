class CreativeStoryteller {
    constructor() {
        this.currentStory = null;
        this.gameState = {
            inventory: [],
            location: 'start',
            flags: {},
            health: 100
        };
        this.storyData = {};
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Mode switching
        document.getElementById('gmMode').addEventListener('click', () => this.switchMode('gm'));
        document.getElementById('playerMode').addEventListener('click', () => this.switchMode('player'));

        // Game Master functions
        document.getElementById('generateStory').addEventListener('click', () => this.generateStoryFramework());
        document.getElementById('generateCharacter').addEventListener('click', () => this.generateCharacter());
        document.getElementById('generateScene').addEventListener('click', () => this.generateScene());

        // Player functions
        document.getElementById('submitAction').addEventListener('click', () => this.processPlayerAction());
        document.getElementById('playerInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.processPlayerAction();
        });

        // Quick action buttons
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-action');
                this.processQuickAction(action);
            });
        });
    }

    switchMode(mode) {
        const gmPanel = document.getElementById('gameMasterPanel');
        const playerPanel = document.getElementById('playerPanel');
        const gmBtn = document.getElementById('gmMode');
        const playerBtn = document.getElementById('playerMode');

        if (mode === 'gm') {
            gmPanel.classList.add('active');
            playerPanel.classList.remove('active');
            gmBtn.classList.add('active');
            playerBtn.classList.remove('active');
        } else {
            playerPanel.classList.add('active');
            gmPanel.classList.remove('active');
            playerBtn.classList.add('active');
            gmBtn.classList.remove('active');
        }
    }

    generateStoryFramework() {
        const title = document.getElementById('storyTitle').value;
        const premise = document.getElementById('storyPremise').value;

        if (!title || !premise) {
            this.displayGenerated('Please provide both a title and premise for your story.');
            return;
        }

        // Simulate Kiro's creative assistance
        const storyFramework = this.createStoryFramework(title, premise);
        this.storyData = storyFramework;
        this.displayGenerated(this.formatStoryFramework(storyFramework));
    }

    createStoryFramework(title, premise) {
        // This simulates Kiro's creative input
        const themes = ['mystery', 'adventure', 'magic', 'technology', 'survival'];
        const settings = ['ancient forest', 'abandoned castle', 'futuristic city', 'mysterious island', 'underground cavern'];
        const conflicts = ['ancient curse', 'missing artifact', 'rival faction', 'natural disaster', 'moral dilemma'];

        const randomTheme = themes[Math.floor(Math.random() * themes.length)];
        const randomSetting = settings[Math.floor(Math.random() * settings.length)];
        const randomConflict = conflicts[Math.floor(Math.random() * conflicts.length)];

        return {
            title,
            premise,
            theme: randomTheme,
            setting: randomSetting,
            mainConflict: randomConflict,
            scenes: this.generateInitialScenes(premise, randomSetting, randomConflict),
            characters: []
        };
    }

    generateInitialScenes(premise, setting, conflict) {
        return {
            start: {
                description: `You find yourself in ${setting}. ${premise} The air is thick with anticipation as you sense that ${conflict} awaits.`,
                choices: [
                    { text: "Explore the immediate area", next: "explore" },
                    { text: "Look for clues about the situation", next: "investigate" },
                    { text: "Try to find other people", next: "seek_help" }
                ]
            },
            explore: {
                description: `As you explore ${setting}, you notice strange details that hint at the ${conflict} that lies ahead.`,
                choices: [
                    { text: "Continue deeper", next: "deeper" },
                    { text: "Return to safety", next: "start" }
                ]
            },
            investigate: {
                description: `Your investigation reveals important clues about ${conflict}. The mystery deepens.`,
                choices: [
                    { text: "Follow the clues", next: "follow_clues" },
                    { text: "Seek more information", next: "more_info" }
                ]
            }
        };
    }

    generateCharacter() {
        const role = document.getElementById('characterRole').value;
        if (!role) {
            this.displayGenerated('Please specify a character role first.');
            return;
        }

        const character = this.createCharacter(role);
        if (this.storyData.characters) {
            this.storyData.characters.push(character);
        }
        this.displayGenerated(this.formatCharacter(character));
    }

    createCharacter(role) {
        const personalities = ['wise', 'mysterious', 'cheerful', 'gruff', 'eccentric', 'noble', 'cunning'];
        const motivations = ['seeking redemption', 'protecting a secret', 'searching for truth', 'pursuing power', 'helping others'];
        const quirks = ['speaks in riddles', 'collects unusual items', 'has a pet companion', 'never removes their hood', 'hums ancient melodies'];

        const personality = personalities[Math.floor(Math.random() * personalities.length)];
        const motivation = motivations[Math.floor(Math.random() * motivations.length)];
        const quirk = quirks[Math.floor(Math.random() * quirks.length)];

        return {
            role,
            personality,
            motivation,
            quirk,
            dialogue: this.generateSampleDialogue(role, personality)
        };
    }

    generateSampleDialogue(role, personality) {
        const dialogues = {
            wise: [`"The path ahead is treacherous, but wisdom comes to those who persevere."`, `"I have seen many like you pass through here. Few return unchanged."`],
            mysterious: [`"Not all is as it seems in this place..."`, `"Some secrets are better left undiscovered."`],
            cheerful: [`"What a wonderful day for an adventure!"`, `"I'm sure everything will work out just fine!"`]
        };

        const defaultDialogue = [`"Greetings, traveler."`, `"What brings you to these parts?"`];
        return dialogues[personality] || defaultDialogue;
    }

    generateScene() {
        const context = document.getElementById('sceneContext').value;
        if (!context) {
            this.displayGenerated('Please provide scene context first.');
            return;
        }

        const scene = this.createScene(context);
        this.displayGenerated(this.formatScene(scene));
    }

    createScene(context) {
        const atmospheres = ['tense', 'peaceful', 'mysterious', 'dangerous', 'magical'];
        const elements = ['hidden passage', 'ancient rune', 'strange sound', 'flickering light', 'unusual smell'];
        const challenges = ['puzzle to solve', 'choice to make', 'obstacle to overcome', 'secret to uncover'];

        const atmosphere = atmospheres[Math.floor(Math.random() * atmospheres.length)];
        const element = elements[Math.floor(Math.random() * elements.length)];
        const challenge = challenges[Math.floor(Math.random() * challenges.length)];

        return {
            context,
            atmosphere,
            keyElement: element,
            challenge,
            description: `The scene feels ${atmosphere}. You notice ${element}, which suggests there's ${challenge} here.`
        };
    }

    processPlayerAction() {
        const input = document.getElementById('playerInput').value.trim();
        if (!input) return;

        this.addToStoryDisplay(`> ${input}`, 'player-action');
        
        // Simulate story response
        const response = this.generateStoryResponse(input);
        this.addToStoryDisplay(response, 'story-response');
        
        document.getElementById('playerInput').value = '';
    }

    processQuickAction(action) {
        this.addToStoryDisplay(`> ${action}`, 'player-action');
        
        let response;
        switch(action) {
            case 'look around':
                response = this.generateLookResponse();
                break;
            case 'check inventory':
                response = this.generateInventoryResponse();
                break;
            case 'help':
                response = this.generateHelpResponse();
                break;
            default:
                response = "You're not sure how to do that.";
        }
        
        this.addToStoryDisplay(response, 'story-response');
    }

    generateStoryResponse(input) {
        const responses = [
            "The shadows seem to shift as you speak those words.",
            "A gentle breeze carries the scent of adventure.",
            "You hear a distant sound that piques your curiosity.",
            "Something glimmers in the corner of your eye.",
            "The path ahead becomes clearer with each step."
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    generateLookResponse() {
        const observations = [
            "You see ancient stone walls covered in mysterious symbols.",
            "Sunlight filters through tall windows, casting dancing shadows.",
            "The room is filled with the scent of old parchment and candle wax.",
            "Strange artifacts line the shelves around you."
        ];
        
        return observations[Math.floor(Math.random() * observations.length)];
    }

    generateInventoryResponse() {
        if (this.gameState.inventory.length === 0) {
            return "Your inventory is empty. Perhaps you should explore more to find useful items.";
        }
        return `You carry: ${this.gameState.inventory.join(', ')}`;
    }

    generateHelpResponse() {
        return `Available commands:
• Type any action you want to take
• Use quick buttons for common actions
• Switch to Game Master mode to create stories
• Be creative - the story adapts to your choices!`;
    }

    addToStoryDisplay(text, className = '') {
        const display = document.getElementById('storyDisplay');
        const p = document.createElement('p');
        p.textContent = text;
        if (className) p.className = className;
        display.appendChild(p);
        display.scrollTop = display.scrollHeight;
    }

    displayGenerated(content) {
        document.getElementById('generatedContent').textContent = content;
    }

    formatStoryFramework(framework) {
        return `📖 STORY FRAMEWORK: "${framework.title}"

🎭 Theme: ${framework.theme}
🏰 Setting: ${framework.setting}  
⚔️ Main Conflict: ${framework.mainConflict}

📝 Premise: ${framework.premise}

🎬 Starting Scene:
${framework.scenes.start.description}

Available choices:
${framework.scenes.start.choices.map(choice => `• ${choice.text}`).join('\n')}

Your story framework is ready! Switch to Player mode to test it, or continue adding characters and scenes.`;
    }

    formatCharacter(character) {
        return `👤 CHARACTER: ${character.role}

🎭 Personality: ${character.personality}
💭 Motivation: ${character.motivation}  
✨ Quirk: ${character.quirk}

💬 Sample Dialogue:
${character.dialogue.map(line => `  ${line}`).join('\n')}

Character added to your story!`;
    }

    formatScene(scene) {
        return `🎬 SCENE GENERATED

📍 Context: ${scene.context}
🌟 Atmosphere: ${scene.atmosphere}
🔍 Key Element: ${scene.keyElement}
🎯 Challenge: ${scene.challenge}

📖 Description:
${scene.description}

Scene ready to integrate into your story!`;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new CreativeStoryteller();
});

// Add some CSS classes for different message types
const style = document.createElement('style');
style.textContent = `
    .player-action {
        color: #d4af37;
        font-weight: bold;
        margin: 10px 0 5px 0;
    }
    
    .story-response {
        margin: 5px 0 15px 20px;
        font-style: italic;
        line-height: 1.6;
    }
`;
document.head.appendChild(style);