// --- VARIÁVEIS DE ESTADO E PAGINAÇÃO ---
let cartItems = 0;
let gamesData = []; 
let visibleCount = 12; // Quantos jogos mostrar por vez
let currentFilter = 'all'; // Filtro atual ativo

// --- SELETORES DOM ---
const gamesGrid = document.getElementById('games-grid');
const cartCount = document.getElementById('cart-count');
const modal = document.getElementById('product-modal');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.getElementById('close-modal');
const header = document.getElementById('navbar');

// --- CRIANDO O BOTÃO "VEJA MAIS" DINAMICAMENTE ---
const loadMoreContainer = document.createElement('div');
loadMoreContainer.className = 'load-more-container';
loadMoreContainer.innerHTML = `<button class="btn btn-glow" id="load-more-btn"><i class="fas fa-chevron-down"></i> Ver Mais Jogos</button>`;
loadMoreContainer.style.display = 'none'; // Começa escondido

// Insere o container logo após o grid de jogos no HTML
gamesGrid.parentNode.insertBefore(loadMoreContainer, gamesGrid.nextSibling);
const loadMoreBtn = document.getElementById('load-more-btn');

// Ação de clicar no botão "Veja Mais"
loadMoreBtn.addEventListener('click', () => {
    visibleCount += 12; // Aumenta o limite em mais 12
    renderGames(true); // O 'true' avisa a função que é um carregamento adicional
});

// --- 1. CONSUMINDO A API ---
async function fetchGames() {
    gamesGrid.innerHTML = '<p style="text-align: center; width: 100%; color: var(--primary-orange);">Conectando à API e baixando o catálogo de jogos...</p>';

    try {
        // Agora pedimos 36 jogos para a API (pageSize=36)
        const apiUrl = 'https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=36';
        const response = await fetch(apiUrl);
        
        if (!response.ok) throw new Error(`Erro de conexão: ${response.status}`);
        
        const data = await response.json();

        gamesData = data.map((game, index) => {
            let cat = 'fps';
            if (index % 2 === 0) cat = 'rpg';
            if (index % 3 === 0) cat = 'race';

            return {
                id: game.dealID,
                title: game.title,
                category: cat,
                price: parseFloat(game.normalPrice),
                image: game.thumb,
                description: `Oferta importada em tempo real via API! Metacritic: ${game.metacriticScore || 'N/A'}.`,
                reviews: [{ user: "GamerPro", rating: 5, text: "Excelente jogo, a entrega digital foi imediata!" }]
            };
        });

        // Primeiro render
        renderGames();

    } catch (error) {
        console.error("Ops, falha ao buscar os jogos:", error);
        gamesGrid.innerHTML = `<p style="text-align: center; width: 100%; color: red;">Erro ao carregar os jogos da API: ${error.message}.</p>`;
    }
}

// --- 2. RENDERIZAR JOGOS NO CATÁLOGO (COM ANIMAÇÃO) ---
function renderGames(isLoadMore = false) {
    // Se NÃO for clique em "Veja Mais" (ex: trocar filtro), limpa o grid todo
    if (!isLoadMore) {
        gamesGrid.innerHTML = ''; 
    }

    // Filtra a lista principal
    const filteredGames = currentFilter === 'all' 
        ? gamesData 
        : gamesData.filter(game => game.category === currentFilter);

    // Lógica para pegar apenas os jogos da rodada atual
    const startIndex = isLoadMore ? visibleCount - 12 : 0;
    const itemsToRender = filteredGames.slice(startIndex, visibleCount);

    // Desenha as cartas na tela
    itemsToRender.forEach((game, index) => {
        const formattedPrice = game.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        const gameCard = document.createElement('div');
        gameCard.classList.add('game-card');
        
        // --- A MÁGICA DA ANIMAÇÃO ---
        gameCard.classList.add('fade-in-up');
        // Cria um atraso em cascata: o 1º demora 0s, o 2º 0.1s, o 3º 0.2s...
        gameCard.style.animationDelay = `${index * 0.1}s`;

        gameCard.onclick = () => openModal(game);

        gameCard.innerHTML = `
            <img src="${game.image}" alt="${game.title}" class="game-img">
            <div class="game-info">
                <span class="game-cat">${game.category === 'rpg' ? 'RPG' : game.category === 'fps' ? 'Ação/FPS' : 'Corrida'}</span>
                <h3 class="game-title">${game.title}</h3>
                <div class="game-price-row">
                    <span class="game-price">${formattedPrice}</span>
                    <button class="add-to-cart" onclick="addToCart(event)">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `;
        gamesGrid.appendChild(gameCard);
    });

    // Controla se o botão "Veja Mais" deve aparecer ou sumir
    if (visibleCount >= filteredGames.length) {
        loadMoreContainer.style.display = 'none'; // Esconde se acabaram os jogos
    } else {
        loadMoreContainer.style.display = 'flex'; // Mostra se ainda tem jogos
    }
}

// --- 3. SISTEMA DE FILTROS ---
const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Atualiza os estados e reinicia a contagem
        currentFilter = btn.dataset.filter;
        visibleCount = 12; 
        renderGames();
    });
});

// --- 4. LÓGICA DO CARRINHO ---
window.addToCart = function(event) {
    if(event) event.stopPropagation();
    cartItems++;
    cartCount.innerText = cartItems;
    
    const btn = event.currentTarget;
    btn.innerHTML = '<i class="fas fa-check"></i>';
    btn.style.background = 'var(--primary-orange)';
    btn.style.color = '#fff';
    
    setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-plus"></i>';
        btn.style.background = '';
        btn.style.color = '';
    }, 1000);
}

// --- 5. LÓGICA DO MODAL DE DETALHES DO PRODUTO ---
function openModal(game) {
    const formattedPrice = game.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    let reviewsHTML = '';
    if(game.reviews.length === 0) {
        reviewsHTML = '<p class="review-text">Ainda não há avaliações para este jogo.</p>';
    } else {
        game.reviews.forEach(review => {
            let stars = '';
            for(let i=0; i<5; i++) {
                stars += i < review.rating ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
            }
            reviewsHTML += `
                <div class="review">
                    <div class="review-header">
                        <span class="reviewer-name">@${review.user}</span>
                        <span class="stars">${stars}</span>
                    </div>
                    <p class="review-text">"${review.text}"</p>
                </div>
            `;
        });
    }

    modalBody.innerHTML = `
        <img src="${game.image}" alt="${game.title}" class="modal-img">
        <div class="modal-info">
            <h2>${game.title}</h2>
            <p class="modal-desc">${game.description}</p>
            
            <div class="modal-price-box">
                <p style="color: var(--text-muted); font-size: 0.9rem; text-transform: uppercase;">Preço Digital</p>
                <div class="modal-price">${formattedPrice}</div>
            </div>
            
            <button class="btn btn-glow" style="width: 100%; justify-content: center;" onclick="addToCart(event)">
                <i class="fas fa-shopping-cart"></i> Adicionar ao Carrinho
            </button>

            <div class="reviews-section">
                <h3>Avaliações da Comunidade</h3>
                ${reviewsHTML}
            </div>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

closeModalBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
});

modal.addEventListener('click', (e) => {
    if(e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// --- 6. EFEITOS DE ROLAGEM E HEADER ---
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    let reveals = document.querySelectorAll('.reveal');
    for (let i = 0; i < reveals.length; i++) {
        let windowHeight = window.innerHeight;
        let elementTop = reveals[i].getBoundingClientRect().top;
        let elementVisible = 100;

        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add('active');
        }
    }
});

// --- INICIALIZAÇÃO ---
fetchGames();