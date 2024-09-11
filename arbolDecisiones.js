document.addEventListener("DOMContentLoaded", function () {
    const decisionTree = document.getElementById("decisionTree");
    const reiniciarBtn = document.getElementById("reiniciar");
    const agregarPreguntaBtn = document.getElementById("agregarPregunta");
    const retrocederBtn = document.getElementById("retroceder");

    let historial = []; // Historial para retroceder entre preguntas
    let preguntaEnEdicion = null; // Para rastrear qué pregunta estamos editando

    // Árbol de decisiones con preguntas predeterminadas
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
                { respuesta: "Sí", siguiente: "Parece una gripe común" },
                { respuesta: "No", siguiente: 3 }
            ]
        },
        {
            pregunta: "¿Te duele el estómago?",
            opciones: [
                { respuesta: "Sí", siguiente: "Podría ser una indigestión" },
                { respuesta: "No", siguiente: "Consulta a un médico si persisten los síntomas" }
            ]
        },
        {
            pregunta: "¿Tienes tos?",
            opciones: [
                { respuesta: "Sí", siguiente: "Podría ser un resfriado" },
                { respuesta: "No", siguiente: "No parece ser un resfriado" }
            ]
        }
    ];

    let posicionActual = 0;

    // Función para mostrar las preguntas
    function mostrarPregunta(index) {
        decisionTree.innerHTML = "";
        const preguntaActual = preguntas[index];

        const preguntaElem = document.createElement("h3");
        preguntaElem.textContent = preguntaActual.pregunta;
        decisionTree.appendChild(preguntaElem);

        preguntaActual.opciones.forEach((opcion, i) => {
            const botonRespuesta = document.createElement("button");
            botonRespuesta.classList.add("btn", "btn-primary", "m-2");
            botonRespuesta.textContent = opcion.respuesta;

            botonRespuesta.addEventListener("click", function () {
                if (typeof opcion.siguiente === "string") {
                    historial.push(index); // Guardar la posición antes de ir al nodo final
                    mostrarResultado(opcion.siguiente);
                } else {
                    historial.push(index); // Guardar la posición actual antes de avanzar
                    posicionActual = opcion.siguiente;
                    mostrarPregunta(opcion.siguiente);
                }
            });

            decisionTree.appendChild(botonRespuesta);
        });

        // Botón para editar la pregunta actual
        const botonEditar = document.createElement("button");
        botonEditar.classList.add("btn", "btn-warning", "m-2");
        botonEditar.textContent = "Editar Pregunta";
        botonEditar.addEventListener("click", function () {
            editarPregunta(index);
        });
        decisionTree.appendChild(botonEditar);

        // Botón para eliminar la pregunta actual
        const botonEliminar = document.createElement("button");
        botonEliminar.classList.add("btn", "btn-danger", "m-2");
        botonEliminar.textContent = "Eliminar Pregunta";
        botonEliminar.addEventListener("click", function () {
            eliminarPregunta(index);
        });
        decisionTree.appendChild(botonEliminar);

        // Botón para agregar un nuevo nodo con opciones "Sí" o "No"
        const botonAgregarNodo = document.createElement("button");
        botonAgregarNodo.classList.add("btn", "btn-info", "m-2");
        botonAgregarNodo.textContent = "Agregar Nodo con Sí/No";
        botonAgregarNodo.addEventListener("click", function () {
            agregarNodoIntermedio(index);
        });
        decisionTree.appendChild(botonAgregarNodo);

        // Botón para agregar un nodo final (diagnóstico)
        const botonAgregarNodoFinal = document.createElement("button");
        botonAgregarNodoFinal.classList.add("btn", "btn-success", "m-2");
        botonAgregarNodoFinal.textContent = "Agregar Nodo Final";
        botonAgregarNodoFinal.addEventListener("click", function () {
            agregarNodoFinal(index);
        });
        decisionTree.appendChild(botonAgregarNodoFinal);
    }

    // Función para mostrar el resultado final (nodo final)
    function mostrarResultado(resultado) {
        decisionTree.innerHTML = `<h4>${resultado}</h4>`;
    }

    // Función para editar una pregunta
    function editarPregunta(index) {
        preguntaEnEdicion = index;
        const preguntaActual = preguntas[index];

        document.getElementById("editarPregunta").value = preguntaActual.pregunta;
        document.getElementById("editarRespuesta1").value = preguntaActual.opciones[0].respuesta;
        document.getElementById("editarResultado1").value = preguntaActual.opciones[0].siguiente;
        document.getElementById("editarRespuesta2").value = preguntaActual.opciones[1].respuesta;
        document.getElementById("editarResultado2").value = preguntaActual.opciones[1].siguiente;

        const modalEditarPregunta = new bootstrap.Modal(document.getElementById('modalEditarPregunta'));
        modalEditarPregunta.show();
    }

    // Función para guardar los cambios de la edición
    document.getElementById("formEditarPregunta").addEventListener("submit", function (e) {
        e.preventDefault();

        const nuevaPregunta = document.getElementById("editarPregunta").value;
        const respuesta1 = document.getElementById("editarRespuesta1").value;
        const resultado1 = document.getElementById("editarResultado1").value;
        const respuesta2 = document.getElementById("editarRespuesta2").value;
        const resultado2 = document.getElementById("editarResultado2").value;

        preguntas[preguntaEnEdicion] = {
            pregunta: nuevaPregunta,
            opciones: [
                { respuesta: respuesta1, siguiente: resultado1 },
                { respuesta: respuesta2, siguiente: resultado2 }
            ]
        };

        guardarArbol();

        const modalEditarPregunta = bootstrap.Modal.getInstance(document.getElementById('modalEditarPregunta'));
        modalEditarPregunta.hide();

        mostrarPregunta(preguntaEnEdicion); // Actualizar la visualización
    });

    // Función para eliminar una pregunta
    function eliminarPregunta(index) {
        preguntas.splice(index, 1);
        guardarArbol();
        mostrarPregunta(0);
    }

    // Función para retroceder una pregunta
    retrocederBtn.addEventListener("click", function () {
        if (historial.length > 0) {
            const preguntaAnterior = historial.pop(); // Retrocede a la última pregunta guardada en el historial
            mostrarPregunta(preguntaAnterior);
        } else {
            alert("No hay más preguntas para retroceder.");
        }
    });

    // Función para agregar un nuevo nodo intermedio con opciones "Sí" y "No"
    function agregarNodoIntermedio(index) {
        const nuevaPregunta = prompt("Introduce la nueva pregunta:");
        if (!nuevaPregunta) return;

        // Preguntar si el nodo se debe agregar después de "Sí" o después de "No"
        const opcionElegida = prompt('¿Agregar el nodo después de "Sí" o "No"? (Escribe "Sí" o "No")');
        if (opcionElegida !== "Sí" && opcionElegida !== "No") {
            alert("Por favor escribe 'Sí' o 'No'.");
            return;
        }

        // Crear el nuevo nodo con las opciones Sí y No
        const nuevaEntrada = {
            pregunta: nuevaPregunta,
            opciones: [
                { respuesta: "Sí", siguiente: "Introduce el diagnóstico o pregunta siguiente" },
                { respuesta: "No", siguiente: "Introduce el diagnóstico o pregunta siguiente" }
            ]
        };

        preguntas.push(nuevaEntrada);
        const nuevaPreguntaIndex = preguntas.length - 1;

        // Asociar el nuevo nodo con la respuesta elegida (Sí o No)
        if (opcionElegida === "Sí") {
            preguntas[index].opciones[0].siguiente = nuevaPreguntaIndex;
        } else if (opcionElegida === "No") {
            preguntas[index].opciones[1].siguiente = nuevaPreguntaIndex;
        }

        guardarArbol();
        mostrarPregunta(index);
    }

    // Función para agregar un nodo final a la pregunta actual
    function agregarNodoFinal(index) {
        const resultadoFinal = prompt("Introduce el diagnóstico final:");
        if (!resultadoFinal) return;

        // Preguntar si el nodo final se debe agregar después de "Sí" o después de "No"
        const opcionElegida = prompt('¿Agregar el nodo final después de "Sí" o "No"? (Escribe "Sí" o "No")');
        if (opcionElegida !== "Sí" && opcionElegida !== "No") {
            alert("Por favor escribe 'Sí' o 'No'.");
            return;
        }

        // Asociar el resultado final con la respuesta elegida (Sí o No)
        if (opcionElegida === "Sí") {
            preguntas[index].opciones[0].siguiente = resultadoFinal;
        } else if (opcionElegida === "No") {
            preguntas[index].opciones[1].siguiente = resultadoFinal;
        }

        guardarArbol();
        mostrarPregunta(index);
    }

    // Función para guardar el árbol de decisiones en el localStorage
    function guardarArbol() {
        localStorage.setItem("arbolDecisiones", JSON.stringify(preguntas));
    }

    // Reiniciar el árbol de decisiones
    reiniciarBtn.addEventListener("click", function () {
        historial = [];
        mostrarPregunta(0);
    });

    // Mostrar la primera pregunta al iniciar
    mostrarPregunta(0);
});
