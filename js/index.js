// URLs de la API para las diferentes categorías de naves
const API_URLS = {
    home: "https://swapi.dev/api/starships/",
    rebellion: "https://swapi.dev/api/starships/", // Filtraremos por naves rebeldes
    empire: "https://swapi.dev/api/starships/",    // Filtraremos por naves imperiales
    dice: "https://swapi.dev/api/starships/"       // Mostraremos naves aleatorias
};

// IDs de las naves icónicas que queremos mostrar
const ICONIC_SHIPS = {
    home: [2, 3, 5, 9, 10, 11, 12, 13], // Algunas naves icónicas
    rebellion: [2, 3, 5, 12],           // Millennium Falcon, X-Wing, etc.
    empire: [9, 10, 11, 13],            // Death Star, Star Destroyer, etc.
};

// IDs de naves conocidas (para mostrar en función aleatoria)
const ALL_KNOWN_SHIPS = [2, 3, 5, 9, 10, 11, 12, 13, 15, 17, 21, 22, 23];

// Elemento contenedor para las tarjetas de naves
const shipsContainer = document.getElementById('ships-container');
// Template para las tarjetas de naves
const shipCardTemplate = document.getElementById('ship-card-template');
// Botones del menú
const menuButtons = document.querySelectorAll('.menu-item');

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
    
    // Actualizar los datos de la nave en la tarjeta
    shipCard.querySelector('.ship-name').textContent = shipData.name;
    shipCard.querySelector('.ship-class').textContent = `Clase de la nave: ${shipData.starship_class}`;
    shipCard.querySelector('.ship-cost').textContent = `Creditos de costo: ${shipData.cost_in_credits !== "unknown" ? shipData.cost_in_credits : "Desconocido"}`;
    
    return shipCard;
}

// Función para cargar naves según la categoría seleccionada
async function loadShips(category = 'home') {
    // Limpiar el contenedor de naves
    shipsContainer.innerHTML = '';
    
    // Mostrar un indicador de carga
    const loadingElement = document.createElement('p');
    loadingElement.textContent = 'Cargando naves...';
    shipsContainer.appendChild(loadingElement);
    
    try {
        let shipIds = [];
        
        if (category === 'dice') {
            // Seleccionar naves aleatorias
            shipIds = getRandomShips(4); // Mostrar 4 naves aleatorias
        } else {
            // Obtener las naves correspondientes a la categoría
            shipIds = ICONIC_SHIPS[category] || ICONIC_SHIPS.home;
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
    } catch (error) {
        console.error('Error al cargar las naves:', error);
        loadingElement.textContent = 'Error al cargar las naves. Por favor, intenta de nuevo.';
    }
}

// Función para obtener naves aleatorias
function getRandomShips(count) {
    const shuffled = [...ALL_KNOWN_SHIPS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Función para manejar los clics en los botones del menú
function handleMenuClick(event) {
    const button = event.currentTarget;
    const category = button.dataset.page;
    
    // Actualizar la clase active en los botones
    menuButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    // Cargar las naves de la categoría seleccionada
    loadShips(category);
}

// Agregar event listeners a los botones del menú
menuButtons.forEach(button => {
    button.addEventListener('click', handleMenuClick);
});

// Mostrar las naves iniciales al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    loadShips('home');
});