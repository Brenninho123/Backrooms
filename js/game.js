// game.js - Motor Principal do Jogo Backrooms

class BackroomsGame {
    constructor() {
        // Estado do jogador
        this.player = {
            x: 0,
            y: 0,
            z: 0, // Nível atual (0 = Nível 0)
            rotation: 0, // Direção que está olhando (0-360)
            sanity: 100,
            maxSanity: 100,
            energy: 100,
            maxEnergy: 100,
            hunger: 0,
            thirst: 0,
            inventory: [],
            maxInventory: 8,
            weight: 0,
            maxWeight: 10,
            equipped: null,
            quickSlots: [null, null, null, null]
        };

        // Estatísticas da sessão
        this.stats = {
            startTime: Date.now(),
            roomsExplored: 1,
            itemsCollected: 0,
            entitiesEncountered: 0,
            distanceTraveled: 0,
            entitiesKilled: 0
        };

        // Mapa do jogo
        this.map = {
            currentLevel: 0,
            rooms: new Map(), // Armazena salas exploradas
            discoveredRooms: new Set(),
            entities: [],
            items: []
        };

        // Configurações de dificuldade
        this.difficulty = {
            name: 'normal',
            sanityDrain: 0.1, // Por minuto
            entityAggression: 1.0,
            itemRarity: 1.0,
            hungerRate: 0.05,
            thirstRate: 0.08
        };

        // Estado do jogo
        this.state = {
            isRunning: false,
            isPaused: false,
            gameOver: false,
            gameOverReason: '',
            currentTime: 0,
            timeScale: 1.0,
            tickCount: 0
        };

        // Sistema de eventos
        this.events = [];
        this.nearbyEntities = [];
        this.nearbyItems = [];

        // Timers
        this.timers = {
            sanityTimer: 0,
            hungerTimer: 0,
            thirstTimer: 0,
            entitySpawnTimer: 0,
            ambientTimer: 0
        };

        // Configurações de spawn
        this.spawnConfig = {
            maxEntities: 5,
            spawnRate: 30000, // 30 segundos
            itemSpawnRate: 45000, // 45 segundos
            entityTypes: ['hounder', 'smiler', 'clump', 'partygoer'],
            itemTypes: ['water', 'food', 'battery', 'key', 'note', 'flashlight']
        };
    }

    // Inicializar o jogo
    init(difficulty = 'normal') {
        this.setDifficulty(difficulty);
        this.generateStartingRoom();
        this.startGameLoop();
        this.state.isRunning = true;
        console.log('Jogo inicializado com dificuldade:', difficulty);
    }

    // Configurar dificuldade
    setDifficulty(difficulty) {
        switch(difficulty) {
            case 'easy':
                this.difficulty = {
                    name: 'easy',
                    sanityDrain: 0.05,
                    entityAggression: 0.5,
                    itemRarity: 1.5,
                    hungerRate: 0.02,
                    thirstRate: 0.04
                };
                break;
            case 'normal':
                this.difficulty = {
                    name: 'normal',
                    sanityDrain: 0.1,
                    entityAggression: 1.0,
                    itemRarity: 1.0,
                    hungerRate: 0.05,
                    thirstRate: 0.08
                };
                break;
            case 'hard':
                this.difficulty = {
                    name: 'hard',
                    sanityDrain: 0.2,
                    entityAggression: 1.5,
                    itemRarity: 0.5,
                    hungerRate: 0.08,
                    thirstRate: 0.12
                };
                break;
            case 'nightmare':
                this.difficulty = {
                    name: 'nightmare',
                    sanityDrain: 0.3,
                    entityAggression: 2.0,
                    itemRarity: 0.25,
                    hungerRate: 0.12,
                    thirstRate: 0.15
                };
                break;
        }
    }

    // Gerar sala inicial
    generateStartingRoom() {
        const startRoom = {
            id: '0_0_0',
            x: 0,
            y: 0,
            z: 0,
            type: 'office',
            discovered: true,
            exits: this.generateExits(),
            entities: [],
            items: this.generateItems(2),
            description: 'Uma sala de escritório amarelada com várias mesas.',
            features: ['flickering_lights', 'humming'],
            danger: 0.2
        };

        this.map.rooms.set('0_0_0', startRoom);
        this.player.x = 0;
        this.player.y = 0;
        this.player.z = 0;
    }

    // Gerar saídas para uma sala
    generateExits() {
        const directions = ['north', 'south', 'east', 'west'];
        const exits = {};
        
        // 80% de chance de ter uma saída em cada direção
        directions.forEach(dir => {
            if (Math.random() < 0.8) {
                exits[dir] = true;
            }
        });

        return exits;
    }

    // Gerar itens para uma sala
    generateItems(maxItems) {
        const items = [];
        const numItems = Math.floor(Math.random() * maxItems) + 1;
        
        for (let i = 0; i < numItems; i++) {
            if (Math.random() < 0.4 * this.difficulty.itemRarity) {
                items.push(this.createRandomItem());
            }
        }
        
        return items;
    }

    // Criar item aleatório
    createRandomItem() {
        const types = this.spawnConfig.itemTypes;
        const type = types[Math.floor(Math.random() * types.length)];
        
        const items = {
            water: {
                id: `water_${Date.now()}_${Math.random()}`,
                name: 'Garrafa de Água',
                icon: '💧',
                weight: 0.5,
                use: (player) => {
                    player.thirst = Math.max(0, player.thirst - 30);
                    return 'Você bebeu água. Sede diminuída.';
                }
            },
            food: {
                id: `food_${Date.now()}_${Math.random()}`,
                name: 'Comida Enlatada',
                icon: '🥫',
                weight: 0.3,
                use: (player) => {
                    player.hunger = Math.max(0, player.hunger - 25);
                    return 'Você comeu. Fome diminuída.';
                }
            },
            battery: {
                id: `battery_${Date.now()}_${Math.random()}`,
                name: 'Bateria',
                icon: '🔋',
                weight: 0.2,
                use: (player) => {
                    // Usado para lanterna
                    return 'Bateria adicionada à lanterna.';
                }
            },
            key: {
                id: `key_${Date.now()}_${Math.random()}`,
                name: 'Chave Enferrujada',
                icon: '🔑',
                weight: 0.1,
                use: (player) => {
                    return 'Uma chave velha. Deve abrir algo.';
                }
            },
            note: {
                id: `note_${Date.now()}_${Math.random()}`,
                name: 'Nota Amassada',
                icon: '📝',
                weight: 0,
                use: (player) => {
                    const messages = [
                        'Não confie nas luzes...',
                        'Eles estão nas paredes',
                        'Corra quando ouvir o zumbido',
                        'A saída é uma mentira',
                        'Você não está sozinho'
                    ];
                    return messages[Math.floor(Math.random() * messages.length)];
                }
            },
            flashlight: {
                id: `flashlight_${Date.now()}_${Math.random()}`,
                name: 'Lanterna',
                icon: '🔦',
                weight: 1.0,
                use: (player) => {
                    if (player.equipped === 'flashlight') {
                        player.equipped = null;
                        return 'Lanterna guardada.';
                    } else {
                        player.equipped = 'flashlight';
                        return 'Lanterna equipada.';
                    }
                }
            }
        };

        return items[type];
    }

    // Loop principal do jogo
    startGameLoop() {
        const tickRate = 100; // 100ms = 10 ticks por segundo
        this.gameLoop = setInterval(() => this.tick(), tickRate);
    }

    // Tick do jogo
    tick() {
        if (!this.state.isRunning || this.state.isPaused || this.state.gameOver) return;

        this.state.tickCount++;
        this.state.currentTime += 0.1; // 0.1 segundos por tick

        // Atualizar timers
        this.updateTimers();

        // Processar sistemas
        this.updatePlayerStatus();
        this.updateEntities();
        this.checkNearbyEntities();
        this.updateEnvironment();

        // Verificar game over
        this.checkGameOver();

        // Atualizar UI
        if (window.ui) {
            window.ui.updateFromGame(this);
        }
    }

    // Atualizar timers
    updateTimers() {
        this.timers.sanityTimer += 0.1;
        this.timers.hungerTimer += 0.1;
        this.timers.thirstTimer += 0.1;
        this.timers.entitySpawnTimer += 0.1;
        this.timers.ambientTimer += 0.1;
    }

    // Atualizar status do jogador
    updatePlayerStatus() {
        // Sanidade diminui com o tempo
        if (this.timers.sanityTimer >= 60) { // Por minuto
            this.player.sanity = Math.max(0, this.player.sanity - this.difficulty.sanityDrain);
            this.timers.sanityTimer = 0;
        }

        // Fome e sede
        if (this.timers.hungerTimer >= 60) {
            this.player.hunger = Math.min(100, this.player.hunger + this.difficulty.hungerRate * 60);
            this.timers.hungerTimer = 0;
        }

        if (this.timers.thirstTimer >= 60) {
            this.player.thirst = Math.min(100, this.player.thirst + this.difficulty.thirstRate * 60);
            this.timers.thirstTimer = 0;
        }

        // Energia diminui com fome/sede
        if (this.player.hunger > 50 || this.player.thirst > 50) {
            this.player.energy = Math.max(0, this.player.energy - 0.5);
        }

        // Sanidade afetada por fome/sede
        if (this.player.hunger > 80 || this.player.thirst > 80) {
            this.player.sanity = Math.max(0, this.player.sanity - 0.2);
        }

        // Entidades próximas afetam sanidade
        if (this.nearbyEntities.length > 0) {
            this.player.sanity = Math.max(0, this.player.sanity - (this.nearbyEntities.length * 0.5));
        }

        // Arredondar valores
        this.player.sanity = Math.round(this.player.sanity * 10) / 10;
        this.player.energy = Math.round(this.player.energy * 10) / 10;
        this.player.hunger = Math.round(this.player.hunger * 10) / 10;
        this.player.thirst = Math.round(this.player.thirst * 10) / 10;
    }

    // Mover jogador
    movePlayer(direction) {
        if (this.state.isPaused || this.state.gameOver) return false;

        const currentRoom = this.map.rooms.get(`${this.player.x}_${this.player.y}_${this.player.z}`);
        if (!currentRoom || !currentRoom.exits[direction]) {
            this.addEvent('Não há saída nesta direção.');
            return false;
        }

        // Calcular nova posição
        let newX = this.player.x;
        let newY = this.player.y;

        switch(direction) {
            case 'north': newY++; break;
            case 'south': newY--; break;
            case 'east': newX++; break;
            case 'west': newX--; break;
        }

        // Verificar se a sala existe
        const roomId = `${newX}_${newY}_${this.player.z}`;
        if (!this.map.rooms.has(roomId)) {
            this.generateRoom(newX, newY, this.player.z);
        }

        // Mover jogador
        const oldX = this.player.x;
        const oldY = this.player.y;
        this.player.x = newX;
        this.player.y = newY;

        // Atualizar estatísticas
        this.stats.distanceTraveled++;
        
        // Marcar sala como descoberta
        const newRoom = this.map.rooms.get(roomId);
        if (!newRoom.discovered) {
            newRoom.discovered = true;
            this.stats.roomsExplored++;
            this.addEvent(`Você explorou uma nova sala. Total: ${this.stats.roomsExplored}`);
        }

        // Consumir energia
        this.player.energy = Math.max(0, this.player.energy - 2);

        // Chance de encontrar entidade
        if (Math.random() < 0.1 * this.difficulty.entityAggression) {
            this.spawnEntity();
        }

        return true;
    }

    // Gerar nova sala
    generateRoom(x, y, z) {
        const roomId = `${x}_${y}_${z}`;
        
        // Determinar tipo de sala baseado na posição
        let roomType = 'office';
        const distanceFromStart = Math.abs(x) + Math.abs(y);
        
        if (distanceFromStart > 10) {
            roomType = 'warehouse';
        } else if (distanceFromStart > 5) {
            roomType = 'hallway';
        }

        const newRoom = {
            id: roomId,
            x: x,
            y: y,
            z: z,
            type: roomType,
            discovered: false,
            exits: this.generateExits(),
            entities: [],
            items: this.generateItems(3),
            description: this.getRoomDescription(roomType),
            features: this.generateFeatures(roomType),
            danger: Math.min(1, distanceFromStart / 20)
        };

        this.map.rooms.set(roomId, newRoom);
        return newRoom;
    }

    // Obter descrição da sala
    getRoomDescription(type) {
        const descriptions = {
            office: [
                'Uma sala de escritório com paredes amareladas.',
                'Mesas e cadeiras abandonadas se estendem até onde a vista alcança.',
                'O som de lâmpadas fluorescentes preenche o ambiente.'
            ],
            hallway: [
                'Um corredor infinito com portas de ambos os lados.',
                'As luzes piscam em intervalos regulares.',
                'O papel de parede está descascando, revelando concreto por baixo.'
            ],
            warehouse: [
                'Um enorme depósito com prateleiras vazias.',
                'Caixas empilhadas criam um labirinto dentro do labirinto.',
                'O eco dos seus passos parece voltar diferente...'
            ]
        };

        const typeDescriptions = descriptions[type] || descriptions.office;
        return typeDescriptions[Math.floor(Math.random() * typeDescriptions.length)];
    }

    // Gerar características da sala
    generateFeatures(type) {
        const features = [];
        const possibleFeatures = {
            office: ['flickering_lights', 'humming', 'broken_chair', 'stacked_papers'],
            hallway: ['echo', 'distant_noise', 'open_doors', 'wet_floor'],
            warehouse: ['high_ceiling', 'dark_corners', 'moving_shadows', 'cold_air']
        };

        const typeFeatures = possibleFeatures[type] || possibleFeatures.office;
        const numFeatures = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < numFeatures; i++) {
            const feature = typeFeatures[Math.floor(Math.random() * typeFeatures.length)];
            if (!features.includes(feature)) {
                features.push(feature);
            }
        }

        return features;
    }

    // Spawnar entidade
    spawnEntity() {
        if (this.map.entities.length >= this.spawnConfig.maxEntities) return;

        const entityTypes = {
            hounder: {
                name: 'Hounder',
                icon: '👁️',
                danger: 0.6,
                speed: 1,
                sanityDrain: 10,
                sound: 'latido distante'
            },
            smiler: {
                name: 'Smiler',
                icon: '😀',
                danger: 0.8,
                speed: 0.5,
                sanityDrain: 15,
                sound: 'risada abafada'
            },
            clump: {
                name: 'Clump',
                icon: '🕷️',
                danger: 0.4,
                speed: 0.3,
                sanityDrain: 5,
                sound: 'arranhando'
            },
            partygoer: {
                name: 'Partygoer',
                icon: '🎈',
                danger: 0.9,
                speed: 1.5,
                sanityDrain: 20,
                sound: 'música de festa distorcida'
            }
        };

        const type = this.spawnConfig.entityTypes[Math.floor(Math.random() * this.spawnConfig.entityTypes.length)];
        const baseEntity = entityTypes[type];

        const entity = {
            id: `entity_${Date.now()}_${Math.random()}`,
            type: type,
            name: baseEntity.name,
            icon: baseEntity.icon,
            danger: baseEntity.danger * this.difficulty.entityAggression,
            speed: baseEntity.speed,
            sanityDrain: baseEntity.sanityDrain,
            sound: baseEntity.sound,
            x: this.player.x + (Math.random() > 0.5 ? 1 : -1),
            y: this.player.y + (Math.random() > 0.5 ? 1 : -1),
            z: this.player.z,
            health: 100,
            state: 'wandering',
            lastSeen: Date.now()
        };

        this.map.entities.push(entity);
        this.stats.entitiesEncountered++;
    }

    // Atualizar entidades
    updateEntities() {
        for (let i = this.map.entities.length - 1; i >= 0; i--) {
            const entity = this.map.entities[i];
            
            // Verificar distância do jogador
            const dx = Math.abs(entity.x - this.player.x);
            const dy = Math.abs(entity.y - this.player.y);
            const distance = Math.sqrt(dx * dx + dy * dy);

            // IA da entidade
            if (distance < 3) {
                // Perseguir jogador
                if (entity.x < this.player.x) entity.x += entity.speed * 0.1;
                else if (entity.x > this.player.x) entity.x -= entity.speed * 0.1;
                
                if (entity.y < this.player.y) entity.y += entity.speed * 0.1;
                else if (entity.y > this.player.y) entity.y -= entity.speed * 0.1;

                entity.state = 'chasing';

                // Ataque
                if (distance < 1.5) {
                    this.player.sanity = Math.max(0, this.player.sanity - entity.sanityDrain);
                    this.addEvent(`⚠️ ${entity.name} está perto! Sanidade diminuída!`, 'danger');
                }
            } else {
                entity.state = 'wandering';
                
                // Movimento aleatório
                if (Math.random() < 0.01) {
                    entity.x += (Math.random() - 0.5) * 0.5;
                    entity.y += (Math.random() - 0.5) * 0.5;
                }
            }

            // Remover entidades muito distantes
            if (distance > 20) {
                this.map.entities.splice(i, 1);
            }
        }
    }

    // Verificar entidades próximas
    checkNearbyEntities() {
        this.nearbyEntities = this.map.entities.filter(entity => {
            const dx = Math.abs(entity.x - this.player.x);
            const dy = Math.abs(entity.y - this.player.y);
            return dx <= 2 && dy <= 2;
        });
    }

    // Coletar item
    collectItem(itemId) {
        const currentRoom = this.map.rooms.get(`${this.player.x}_${this.player.y}_${this.player.z}`);
        if (!currentRoom) return false;

        const itemIndex = currentRoom.items.findIndex(item => item.id === itemId);
        if (itemIndex === -1) return false;

        const item = currentRoom.items[itemIndex];

        // Verificar peso
        if (this.player.weight + item.weight > this.player.maxWeight) {
            this.addEvent('❌ Muito pesado! Você não pod