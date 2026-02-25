// ui.js - Sistema de Interface para o Jogo Backrooms

class BackroomsUI {
    constructor() {
        this.state = {
            sanity: 85,
            level: 0,
            items: 0,
            journalEntries: [
                "Você acorda em uma sala de escritório amarelada...",
                "O zumbido das lâmpadas fluorescentes preenche o silêncio.",
                "Parece que você não está sozinho aqui..."
            ],
            currentEntry: 0,
            inventory: [],
            settings: {
                sound: true,
                music: true,
                volume: 70
            }
        };
        
        this.modals = {
            inventory: null,
            settings: null
        };
        
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.setupCanvas();
        this.updateUI();
        this.startGameLoop();
    }
    
    cacheElements() {
        // Elementos principais
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas?.getContext('2d');
        this.journalContent = document.getElementById('journalText');
        this.levelDisplay = document.getElementById('levelDisplay');
        this.itemsCount = document.getElementById('itemsCount');
        this.sanityBar = document.querySelector('.progress-fill.sanity');
        
        // Modais
        this.inventoryModal = document.getElementById('inventoryModal');
        this.settingsModal = document.getElementById('settingsModal');
        this.inventoryList = document.querySelector('.inventory-list');
        
        // Botões de controle
        this.moveButtons = document.querySelectorAll('.control-btn.move');
        this.interactBtn = document.getElementById('interactBtn');
        this.inventoryBtn = document.getElementById('inventoryBtn');
        this.mapBtn = document.getElementById('mapBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.closeModalButtons = document.querySelectorAll('.close-modal');
        
        // Configurações
        this.soundToggle = document.querySelector('#settingsModal input[type="checkbox"]:first-of-type');
        this.musicToggle = document.querySelector('#settingsModal input[type="checkbox"]:last-of-type');
        this.volumeSlider = document.querySelector('#settingsModal input[type="range"]');
    }
    
    setupEventListeners() {
        // Botões de movimento
        this.moveButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const direction = e.currentTarget.dataset.direction;
                this.handleMovement(direction);
            });
        });
        
        // Botão de interação
        if (this.interactBtn) {
            this.interactBtn.addEventListener('click', () => this.handleInteraction());
        }
        
        // Botões do menu
        if (this.inventoryBtn) {
            this.inventoryBtn.addEventListener('click', () => this.toggleModal('inventory'));
        }
        
        if (this.mapBtn) {
            this.mapBtn.addEventListener('click', () => this.showMap());
        }
        
        if (this.settingsBtn) {
            this.settingsBtn.addEventListener('click', () => this.toggleModal('settings'));
        }
        
        // Fechar modais
        this.closeModalButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.closeModal(modal);
            });
        });
        
        // Fechar modal clicando fora
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });
        
        // Teclado
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
        
        // Configurações
        if (this.soundToggle) {
            this.soundToggle.addEventListener('change', (e) => {
                this.state.settings.sound = e.target.checked;
                this.saveSettings();
            });
        }
        
        if (this.musicToggle) {
            this.musicToggle.addEventListener('change', (e) => {
                this.state.settings.music = e.target.checked;
                this.saveSettings();
            });
        }
        
        if (this.volumeSlider) {
            this.volumeSlider.addEventListener('input', (e) => {
                this.state.settings.volume = e.target.value;
                this.saveSettings();
            });
        }
    }
    
    setupCanvas() {
        if (!this.canvas) return;
        
        // Ajustar tamanho do canvas
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Desenhar cena inicial
        this.drawInitialScene();
    }
    
    resizeCanvas() {
        if (!this.canvas) return;
        
        const container = this.canvas.parentElement;
        if (container) {
            this.canvas.width = container.clientWidth;
            this.canvas.height = 400; // Altura fixa
        }
    }
    
    drawInitialScene() {
        if (!this.ctx || !this.canvas) return;
        
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Fundo
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(0, 0, w, h);
        
        // Efeito de parede de escritório (linhas)
        ctx.strokeStyle = '#3a3a3a';
        ctx.lineWidth = 2;
        
        // Linhas horizontais (simulando paredes)
        for (let i = 0; i < h; i += 40) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(w, i);
            ctx.strokeStyle = '#3a3a3a';
            ctx.stroke();
        }
        
        // Linhas verticais
        for (let i = 0; i < w; i += 60) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, h);
            ctx.strokeStyle = '#3a3a3a';
            ctx.stroke();
        }
        
        // Efeito de luz fluorescente
        ctx.fillStyle = 'rgba(255, 255, 200, 0.03)';
        for (let i = 0; i < w; i += 80) {
            ctx.fillRect(i, 10, 40, 20);
        }
        
        // Névoa
        ctx.fillStyle = 'rgba(255, 255, 200, 0.02)';
        ctx.fillRect(0, 0, w, h);
        
        // Adicionar algumas "entidades" aleatórias (sombra)
        if (Math.random() > 0.7) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.arc(w * 0.8, h * 0.3, 20, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    handleMovement(direction) {
        console.log(`Movendo para ${direction}`);
        
        // Feedback visual
        const btn = document.querySelector(`[data-direction="${direction}"]`);
        if (btn) {
            btn.style.transform = 'scale(0.9)';
            setTimeout(() => {
                btn.style.transform = '';
            }, 100);
        }
        
        // Lógica de movimento (a ser implementada)
        this.addJournalEntry(`Você se move para ${this.getDirectionName(direction)}...`);
        
        // Atualizar canvas (simulação)
        this.drawInitialScene();
        
        // Diminuir sanidade aleatoriamente
        if (Math.random() > 0.8) {
            this.updateSanity(-5);
        }
    }
    
    getDirectionName(direction) {
        const names = {
            'up': 'norte',
            'down': 'sul',
            'left': 'oeste',
            'right': 'leste'
        };
        return names[direction] || direction;
    }
    
    handleInteraction() {
        console.log('Interagindo');
        
        // Feedback visual
        this.interactBtn.style.transform = 'scale(0.9)';
        setTimeout(() => {
            this.interactBtn.style.transform = '';
        }, 100);
        
        // Simular encontrar item
        const foundItem = Math.random() > 0.5;
        
        if (foundItem) {
            const items = ['Chave enferrujada', 'Bateria', 'Nota amassada', 'Lanterna', 'Água'];
            const item = items[Math.floor(Math.random() * items.length)];
            this.addItem(item);
            this.addJournalEntry(`Você encontrou: ${item}`);
        } else {
            this.addJournalEntry('Nada de interessante aqui...');
        }
    }
    
    toggleModal(modalName) {
        const modal = modalName === 'inventory' ? this.inventoryModal : this.settingsModal;
        
        if (modal) {
            if (modal.classList.contains('active')) {
                this.closeModal(modal);
            } else {
                this.openModal(modal);
            }
        }
    }
    
    openModal(modal) {
        // Fechar outros modais primeiro
        document.querySelectorAll('.modal.active').forEach(m => {
            m.classList.remove('active');
        });
        
        modal.classList.add('active');
        
        // Atualizar conteúdo do modal se necessário
        if (modal === this.inventoryModal) {
            this.updateInventoryDisplay();
        }
        
        // Pausar jogo? (opcional)
        this.gamePaused = true;
    }
    
    closeModal(modal) {
        modal.classList.remove('active');
        this.gamePaused = false;
    }
    
    showMap() {
        // Simulação de mapa
        alert('Mapa ainda está sendo desenhado...');
        this.addJournalEntry('Você tenta se orientar, mas o mapa parece infinito.');
    }
    
    updateUI() {
        // Atualizar displays
        if (this.levelDisplay) {
            this.levelDisplay.textContent = this.state.level;
        }
        
        if (this.itemsCount) {
            this.itemsCount.textContent = this.state.items;
        }
        
        if (this.sanityBar) {
            this.sanityBar.style.width = `${this.state.sanity}%`;
            
            // Mudar cor baseado na sanidade
            if (this.state.sanity < 30) {
                this.sanityBar.style.background = 'linear-gradient(90deg, #dc3545, #6610f2)';
            } else if (this.state.sanity < 60) {
                this.sanityBar.style.background = 'linear-gradient(90deg, #ffc107, #fd7e14)';
            }
        }
    }
    
    updateSanity(change) {
        this.state.sanity = Math.max(0, Math.min(100, this.state.sanity + change));
        this.updateUI();
        
        if (this.state.sanity <= 0) {
            this.gameOver();
        } else if (this.state.sanity < 20) {
            this.addJournalEntry('Você está sentindo sua sanidade escapando...', true);
        }
    }
    
    addItem(item) {
        this.state.inventory.push(item);
        this.state.items = this.state.inventory.length;
        this.updateUI();
        this.updateInventoryDisplay();
    }
    
    removeItem(itemName) {
        const index = this.state.inventory.indexOf(itemName);
        if (index > -1) {
            this.state.inventory.splice(index, 1);
            this.state.items = this.state.inventory.length;
            this.updateUI();
            this.updateInventoryDisplay();
        }
    }
    
    updateInventoryDisplay() {
        if (!this.inventoryList) return;
        
        if (this.state.inventory.length === 0) {
            this.inventoryList.innerHTML = '<li class="inventory-item empty">Vazio</li>';
        } else {
            this.inventoryList.innerHTML = this.state.inventory
                .map(item => `<li class="inventory-item">📦 ${item}</li>`)
                .join('');
        }
    }
    
    addJournalEntry(text, isImportant = false) {
        if (!this.journalContent) return;
        
        const entry = document.createElement('p');
        entry.textContent = text;
        
        if (isImportant) {
            entry.style.color = '#ffd966';
            entry.style.fontWeight = 'bold';
        }
        
        this.journalContent.appendChild(entry);
        
        // Scroll para a nova entrada
        const journalArea = document.querySelector('.journal-area');
        if (journalArea) {
            journalArea.scrollTop = journalArea.scrollHeight;
        }
        
        // Manter apenas as últimas 10 entradas
        while (this.journalContent.children.length > 10) {
            this.journalContent.removeChild(this.journalContent.firstChild);
        }
    }
    
    handleKeyboard(e) {
        if (this.gamePaused) {
            if (e.key === 'Escape') {
                this.closeModal(document.querySelector('.modal.active'));
            }
            return;
        }
        
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                this.handleMovement('up');
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                this.handleMovement('down');
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                this.handleMovement('left');
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.handleMovement('right');
                break;
            case ' ':
            case 'e':
            case 'E':
                e.preventDefault();
                this.handleInteraction();
                break;
            case 'i':
            case 'I':
                this.toggleModal('inventory');
                break;
            case 'm':
            case 'M':
                this.showMap();
                break;
            case 'Escape':
                if (document.querySelector('.modal.active')) {
                    this.closeModal(document.querySelector('.modal.active'));
                }
                break;
        }
    }
    
    saveSettings() {
        localStorage.setItem('backrooms_settings', JSON.stringify(this.state.settings));
        console.log('Configurações salvas:', this.state.settings);
    }
    
    loadSettings() {
        const saved = localStorage.getItem('backrooms_settings');
        if (saved) {
            try {
                this.state.settings = JSON.parse(saved);
                this.applySettings();
            } catch (e) {
                console.error('Erro ao carregar configurações:', e);
            }
        }
    }
    
    applySettings() {
        // Aplicar configurações carregadas
        if (this.soundToggle) this.soundToggle.checked = this.state.settings.sound;
        if (this.musicToggle) this.musicToggle.checked = this.state.settings.music;
        if (this.volumeSlider) this.volumeSlider.value = this.state.settings.volume;
    }
    
    gameOver() {
        alert('GAME OVER - Sua sanidade chegou ao fim...');
        this.resetGame();
    }
    
    resetGame() {
        this.state.sanity = 85;
        this.state.level = 0;
        this.state.items = 0;
        this.state.inventory = [];
        this.state.journalEntries = [
            "Você acorda em uma sala de escritório amarelada...",
            "O zumbido das lâmpadas fluorescentes preenche o silêncio."
        ];
        
        this.journalContent.innerHTML = '';
        this.state.journalEntries.forEach(entry => {
            this.addJournalEntry(entry);
        });
        
        this.updateUI();
        this.updateInventoryDisplay();
        this.drawInitialScene();
    }
    
    startGameLoop() {
        // Loop principal do jogo (atualizações periódicas)
        setInterval(() => {
            if (!this.gamePaused) {
                // Efeitos ambientais
                if (Math.random() > 0.95) {
                    this.drawInitialScene(); // Redesenhar com pequenas variações
                }
                
                // Diminuir sanidade muito lentamente ao longo do tempo
                if (Math.random() > 0.98) {
                    this.updateSanity(-1);
                }
            }
        }, 5000); // A cada 5 segundos
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.game = new BackroomsUI();
    console.log('Backrooms UI inicializado!');
});

// Exportar para uso em outros módulos (se necessário)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BackroomsUI;
}