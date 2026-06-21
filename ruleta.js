document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('ruletaCanvas');
    if (!canvas) return; // Solo ejecutar si estamos en ruleta.html

    const ctx = canvas.getContext('2d');
    const btnGirar = document.getElementById('btnGirar');
    const listaParticipantesHTML = document.getElementById('listaParticipantes');
    const participantsCountHTML = document.getElementById('participantsCount');
    const winnerDisplay = document.getElementById('winnerDisplay');
    const winnerNameHTML = document.getElementById('winnerName');
    const winnersCountValue = document.getElementById('winnersCountValue');

    let participantes = [];
    let ganadores = [];
    let colores = [];
    let giroActual = 0; // Ángulo acumulado en grados
    const MAX_GANADORES = 5;

    // Función para generar colores aleatorios vibrantes
    const generarColorAleatorio = () => {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 80%, 60%)`;
    };

    // Conectar a Firebase
    const ref = database.ref('/participantes');
    
    ref.on('value', (snapshot) => {
        const data = snapshot.val();
        participantes = [];
        
        if (data) {
            Object.keys(data).forEach(key => {
                participantes.push({
                    id: key,
                    ...data[key]
                });
            });
        }
        
        while(colores.length < participantes.length) {
            colores.push(generarColorAleatorio());
        }

        actualizarUI();
    });

    const actualizarUI = () => {
        participantsCountHTML.textContent = `(${participantes.length})`;

        listaParticipantesHTML.innerHTML = '';
        participantes.forEach(p => {
            const li = document.createElement('li');
            li.textContent = p.nombre || "Anónimo";
            if (ganadores.includes(p.id)) {
                li.classList.add('winner-item');
                li.textContent += " ⭐ (Ganador)";
            }
            listaParticipantesHTML.appendChild(li);
        });

        dibujarRuleta();

        const participantesDisponibles = participantes.filter(p => !ganadores.includes(p.id));
        if (participantesDisponibles.length === 0) {
            btnGirar.disabled = true;
            btnGirar.textContent = "Sin participantes";
        } else if (ganadores.length >= MAX_GANADORES) {
            btnGirar.disabled = true;
            btnGirar.textContent = "Sorteo Finalizado";
        } else {
            btnGirar.disabled = false;
            btnGirar.textContent = "¡Girar Ruleta!";
        }
        
        winnersCountValue.textContent = ganadores.length;
    };

    const dibujarRuleta = () => {
        const participantesEnRuleta = participantes.filter(p => !ganadores.includes(p.id));
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (participantesEnRuleta.length === 0) {
            ctx.fillStyle = "#e2e8f0";
            ctx.beginPath();
            ctx.arc(250, 250, 250, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = "#64748b";
            ctx.font = "20px Poppins";
            ctx.textAlign = "center";
            ctx.fillText("Sin participantes", 250, 250);
            return;
        }

        const anglePerSlice = (2 * Math.PI) / participantesEnRuleta.length;
        
        for (let i = 0; i < participantesEnRuleta.length; i++) {
            const startAngle = i * anglePerSlice;
            const endAngle = startAngle + anglePerSlice;
            
            const colorIndex = participantes.findIndex(p => p.id === participantesEnRuleta[i].id);

            ctx.beginPath();
            ctx.moveTo(250, 250);
            ctx.arc(250, 250, 250, startAngle, endAngle);
            ctx.fillStyle = colores[colorIndex];
            ctx.fill();
            ctx.stroke();

            ctx.save();
            ctx.translate(250, 250);
            ctx.rotate(startAngle + anglePerSlice / 2);
            ctx.textAlign = "right";
            ctx.fillStyle = "#fff";
            ctx.font = "bold 18px Poppins";
            ctx.shadowColor = "rgba(0,0,0,0.5)";
            ctx.shadowBlur = 4;
            
            let nombreText = participantesEnRuleta[i].nombre || "Anónimo";
            if (nombreText.length > 15) nombreText = nombreText.substring(0, 15) + '...';
            ctx.fillText(nombreText, 230, 8);
            ctx.restore();
        }
    };

    btnGirar.addEventListener('click', () => {
        const participantesDisponibles = participantes.filter(p => !ganadores.includes(p.id));
        if (participantesDisponibles.length === 0 || ganadores.length >= MAX_GANADORES) return;

        btnGirar.disabled = true;
        winnerDisplay.classList.add('hidden');

        const vueltasExtras = 5 + Math.random() * 5; 
        const gradosExtra = Math.floor(Math.random() * 360);
        const giroTotalGrados = (vueltasExtras * 360) + gradosExtra;
        
        giroActual += giroTotalGrados;
        canvas.style.transform = `rotate(${giroActual}deg)`;

        setTimeout(() => {
            const rotacionFinal = giroActual % 360;
            let anguloGanador = (270 - rotacionFinal + 360) % 360; 
            
            const gradosPorParticipante = 360 / participantesDisponibles.length;
            const indiceGanador = Math.floor(anguloGanador / gradosPorParticipante);
            
            const ganador = participantesDisponibles[indiceGanador];
            
            ganadores.push(ganador.id);
            celebrarGanador(ganador.nombre);
            actualizarUI(); 
            
        }, 5000); 
    });

    const celebrarGanador = (nombre) => {
        winnerNameHTML.textContent = nombre;
        winnerDisplay.classList.remove('hidden');
        
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#27ae60', '#3498db', '#f1c40f', '#e74c3c', '#9b59b6']
        });
    };
});
