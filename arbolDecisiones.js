document.addEventListener("DOMContentLoaded", function () {
    const decisionTree = document.getElementById("decisionTree");
    const reiniciarBtn = document.getElementById("reiniciar");
    const agregarPreguntaBtn = document.getElementById("agregarPregunta");
    const retrocederBtn = document.getElementById("retroceder");
    const arbolEstructura = document.getElementById("arbolEstructura");

    let historial = [];
    let preguntaEnEdicion = null;

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
        },
        {
            pregunta: "¿Tienes dificultad para respirar?",
            opciones: [
                { respuesta: "Sí", siguiente: "Podría ser un síntoma de asma o COVID-19. Consulta a un médico." },
                { respuesta: "No", siguiente: 4 }
            ]
        },
        {
            pregunta: "¿Tienes dolor en el pecho?",
            opciones: [
                { respuesta: "Sí", siguiente: "Podría ser un síntoma grave. Consulta a un médico de inmediato." },
                { respuesta: "No", siguiente: 5 }
            ]
        },
        {
            pregunta: "¿Tienes fatiga o cansancio excesivo?",
            opciones: [
                { respuesta: "Sí", siguiente: "Podría ser un síntoma de anemia o falta de sueño." },
                { respuesta: "No", siguiente: 6 }
            ]
        },
        {
            pregunta: "¿Tienes náuseas o vómitos?",
            opciones: [
                { respuesta: "Sí", siguiente: "Podría ser un síntoma de intoxicación alimentaria o infección estomacal." },
                { respuesta: "No", siguiente: "Consulta a un médico si los síntomas persisten." }
            ]
        }
    ];

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
                    historial.push(index);
                    mostrarResultado(opcion.siguiente);
                } else {
                    historial.push(index);
                    mostrarPregunta(opcion.siguiente);
                }
            });

            decisionTree.appendChild(botonRespuesta);
        });

        renderizarArbol();
    }

    function mostrarResultado(resultado) {
        decisionTree.innerHTML = `<h4>${resultado}</h4>`;
        renderizarArbol();
    }

    function renderizarArbol() {
        arbolEstructura.innerHTML = "";

        const tabla = document.createElement("table");
        const thead = document.createElement("thead");
        const tbody = document.createElement("tbody");

        thead.innerHTML = `
            <tr>
                <th>Pregunta</th>
                <th>Respuesta 1</th>
                <th>Resultado 1</th>
                <th>Respuesta 2</th>
                <th>Resultado 2</th>
                <th>Acciones</th>
            </tr>
        `;

        preguntas.forEach((pregunta, index) => {
            const fila = document.createElement("tr");

            fila.innerHTML = `
                <td>${pregunta.pregunta}</td>
                <td>${pregunta.opciones[0].respuesta}</td>
                <td>${pregunta.opciones[0].siguiente}</td>
                <td>${pregunta.opciones[1].respuesta}</td>
                <td>${pregunta.opciones[1].siguiente}</td>
            `;

            const botonesDiv = document.createElement("td");

            const botonAgregarNodo = document.createElement("button");
            botonAgregarNodo.classList.add("btn", "btn-info", "m-1");
            botonAgregarNodo.textContent = "Agregar Nodo con Sí/No";
            botonAgregarNodo.addEventListener("click", function () {
                agregarNodoIntermedio(index);
            });

            const botonAgregarNodoFinal = document.createElement("button");
            botonAgregarNodoFinal.classList.add("btn", "btn-success", "m-1");
            botonAgregarNodoFinal.textContent = "Agregar Nodo Final";
            botonAgregarNodoFinal.addEventListener("click", function () {
                agregarNodoFinal(index);
            });

            const botonEliminar = document.createElement("button");
            botonEliminar.classList.add("btn", "btn-danger", "m-1");
            botonEliminar.textContent = "Eliminar Pregunta";
            botonEliminar.addEventListener("click", function () {
                eliminarPregunta(index);
            });

            botonesDiv.appendChild(botonAgregarNodo);
            botonesDiv.appendChild(botonAgregarNodoFinal);
            botonesDiv.appendChild(botonEliminar);

            fila.appendChild(botonesDiv);
            tbody.appendChild(fila);
        });

        tabla.appendChild(thead);
        tabla.appendChild(tbody);
        arbolEstructura.appendChild(tabla);
    }

    mostrarPregunta(0);

    retrocederBtn.addEventListener("click", function () {
        if (historial.length > 0) {
            const preguntaAnterior = historial.pop();
            mostrarPregunta(preguntaAnterior);
        } else {
            alert("No hay más preguntas para retroceder.");
        }
    });

    function agregarNodoIntermedio(index) {
        const nuevaPregunta = prompt("Introduce la nueva pregunta:");
        if (!nuevaPregunta) return;

        const opcionElegida = prompt('¿Agregar el nodo después de "Sí" o "No"? (Escribe "Sí" o "No")');
        if (opcionElegida !== "Sí" && opcionElegida !== "No") {
            alert("Por favor escribe 'Sí' o 'No'.");
            return;
        }

        const nuevaEntrada = {
            pregunta: nuevaPregunta,
            opciones: [
                { respuesta: "Sí", siguiente: "Introduce el diagnóstico o pregunta siguiente" },
                { respuesta: "No", siguiente: "Introduce el diagnóstico o pregunta siguiente" }
            ]
        };

        preguntas.push(nuevaEntrada);
        const nuevaPreguntaIndex = preguntas.length - 1;

        if (opcionElegida === "Sí") {
            preguntas[index].opciones[0].siguiente = nuevaPreguntaIndex;
        } else if (opcionElegida === "No") {
            preguntas[index].opciones[1].siguiente = nuevaPreguntaIndex;
        }

        guardarArbol();
        mostrarPregunta(index);
    }

    function agregarNodoFinal(index) {
        const resultadoFinal = prompt("Introduce el diagnóstico final:");
        if (!resultadoFinal) return;

        const opcionElegida = prompt('¿Agregar el nodo final después de "Sí" o "No"? (Escribe "Sí" o "No")');
        if (opcionElegida !== "Sí" && opcionElegida !== "No") {
            alert("Por favor escribe 'Sí' o 'No'.");
            return;
        }

        if (opcionElegida === "Sí") {
            preguntas[index].opciones[0].siguiente = resultadoFinal;
        } else if (opcionElegida === "No") {
            preguntas[index].opciones[1].siguiente = resultadoFinal;
        }

        guardarArbol();
        mostrarPregunta(index);
    }

    function eliminarPregunta(index) {
        preguntas.splice(index, 1);
        guardarArbol();
        mostrarPregunta(0);
    }

    function guardarArbol() {
        localStorage.setItem("arbolDecisiones", JSON.stringify(preguntas));
    }

    reiniciarBtn.addEventListener("click", function () {
        historial = [];
        mostrarPregunta(0);
    });

    mostrarPregunta(0);
});
