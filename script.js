// Variables globales
let alpha = 0;  // Rotación Z (giro)
let beta = 0;   // Rotación X (inclinación adelante/atrás)
let gamma = 0;  // Rotación Y (inclinación izquierda/derecha)

let leftScene = null;
let rightScene = null;
let statusText = null;
let orientationInfo = null;

// Separación entre ojos (paralaje) en píxeles
const EYE_SEPARATION = 6.4; // Aproximadamente 64mm convertido a píxeles

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    leftScene = document.getElementById('scene-left');
    rightScene = document.getElementById('scene-right');
    statusText = document.getElementById('status-text');
    orientationInfo = document.getElementById('orientation-info');
    
    // Solicitar permiso para orientación en iOS 13+
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        statusText.textContent = 'Toca para activar sensores';
        document.body.addEventListener('click', requestOrientationPermission, { once: true });
    } else {
        // Dispositivos que no requieren permiso
        startOrientationTracking();
    }
});

// Solicitar permiso para orientación (iOS 13+)
function requestOrientationPermission() {
    DeviceOrientationEvent.requestPermission()
        .then(response => {
            if (response === 'granted') {
                startOrientationTracking();
            } else {
                statusText.textContent = 'Permiso denegado';
                orientationInfo.textContent = 'Necesitas permitir el acceso a los sensores';
            }
        })
        .catch(error => {
            statusText.textContent = 'Error al solicitar permiso';
            orientationInfo.textContent = error.message;
        });
}

// Iniciar seguimiento de orientación
function startOrientationTracking() {
    statusText.textContent = 'Sensores activos';
    
    // Escuchar eventos de orientación del dispositivo
    window.addEventListener('deviceorientation', handleOrientation);
    
    // Actualizar información de orientación
    updateOrientationInfo();
}

// Manejar eventos de orientación
function handleOrientation(event) {
    // Normalizar valores
    alpha = event.alpha !== null ? event.alpha : alpha;  // 0-360 (compás)
    beta = event.beta !== null ? event.beta : beta;      // -180 a 180 (inclinación)
    gamma = event.gamma !== null ? event.gamma : gamma;  // -90 a 90 (inclinación lateral)
    
    // Convertir alpha a rotación Y (giro horizontal)
    // En iOS, alpha es el ángulo del compás, necesitamos ajustarlo
    let rotationY = alpha;
    
    // Convertir beta a rotación X (inclinación vertical)
    // Beta: -180 (boca abajo) a 180 (boca arriba)
    // Necesitamos invertirlo para que funcione como cámara
    let rotationX = -beta;
    
    // Convertir gamma a rotación Z (inclinación lateral)
    let rotationZ = gamma;
    
    // Aplicar rotación a la escena izquierda
    if (leftScene) {
        leftScene.style.transform = `
            rotateX(${rotationX}deg) 
            rotateY(${rotationY}deg) 
            rotateZ(${rotationZ}deg)
        `;
    }
    
    // Aplicar rotación a la escena derecha con paralaje
    if (rightScene) {
        // Calcular desplazamiento horizontal basado en la rotación Y
        const parallaxX = Math.sin((rotationY * Math.PI) / 180) * EYE_SEPARATION;
        const parallaxZ = Math.cos((rotationY * Math.PI) / 180) * EYE_SEPARATION;
        
        rightScene.style.transform = `
            rotateX(${rotationX}deg) 
            rotateY(${rotationY}deg) 
            rotateZ(${rotationZ}deg)
            translate3d(${parallaxX}px, 0, ${parallaxZ}px)
        `;
    }
    
    updateOrientationInfo();
}

// Actualizar información de orientación en pantalla
function updateOrientationInfo() {
    if (orientationInfo) {
        orientationInfo.textContent = `α: ${alpha.toFixed(1)}° | β: ${beta.toFixed(1)}° | γ: ${gamma.toFixed(1)}°`;
    }
}

// Manejar errores
window.addEventListener('error', function(e) {
    console.error('Error:', e);
    if (statusText) {
        statusText.textContent = 'Error en la aplicación';
    }
});

// Prevenir zoom con gestos
document.addEventListener('gesturestart', function(e) {
    e.preventDefault();
});

document.addEventListener('gesturechange', function(e) {
    e.preventDefault();
});

document.addEventListener('gestureend', function(e) {
    e.preventDefault();
});

// Prevenir scroll
document.addEventListener('touchmove', function(e) {
    e.preventDefault();
}, { passive: false });

// Función para agregar más pantallas dinámicamente (para uso futuro)
function addFloatingScreen(id, x, y, z, content) {
    const leftEye = document.getElementById('scene-left');
    const rightEye = document.getElementById('scene-right');
    
    if (!leftEye || !rightEye) return;
    
    // Crear pantalla para ojo izquierdo
    const leftScreen = document.createElement('div');
    leftScreen.className = 'screen';
    leftScreen.id = id;
    leftScreen.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;
    leftScreen.innerHTML = `<div class="screen-content">${content}</div>`;
    leftEye.appendChild(leftScreen);
    
    // Crear pantalla para ojo derecho
    const rightScreen = document.createElement('div');
    rightScreen.className = 'screen';
    rightScreen.id = id + '-right';
    rightScreen.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;
    rightScreen.innerHTML = `<div class="screen-content">${content}</div>`;
    rightEye.appendChild(rightScreen);
}

// Exportar función para uso futuro
window.addFloatingScreen = addFloatingScreen;
