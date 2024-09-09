document.addEventListener("DOMContentLoaded", function() {
    const decisionTree = document.getElementById("decisionTree");
    const reiniciarBtn = document.getElementById("reiniciar");
    const agregarPreguntaBtn = document.getElementById("agregarPregunta");
    const preguntaPadreSelect = document.getElementById("preguntaPadre");
    const opcionPadreSelect = document.getElementById("opcionPadre");

    // Cargar el árbol de decisiones desde el localStorage o usar uno por defecto
    let preguntas = JSON.parse(localStorage.getItem("arbolDecisiones")) || [
        {
            pregunta: "¿Tienes fiebre?",
            opciones: [
                { respuesta: "Sí", siguiente: 1 },
                { respuesta: "No", siguiente: 2 }
            ]
        },
        {
            pregunta: "¿Te duele la cabeza?",
            opciones: [
                { respuesta: "Sí", siguiente: "Parece una gripe" },
                { respuesta: "No", siguiente: "Consulta a tu médico" }
            ]
        },
        {
            pregunta: "¿Te duele el estómago?",
            opciones: [
                { respuesta: "Sí", siguiente: "Puede ser indigestión" },
                { respuesta: "No", siguiente: "Podrías estar bien" }
            ]
        }
    ];

    let historial = [];

    // Función para mostrar las preguntas
    function mostrarPregunta(index) {
        decisionTree.innerHTML = "";
        const preguntaActual = preguntas[index];

        // Crear el elemento de pregunta
        const preguntaElem = document.createElement("h3");
        preguntaElem.textContent = preguntaActual.pregunta;
        decisionTree.appendChild(preguntaElem);

        // Crear las opciones de respuesta
        preguntaActual.opciones.forEach(opcion => {
            const botonRespuesta = document.createElement("button");
            botonRespuesta.classList.add("btn", "btn-primary", "m-2");
            botonRespuesta.textContent = opcion.respuesta;

            botonRespuesta.addEventListener("click", function() {
                if (typeof opcion.siguiente === "string") {
                    mostrarResultado(opcion.siguiente);
                } else {
                    historial.push(preguntaActual.pregunta + ": " + opcion.respuesta);
                    mostrarPregunta(opcion.siguiente);
                }
            });

            decisionTree.appendChild(botonRespuesta);
        });
    }

    // Función para mostrar el resultado
    function mostrarResultado(resultado) {
        decisionTree.innerHTML = `<h4>${resultado}</h4>`;
        historial.forEach(entry => {
            const historialItem = document.createElement("p");
            historialItem.textContent = entry;
            decisionTree.appendChild(historialItem);
        });
    }

    // Función para cargar las preguntas en el dropdown para seleccionar "pregunta padre"
    function cargarPreguntasPadre() {
        preguntaPadreSelect.innerHTML = "";
        preguntas.forEach((pregunta, index) => {
            const opcion = document.createElement("option");
            opcion.value = index;
            opcion.textContent = pregunta.pregunta;
            preguntaPadreSelect.appendChild(opcion);
        });
    }

    // Reiniciar el árbol de decisiones
    reiniciarBtn.addEventListener("click", function() {
        historial = [];
        mostrarPregunta(0);
    });

    // Guardar árbol de decisiones en localStorage
    function guardarArbol() {
        localStorage.setItem("arbolDecisiones", JSON.stringify(preguntas));
    }

    // Abrir el modal para agregar una nueva pregunta
    agregarPreguntaBtn.addEventListener("click", function() {
        cargarPreguntasPadre(); // Cargar las preguntas existentes en el dropdown
        const modalAgregarPregunta = new bootstrap.Modal(document.getElementById('modalAgregarPregunta'));
        modalAgregarPregunta.show();
    });

    // Función para agregar una nueva pregunta al árbol
    document.getElementById("formAgregarPregunta").addEventListener("submit", function(e) {
        e.preventDefault();

        const nuevaPregunta = document.getElementById("nuevaPregunta").value;
        const respuesta1 = document.getElementById("respuesta1").value;
        const resultado1 = document.getElementById("resultado1").value;
        const respuesta2 = document.getElementById("respuesta2").value;
        const resultado2 = document.getElementById("resultado2").value;
        const preguntaPadreIndex = parseInt(preguntaPadreSelect.value);
        const opcionPadreIndex = parseInt(opcionPadreSelect.value);

        const nuevaEntrada = {
            pregunta: nuevaPregunta,
            opciones: [
                { respuesta: respuesta1, siguiente: resultado1 },
                { respuesta: respuesta2, siguiente: resultado2 }
            ]
        };

        // Agregar la nueva pregunta al árbol
        preguntas.push(nuevaEntrada);
        const nuevaPreguntaIndex = preguntas.length - 1;

        // Actualizar la pregunta "padre" para que apunte a la nueva pregunta
        preguntas[preguntaPadreIndex].opciones[opcionPadreIndex].siguiente = nuevaPreguntaIndex;

        guardarArbol();

        // Cerrar modal y reiniciar el árbol
        const modalAgregarPregunta = bootstrap.Modal.getInstance(document.getElementById('modalAgregarPregunta'));
        modalAgregarPregunta.hide();

        mostrarPregunta(0);
    });

    // Mostrar la primera pregunta al iniciar
    mostrarPregunta(0);
});
