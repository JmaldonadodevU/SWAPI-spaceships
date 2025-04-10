// URLs de la API para las diferentes categorías de naves
const API_URLS = {
    home: "https://swapi.dev/api/starships/",
    rebellion: "https://swapi.dev/api/starships/", // Filtraremos por naves rebeldes
    empire: "https://swapi.dev/api/starships/",    // Filtraremos por naves imperiales
    dice: "https://swapi.dev/api/starships/",      // Mostraremos naves aleatorias
    favorites: "https://swapi.dev/api/starships/"  // Mostraremos naves favoritas
};

// IDs de las naves icónicas que queremos mostrar
const ICONIC_SHIPS = {
    home: [2, 3, 5, 9, 10, 11, 12, 13], // Algunas naves icónicas
    rebellion: [2, 3, 5, 12],           // Millennium Falcon, X-Wing, etc.
    empire: [9, 10, 11, 13],            // Death Star, Star Destroyer, etc.
};

// IDs de naves conocidas (para mostrar en función aleatoria)
const ALL_KNOWN_SHIPS = [2, 3, 5, 9, 10, 11, 12, 13, 15, 17, 21, 22, 23];

// Objeto de mapeo de IDs de naves a descripciones
const SHIP_DESCRIPTIONS = {
    // Mapeo por ID de nave en SWAPI
    "2": "Nave diplomática de Alderaan, utilizada por la Princesa Leia y conocida por su velocidad y escudos.",
    "3": "Destructor Estelar Imperial, nave de guerra principal de la Armada Imperial y símbolo del poder militar del Imperio.",
    "5": "Nave de asalto y desembarco Imperial, utilizada para transportar tropas a la superficie.",
    "9": "Estación espacial del tamaño de una luna con capacidad para destruir planetas enteros.",
    "10": "La nave más rápida de la galaxia, modificada por Han Solo. Hizo el Corredor de Kessel en menos de doce parsecs.",
    "11": "Caza bombardero de la Alianza Rebelde, equipado con potentes torpedos pero más lento que el X-Wing.",
    "12": "Caza estelar principal de la Alianza Rebelde, versátil y equipado con cuatro cañones láser y torpedos de protones.",
    "13": "Caza TIE avanzado utilizado por Darth Vader, con escudos mejorados y mejor armamento que los TIE estándar."
};

// Elemento contenedor para las tarjetas de naves
const shipsContainer = document.getElementById('ships-container');
// Template para las tarjetas de naves
const shipCardTemplate = document.getElementById('ship-card-template');
// Botones del menú
const menuButtons = document.querySelectorAll('.menu .button');
// Páginas
const pages = document.querySelectorAll('.page');

// Variables de estado
let currentPage = 'home';
let currentShipId = null;
let favorites = loadFavorites();

// Función para cargar favoritos desde localStorage
function loadFavorites() {
    const favs = localStorage.getItem('starWarsShipFavorites');
    return favs ? JSON.parse(favs) : [];
}

// Función para guardar favoritos en localStorage
function saveFavorites() {
    localStorage.setItem('starWarsShipFavorites', JSON.stringify(favorites));
}

// Función para navegar entre páginas
function navigateToPage(pageId) {
    // Ocultar todas las páginas
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Mostrar la página seleccionada
    document.getElementById(pageId).classList.add('active');
}

// Función para cargar una nave específica por su ID
async function loadShip(shipId) {
    try {
        const response = await fetch(`https://swapi.dev/api/starships/${shipId}/`);
        
        if (!response.ok) {
            throw new Error(`Error al cargar la nave (${response.status})`);
        }
        
        const shipData = await response.json();
        return shipData;
    } catch (error) {
        console.error(`Error al cargar la nave ${shipId}:`, error);
        return null;
    }
}

// Función para crear una tarjeta de nave
function createShipCard(shipData) {
    const shipCard = document.importNode(shipCardTemplate.content, true);
    
    // Extraer el ID de la nave de la URL
    const shipId = shipData.url.split('/').filter(part => part).pop();
    
    // Establecer el ID de la nave en el atributo data
    const cardElement = shipCard.querySelector('.ship-card');
    cardElement.dataset.shipId = shipId;
    
    // Agregar evento de clic para mostrar detalles
    cardElement.addEventListener('click', () => showShipDetails(shipId));
    
    // Actualizar los datos de la nave en la tarjeta
    shipCard.querySelector('.ship-name').textContent = shipData.name;
    shipCard.querySelector('.ship-class').textContent = `Clase de la nave: ${shipData.starship_class}`;
    shipCard.querySelector('.ship-cost').textContent = `Creditos de costo: ${shipData.cost_in_credits !== "unknown" ? shipData.cost_in_credits : "Desconocido"}`;
    
    return shipCard;
}

// Función para mostrar los detalles de una nave
async function showShipDetails(shipId) {
    currentShipId = shipId;
    
    try {
        // Cargar datos de la nave
        const shipData = await loadShip(shipId);
        
        if (!shipData) {
            throw new Error('No se pudieron cargar los datos de la nave');
        }
        
        // Actualizar los elementos de la página de detalles
        document.getElementById('detail-ship-name').textContent = shipData.name;
        document.getElementById('detail-ship-class').textContent = shipData.starship_class;
        
        // Crear información detallada
        const info = `Fabricante: ${shipData.manufacturer}
Longitud: ${shipData.length} m
Tripulación: ${shipData.crew}
Pasajeros: ${shipData.passengers}
Capacidad de carga: ${shipData.cargo_capacity} kg
Consumibles: ${shipData.consumables}
Velocidad atmosférica máxima: ${shipData.max_atmosphering_speed}
Clasificación del hiperimpulsor: ${shipData.hyperdrive_rating}

${SHIP_DESCRIPTIONS[shipId] || ''}`;
        
        document.getElementById('detail-ship-info').textContent = info;
        document.getElementById('detail-ship-cost').textContent = shipData.cost_in_credits !== "unknown" ? shipData.cost_in_credits : "Desconocido";
        
        // Actualizar estado del botón de favorito
        const favoriteButton = document.getElementById('favorite-button');
        const isFavorite = favorites.includes(Number(shipId));
        
        if (isFavorite) {
            favoriteButton.classList.add('active');
        } else {
            favoriteButton.classList.remove('active');
        }
        
        // Navegar a la página de detalles
        navigateToPage('ship-details');
        
    } catch (error) {
        console.error('Error al mostrar detalles de la nave:', error);
        alert('No se pudieron cargar los detalles de la nave');
    }
}

// Función para obtener naves aleatorias
function getRandomShips(count) {
    const shuffled = [...ALL_KNOWN_SHIPS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Función para cargar naves según la categoría seleccionada
async function loadShips(category = 'home') {
    currentPage = category;
    
    // Actualizar la clase active en los botones
    menuButtons.forEach(btn => {
        if (btn.dataset.page === category) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Limpiar el contenedor de naves
    shipsContainer.innerHTML = '';
    
    // Mostrar un indicador de carga
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loader';
    loadingElement.textContent = 'Cargando naves...';
    shipsContainer.appendChild(loadingElement);
    
    try {
        let shipIds = [];
        
        if (category === 'dice') {
            // Seleccionar naves aleatorias
            shipIds = getRandomShips(4); // Mostrar 4 naves aleatorias
        } else if (category === 'favorites') {
            // Mostrar naves favoritas
            shipIds = favorites;
        } else {
            // Obtener las naves correspondientes a la categoría
            shipIds = ICONIC_SHIPS[category] || ICONIC_SHIPS.home;
        }
        
        // Si no hay favoritos, mostrar mensaje
        if (category === 'favorites' && shipIds.length === 0) {
            loadingElement.textContent = 'No tienes naves favoritas todavía';
            return;
        }
        
        // Cargar cada nave y crear su tarjeta
        const shipPromises = shipIds.map(id => loadShip(id));
        const ships = await Promise.all(shipPromises);
        
        // Eliminar el indicador de carga
        shipsContainer.removeChild(loadingElement);
        
        // Agregar las tarjetas de naves al contenedor
        ships.forEach(shipData => {
            if (shipData) {
                const shipCard = createShipCard(shipData);
                shipsContainer.appendChild(shipCard);
            }
        });
        
        // Navegar a la página principal
        navigateToPage('ships-container');
        
    } catch (error) {
        console.error('Error al cargar las naves:', error);
        loadingElement.textContent = 'Error al cargar las naves. Por favor, intenta de nuevo.';
    }
}

// Función para manejar los clics en los botones del menú
function handleMenuClick(event) {
    const button = event.currentTarget;
    const category = button.dataset.page;
    
    loadShips(category);
}

// Función para alternar favorito
function toggleFavorite() {
    const shipId = Number(currentShipId);
    const isFavorite = favorites.includes(shipId);
    const favoriteButton = document.getElementById('favorite-button');
    
    if (isFavorite) {
        // Eliminar de favoritos
        favorites = favorites.filter(id => id !== shipId);
        favoriteButton.classList.remove('active');
    } else {
        // Agregar a favoritos
        favorites.push(shipId);
        favoriteButton.classList.add('active');
    }
    
    // Guardar favoritos
    saveFavorites();
}

// Configurar event listeners cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Event listeners para el menú
    menuButtons.forEach(button => {
        button.addEventListener('click', handleMenuClick);
    });
    
    // Event listener para botón de volver en detalles
    document.getElementById('back-to-list').addEventListener('click', () => {
        loadShips(currentPage);
    });
    
    // Event listener para botón de favorito
    document.getElementById('favorite-button').addEventListener('click', toggleFavorite);
    
    // Event listener para botón de perfil (login)
    document.getElementById('login-button').addEventListener('click', () => {
        navigateToPage('login-page');
    });
    
    // Event listener para volver desde login
    document.getElementById('back-from-login').addEventListener('click', () => {
        navigateToPage('ships-container');
    });
    
    // Event listener para el formulario de login
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Aquí puedes implementar la lógica de autenticación real
        alert(`Login simulado para: ${username}`);
        
        // Volver a la página principal
        navigateToPage('ships-container');
    });
    
    // Cargar naves iniciales
    loadShips('home');
});