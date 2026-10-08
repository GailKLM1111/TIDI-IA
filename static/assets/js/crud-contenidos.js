var colapsado = '';
var partes = [];
var registroCasos = [];
var casoActual = null;
var actividad = {
    iAccion: 0,
    iNumContenido: 0,
    iNumTema: 0,
    vcTitulo: '',
    vcObjetivos: '',
    dFecInicio: '',
    dFecFin: '',
    bActivo: 1,
    iTipo: 1
    // registroCasos: []
}

$(document).ready(function () {
    partes = obtenerPartesDeTabla();
});

//Creamos una funcion que detecte cuando se seleccione un radio
//y que muestre el collapse correspondiente
$(document).ready(function(){
    $('input[type=radio][name=inlineRadioOptions]').change(function(){
        if (this.value == 'cuestionario') {
            $('#collapse-cuestionario').collapse('show');
            $('#collapse-escrito').collapse('hide');
        }
        else if (this.value == 'escrito') {
            $('#collapse-escrito').collapse('show');
            $('#collapse-cuestionario').collapse('hide');
        }
    });
} );

//Creamos una funcion que se ejecute al hacer click en alguno
// de los botones de contenidos y que muestre el collapse correspondiente
function mostrarCollapse(boton){

    if(boton.id == 'btn-actividad'){
        //Validamos si el collapse se esta mostrando
        if (colapsado !== 'actividad'){
            //Si se esta mostrando lo ocultamos
            $('#collapse-actividad').collapse('show');
            colapsado = 'actividad';
        }
        $('#collapse-video').collapse('hide');
        $('#collapse-archivo').collapse('hide');
    } else if (boton.id == 'btn-video'){
        //Validamos si el collapse se esta mostrando
        if (colapsado !== 'video'){
            //Si se esta mostrando lo ocultamos
            $('#collapse-video').collapse('show');
            colapsado = 'video';
        }
        $('#collapse-actividad').collapse('hide');
        $('#collapse-archivo').collapse('hide');
    } else {
        if (colapsado !== 'archivo'){
            //Si se esta mostrando lo ocultamos
            $('#collapse-archivo').collapse('show');
            colapsado = 'archivo';
        }
        $('#collapse-actividad').collapse('hide');
        $('#collapse-video').collapse('hide');
    }
}

//Creamos una funcion que se ejecute al hacer click en el boton de guardar video
// y que obtenga el valor del select con id select-tema y haga submit del formulario
function enviarFormularioContenido(idForm, iAccion){

    console.log("Enviando formulario");
    console.log(idForm)

    //Creamos un imput de tipo text
    var input = document.createElement("input");
    input.type = "text";
    input.name = "bActivo";
    input.style.display = "none";

    var input2 = document.createElement("input");
    input2.type = "text";
    input2.name = "iTipo";
    input2.style.display = "none";

    var input3 = document.createElement("input");
    input3.type = "text";
    input3.name = "iAccion";
    input3.style.display = "none";
    input3.value = iAccion;

    var input4 = document.createElement("input");
    input4.type = "text";
    input4.name = "iNumContenido";
    input4.style.display = "none";
    input4.value = document.getElementById('select-contenido').value;

    //Obtenemos si es formulario de video o archivo
    var formulario = idForm == 'form-video' ? 'video' : 'archivo';

    //Obtenemos el elemento con nombre switch-contenido-video
    var switchContenido = document.getElementsByName('switch-contenido-' + formulario);

    if(switchContenido[0].checked){
        input.value = 'True';
    } else {
        input.value = 'False';
    }

    if(formulario == 'video'){
        input2.value = '2'
    } else {
        input2.value = '3'
    }

    //Creamos un boton de tipo submit
    var boton = document.createElement("button");
    boton.name = "iNumTema";

    //El valor del boton igual al id del tema despues de la cadena "contenido-"
    boton.value = document.getElementById('select-tema').value;

    boton.type = "submit";
    boton.style.display = "none";
    //Agregamos el boton al formulario
    document.getElementById(idForm).appendChild(boton);
    //Agregamos el input al formulario
    document.getElementById(idForm).appendChild(input);
    document.getElementById(idForm).appendChild(input2);
    document.getElementById(idForm).appendChild(input3);
    document.getElementById(idForm).appendChild(input4);
    //Disparamos el evento click del boton
    boton.click();
}

$(document).ready(function() {
    //Obtenemos la tabla de registro de preguntas
    var tabla = $('#table-matriz-cuestionario');

    //Asignamos el evento click cada boton con la clase btn-success dentro de la tabla
    // y que se encuentre en las columnas 2 y 3
    tabla.on('click', '.btn-success', function() {
        if ($(this).closest('td').index() == 0) {
            accionAgregarParte(this)
        } else if ($(this).closest('td').index() == 2) {
            accionAgregar(this)
        } else if ($(this).closest('td').index() == 3) {
            accionAgregar(this)
        }
    });

    //Asignamos el evento click cada boton con la clase btn-danger dentro de la tabla
    tabla.on('click', '.btn-danger', function() {
        if ($(this).closest('td').index() != 1) {
            accionEliminar(this)
        } else {
            accionValidarParte(this)
        }
    });

    //Asignamos el evento click cada boton con la clase btn-danger dentro de la tabla
    tabla.on('click', '.btn-amarillo', function() {
        calcularValor()
    });

});

$(document).ready(function() {
    //Obtenemos la tabla de la matriz de cuestionario
    var tabla = $('#table-registro-preguntas');

    //Asignamos el evento click cada boton con la clase btn-danger dentro de la tabla
    tabla.on('click', '.btn-danger', function() {
        eliminarCaso(this)
    });

    //Asignamos el evento click cada boton con la clase btn-danger dentro de la tabla
    tabla.on('click', '.btn-amarillo', function() {
        editarCaso(this)
    });

});

//Funcion que le añade el evento click al boton de guardar caso y matriz de respuestas
$(document).ready(function () {
    $('#btn-guardar-pym').click(function () {
        guardarPreguntaMatriz();
    });

    $('#btn-guardar-cuestionario').click(function () {

    });

});

//Funcion que detecta si el option del select con id select-contenido
// tiene valor diferente a 0
$(document).ready(function () {

    //Obtenemos el select con id select-contenido
    var iNumContenido = $('#select-contenido');
    var iNumTema = $('#select-tema');

    if (iNumContenido.val() != 0) {
        obtenerCasos(iNumContenido.val());
        obtenerInfoGeneralContenido(iNumContenido.val());
    } else {
        limpiarInfoGeneral();
        limpiarRegistroCasos();
    }

    //Asignamos el evento change al select
    iNumContenido.change(function () {
        if (iNumContenido.val() != 0) {
            obtenerInfoGeneralContenido(iNumContenido.val());
            obtenerCasos(iNumContenido.val());
        } else {
            limpiarInfoGeneral();
            limpiarRegistroCasos();
        }
    });

    iNumTema.change(function () {
        obtenerContenidos(iNumTema.val());
        limpiarInfoGeneral();
        limpiarRegistroCasos();
    });

});

// Función para recorrer la tabla y encontrar los patrones y partes
function obtenerPartesDeTabla() {
    const table = document.getElementById('table-matriz-cuestionario');
    const filas = table.getElementsByTagName('tr');
    const partes = [];

    let parteActual = null;
    let indiceFilaInicio = null;
    let inputsPatron = 0;
    let inputsVariante = 0;

    for (let i = 1; i < filas.length; i++) { // Empezamos desde 1 para omitir la cabecera
        const celdas = filas[i].getElementsByTagName('td');
        if (celdas.length === 0) continue; // Saltar filas sin celdas (como las de botones)

        const parte = celdas[0].innerText.trim();
        const patron = celdas[2].getElementsByTagName('input')[0]
        const variante = celdas[3].getElementsByTagName('input')[0]

        if (parte !== '' && parte !== 'Parte') {
            if (parteActual !== null) {
                // Guardar la parte anterior antes de iniciar una nueva
                partes.push({
                    numParte: parteActual,
                    filaInicio: indiceFilaInicio,
                    filaFin: i - 2,
                    numeroInputsPatron: inputsPatron,
                    numeroInputsVariante: inputsVariante
                });

            }

            // Iniciar una nueva parte
            parteActual = parte;
            indiceFilaInicio = i;
            inputsPatron = patron ? 1 : 0;
            inputsVariante = variante ? 1 : 0;
        } else if (parteActual !== null) {
            // Continuar con la parte actual
            inputsPatron += patron ? 1 : 0;
            inputsVariante += variante ? 1 : 0;
        }

        if (i === filas.length - 1 && parteActual !== null) {
            // Guardar la última parte al finalizar el bucle
            partes.push({
                numParte: parteActual,
                filaInicio: indiceFilaInicio,
                filaFin: i - 1,
                numeroInputsPatron: inputsPatron,
                numeroInputsVariante: inputsVariante
            });
        }
    }

    console.log(partes);
    return partes
}

function accionAgregarParte (){

    //Creamos un footer de parte
    var footer = crearFooterParteMatriz();
    var nuevaParte = crearFilaParteMatriz();

    //Obtenemos la tabla
    var tabla = $('#table-matriz-cuestionario');

    //Agregar el footer en la penultima fila de la tabla
    $(tabla).find('tbody tr:last').before(footer);

    //Agregamos la fila nueva del patron
    $(tabla).find('tbody tr:last').before(nuevaParte);

    //Actualizamos el numero de patrones
    partes = obtenerPartesDeTabla();

}

function accionAgregar (boton){
    //Obtenemos la fila actual
    var fila = $(boton).closest('tr');
    var parte = null;

    //Verificamos a que patron pertenece el boton
    // validando si la fila del boton esta entre patrones

    //Obtenemos el indice de la fila del boton
    var indiceBoton = fila.index() + 1;

    //Recorremos el array de partes
    for(var i = 0; i < partes.length; i++){

        if(i == partes.length - 1){
            //Si es la ultima parte
            parte = partes[i];
            break;
        }

        //Verificamos si la fila del boton esta entre la fila de inicio y la fila de fin de la parte
        if(indiceBoton > partes[i].filaInicio && indiceBoton < partes[i + 1].filaInicio){
            parte = partes[i];
            break;
        }

    }

    //Validamos si el boton es de patron o variante con base en el texto del boton
    if($(boton).text().includes('patrón')){
        //Validamos si el numero de patrones es menor al numero de variantes
        if(parte.numeroInputsPatron < parte.numeroInputsVariante){
            //Creamos el nuevo input de patron
            var input = crearInputMatriz('patron');

            //Agregamos el input de patron a la fila y columna correspondiente
            // tomando como coordenada y la fila donde inicio la parte mas el numero de variantes
            // y como coordenada x la columna 2

            //Obtenemos la tabla
            var tabla = fila.closest('table');
            //Obtenemos la fila donde se agregara el nuevo patron
            var filaPatron = parte.filaInicio + parte.numeroInputsPatron;
            //Obtenemos la columna donde se agregara el nuevo patron
            var columnaPatron = 2;
            //Agregamos el input de patron a la tabla
            $(tabla).find('tr:eq(' + filaPatron + ') td:eq(' + columnaPatron + ')').append(input);

            //Actualizamos el numero de patrones
            partes = obtenerPartesDeTabla();

        } else {
            //Creamos una nueva fila para agregar el nuevo patron
            var filaNuevaPatron = crearFilaMatriz(parte.numParte, 'patron');

            //Agregamos la fila de patron a la tabla la cual siempre se localizara
            // una fila antes de la fila actual
            fila.before(filaNuevaPatron);

            //Actualizamos el numero de patrones
            partes = obtenerPartesDeTabla();

        }

    } else {
        //Validamos si el numero de variantes es menor al numero de patrones
        if (parte.numeroInputsVariante < parte.numeroInputsPatron) {
            //Creamos el nuevo input de variante
            var input = crearInputMatriz('variante');

            //Agregamos el input de variante a la fila y columna correspondiente
            // tomando como coordenada y la fila donde inicio la parte mas el numero de patrones
            // y como coordenada x la columna 3

            //Obtenemos la tabla
            var tabla = fila.closest('table');
            //Obtenemos la fila donde se agregara el nuevo patron
            var filaVariante = parte.filaInicio + parte.numeroInputsVariante
            //Obtenemos la columna donde se agregara el nuevo patron
            var columnaVariante = 3;
            //Agregamos el input de patron a la tabla
            $(tabla).find('tr:eq(' + filaVariante + ') td:eq(' + columnaVariante + ')').append(input);

            //Actualizamos el numero de patrones
            partes = obtenerPartesDeTabla();

        } else {
            //Creamos una nueva fila para agregar el nuevo patron
            var filaNuevaVariante = crearFilaMatriz(parte.numParte, 'variante');

            //Agregamos la fila de patron a la tabla la cual siempre se localizara
            // una fila antes de la fila actual
            fila.before(filaNuevaVariante);

            //Actualizamos el numero de patrones
            partes = obtenerPartesDeTabla();
        }
    }

}

function accionValidarParte (boton){
    //Validamos si solo hay una parte en la tabla
    if(partes.length == 1){
        //Creamos una alerta para indicar que no se puede eliminar la parte
        alert('No se puede eliminar la parte, debe haber al menos una parte');
        return
    }

    //Obtenemos la fila y columna del boton
    var div = $(boton).closest('div');
    var filaBoton = $(div).closest('tr');

    var parte = null;
    var vacio = true;

    //Verificamos a que parte pertenece el boton
    // validando si la fila del boton esta entre
    // el inicio y fin de la parte

    //Obtenemos el indice de la fila del boton
    var indiceBoton = filaBoton.index() + 1;

    //Recorremos el array de partes
    for(var i = 0; i < partes.length; i++){
        //Verificamos si la fila del boton esta entre la fila de inicio y la fila de fin de la parte
        if(indiceBoton >= partes[i].filaInicio && indiceBoton <= partes[i].filaFin){
            parte = partes[i];
            break;
        }
    }

    //Verificamos si los inputos dentro de la parte tienen contenido
    // recorriendo las filas de la parte
    for (var i = parte.filaInicio; i <= parte.filaFin; i++) {
        //Obtenemos la fila
        var fila = $(filaBoton).closest('table').find('tr:eq(' + i + ')');
        //Obtenemos todos los inputs dentro de la fila
        var inputs = fila.find('input');

        //Recorremos los inputs
        for (var j = 0; j < inputs.length; j++) {
            //Validamos si el input tiene contenido
            if ($(inputs[j]).val() != '') {
                //Termianmos el ciclo
                vacio = false
                break;
            }
        }

        if (!vacio) {
            break;
        }

    }

    //Validamos si la parte tiene contenido
    if (!vacio) {
        //Creamos el modal de confirmacion
        crearModalParte(parte);
        return
    }

    //Eliminamos la parte
    eliminarParte(parte);

}

function eliminarParte(parte) {
    //Obtenemos la tabla
    var tabla = $('#table-matriz-cuestionario');

    //Recorremos la tabla para eliminar las filas de la parte
    for (var i = parte.filaInicio; i <= parte.filaFin; i++) {
        //Eliminamos la fila
        $(tabla).find('tr:eq(' + parte.filaInicio + ')').remove();
    }

    //Validamos si la parte a borrar es la ultima
    if (parte.numParte == partes[partes.length - 1].numParte) {
        //Eliminamos el footer de la parte anterior
        $(tabla).find('tr:eq(' + (parte.filaInicio-1) + ')').remove();
    } else {
        //Eliminamos el footer de la parte
        $(tabla).find('tr:eq(' + parte.filaInicio + ')').remove();
    }

    //Actualizamos la variable partes
    partes = obtenerPartesDeTabla();

    //Actualizamos el numero de parte en la tabla
    // el cual se encuentra en la columna 1 y en la fila de inicio de cada parte
    for (var i = 0; i < partes.length; i++) {
        $(tabla).find('tr:eq(' + partes[i].filaInicio + ') td:eq(0)').text(i+1);
    }

    //Actualizamos la variable partes
    partes = obtenerPartesDeTabla();

}

function accionEliminar(boton){
    //Obtenemos la fila y columna del boton
    var div = $(boton).closest('div');
    var filaBoton = $(div).closest('tr');
    var columna = $(div).closest('td');
    var parte = null;

    //Verificamos a que parte pertenece el boton
    // validando si la fila del boton esta entre
    // el inicio y fin de la parte

    //Obtenemos el indice de la fila del boton
    var indiceBoton = filaBoton.index() + 1;

    //Recorremos el array de partes
    for(var i = 0; i < partes.length; i++){

        //Verificamos si la fila del boton esta entre la fila de inicio y la fila de fin de la parte
        if(indiceBoton >= partes[i].filaInicio && indiceBoton <= partes[i].filaFin){
            parte = partes[i];
            break;
        }

    }

    // Validamos si es el ultimo input de patron o variante
    if (parte.numeroInputsPatron == 1 && columna.index() == 2) {
        //Creamos una alerta para indicar que no se puede eliminar el patron
        alert('No se puede eliminar el patrón, debe haber al menos un patrón por parte');
        return
    } else if (parte.numeroInputsVariante == 1 && columna.index() == 3) {
        //Creamos una alerta para indicar que no se puede eliminar la variante
        alert('No se puede eliminar la variante, debe haber al menos una variante por parte');
        return
    }

    //Eliminamos el input de patron
    $(boton).closest('div').remove();

    //Recorremos la tabla para obtener todos los inputs de patron
    // de la parte y ordenarlos de manera correcta en la tabla llenando
    // los espacios vacios
    for (var i = parte.filaInicio; i <= parte.filaFin; i++) {
        //Obtenemos la fila
        var fila = $(filaBoton).closest('table').find('tr:eq(' + i + ')');
        //Obtenemos la columna con la funcion index de la variable columna
        var columnaPatron = fila.find('td:eq(' + columna.index() + ')');
        //Obtenemos los inputs de patron
        var inputsPatron = columnaPatron.find('div')

        var filaVacia
        var columnaVacia
        var vacio

        //Validamos si no se encontro ningun input de patron
        if (inputsPatron.length == 0 && !vacio) {
            //Guardamamos las coordenadas de la celda vacia donde se agregara el patron que este debajo
            filaVacia = fila;
            columnaVacia = columna.index();
            vacio = true;
        } else {

            if (vacio) {
                //Movemos el input de patron a la celda vacia en las coordenadas guardadas
                $(inputsPatron[0]).appendTo($(filaVacia).find('td:eq(' + columnaVacia + ')'));

                //Actualizamos las coordenadas de la celda vacia
                filaVacia = fila;
                columnaVacia = columna.index();

                //Eliminamos el input de patron de la celda original
                columnaPatron.empty();
            }

        }

    }

    //Validamos si el numero de patrones es mayor al numero de variantes
    if (parte.numeroInputsPatron > parte.numeroInputsVariante && columna.index() == 2) {
        //Borramos la fila final de la parte
        $(filaBoton).closest('table').find('tr:eq(' + parte.filaFin + ')').remove();
    } else if (parte.numeroInputsVariante > parte.numeroInputsPatron && columna.index() == 3) {
        //Borramos la fila final de la parte
        $(filaBoton).closest('table').find('tr:eq(' + parte.filaFin + ')').remove();
    }

    //Actualizamos la variable partes
    partes = obtenerPartesDeTabla();

}

function crearInputMatriz(tipo){
    //Creamos un input de patron con base en el siguiente HTML
    // <div class="input-group text-b">
    //  <input type="text" class="form-control form-crud text-b" placeholder="El pizarrón es de color">
    //  <button class="btn btn-danger d-xxl-flex justify-content-xxl-center align-items-xxl-center" type="button" style="padding: 6px;" >
    //      <img src="assets/img/__Eliminar%20blanco.svg" style="width: 20px;">
    //  </button>
    // </div>

    //Creamos el div contenedor
    var div = document.createElement('div');
    div.classList.add('input-group', 'text-b');

    //Creamos el input
    var input = document.createElement('input');
    input.type = 'text';
    input.classList.add('form-control', 'form-crud', 'text-b');

    //Validamos si el input es de patron o variante
    input.placeholder = tipo == 'patron' ? 'Ingrese el patrón de respuesta' : 'Ingrese la variante';

    //Creamos el boton de eliminar
    var boton = document.createElement('button');
    boton.classList.add('btn', 'btn-danger', 'd-xxl-flex', 'justify-content-xxl-center', 'align-items-xxl-center');
    boton.type = 'button';
    boton.style.padding = '6px';
    // boton.onclick = function() {
    //     accionEliminar(this);
    // }

    //Creamos el icono del boton
    var icono = document.createElement('img');
    icono.src = '../static/assets/img/__Eliminar%20blanco.svg';
    icono.style.width = '20px';

    //Agregamos el icono al boton
    boton.appendChild(icono);

    //Agregamos el input y el boton al div contenedor
    div.appendChild(input);
    div.appendChild(boton);

    return div;

}

function crearFilaMatriz(numParte, tipo) {
    //Creamos una fila de patron con base en el siguiente HTML
    // <tr>
    //     <td class="th-body-non"></td>
    //     <td class="th-body-non"></td>
    //     <td class="th-body-non">
    //         <div class="input-group text-b"><input type="text" class="form-control form-crud" placeholder="El color del pizarrón es"><button class="btn btn-danger d-xxl-flex justify-content-xxl-center align-items-xxl-center" type="button" style="padding: 6px;"><img src="assets/img/__Eliminar%20blanco.svg" style="width: 20px;"></button></div>
    //     </td>
    //     <td class="th-body-non"></td>
    // </tr>

    //Validamos si la parte es non o par
    var clase = numParte % 2 == 0 ? 'th-body-par' : 'th-body-non';

    //Creamos la fila
    var fila = document.createElement('tr');

    //Creamos la celda 1
    var celda1 = document.createElement('td');
    celda1.classList.add(clase);

    //Creamos la celda 2
    var celda2 = document.createElement('td');
    celda2.classList.add(clase);

    //Creamos la celda 3
    var celda3 = document.createElement('td');
    celda3.classList.add(clase);

    //Creamos la celda 4
    var celda4 = document.createElement('td');
    celda4.classList.add(clase);

    //Creamos el input de patron con la funcion crearInputPatron
    var inputPatron = crearInputMatriz(tipo);

    //Agregamos el input a donde corresponde
    if (tipo == 'patron') {
        celda3.appendChild(inputPatron);
    } else {
        celda4.appendChild(inputPatron);
    }

    //Agregamos las celdas a la fila
    fila.appendChild(celda1);
    fila.appendChild(celda2);
    fila.appendChild(celda3);
    fila.appendChild(celda4);

    return fila;

}

function crearFilaParteMatriz(){
    //Creamos una fila de parte con base en el siguiente HTML
    // <tr>
    //     <td class="th-body-non">1</td>
    //     <td class="text-b th-body-non">
    //         <div class="input-group text-b"><input type="text" class="form-control form-crud text-b" placeholder="80"><span class="input-group-text text-b">%</span><button class="btn btn-danger d-xxl-flex justify-content-xxl-center align-items-xxl-center" type="button" style="padding: 6px;"><img src="assets/img/__Eliminar%20blanco.svg" style="width: 20px;"></button></div>
    //     </td>
    //     <td class="text-b th-body-non">
    //         <div class="input-group text-b"><input type="text" class="form-control form-crud text-b" placeholder="El pizarrón es de color"><button class="btn btn-danger d-xxl-flex justify-content-xxl-center align-items-xxl-center" type="button" style="padding: 6px;" ><img src="assets/img/__Eliminar%20blanco.svg" style="width: 20px;"></button></div>
    //     </td>
    //     <td class="text-b th-body-non">
    //         <div class="input-group text-b"><input type="text" class="form-control form-crud text-b" placeholder="Blanco"><button class="btn btn-danger d-xxl-flex justify-content-xxl-center align-items-xxl-center" type="button" style="padding: 6px;" ><img src="assets/img/__Eliminar%20blanco.svg" style="width: 20px;"></button></div>
    //     </td>
    // </tr>

    //Obtenemos la info de las partes
    var parte = partes[partes.length - 1];
    var numParte = parseInt(parte.numParte) + 1;

    //Validamos si la parte es non o par
    var clase = numParte % 2 == 0 ? 'th-body-par' : 'th-body-non';

    //Creamos la fila
    var fila = document.createElement('tr');

    //Creamos la celda 1
    var celda1 = document.createElement('td');
    celda1.classList.add(clase);
    celda1.innerHTML = numParte;

    //Creamos la celda 2
    var celda2 = document.createElement('td');
    celda2.classList.add(clase);

    //El input de la celda 2
    var div = document.createElement('div');
    div.classList.add('input-group', 'text-b');
    var input = document.createElement('input');
    input.type = 'text';
    input.classList.add('form-control', 'form-crud', 'text-b');
    input.placeholder = 'X%';
    var span = document.createElement('span');
    span.classList.add('input-group-text', 'text-b');
    span.innerHTML = '%';
    var boton = document.createElement('button');
    boton.classList.add('btn', 'btn-danger', 'd-xxl-flex', 'justify-content-xxl-center', 'align-items-xxl-center');
    boton.type = 'button';
    boton.style.padding = '6px';
    // boton.onclick = function() {
    //     accionValidarParte(this);
    // }
    var icono = document.createElement('img');
    icono.src = '../static/assets/img/__Eliminar%20blanco.svg';
    icono.style.width = '20px';
    boton.appendChild(icono);
    div.appendChild(input);
    div.appendChild(span);
    div.appendChild(boton);
    celda2.appendChild(div);

    //Creamos la celda 3
    var celda3 = document.createElement('td');
    celda3.classList.add(clase);
    celda3.appendChild(crearInputMatriz('patron'));

    //Creamos la celda 4
    var celda4 = document.createElement('td');
    celda4.classList.add(clase);
    celda4.appendChild(crearInputMatriz('variante'));

    //Armamos la fila
    fila.appendChild(celda1);
    fila.appendChild(celda2);
    fila.appendChild(celda3);
    fila.appendChild(celda4);

    return fila;

}

function crearFooterParteMatriz() {
    //Creamos un footer de parte con base en el siguiente HTML
    // <tr>
    //     <td className="th-head-crud"></td>
    //     <td className="th-head-crud"></td>
    //     <td className="th-head-crud">
    //         <div className="d-xxl-flex justify-content-xxl-center align-items-xxl-center">
    //             <button className="btn btn-success d-xxl-flex align-items-xxl-center" type="button"><img
    //                 className="img-footer-patron" src="assets/img/__Agregar%20blanco.svg"/>Agregar patrón
    //             </button>
    //         </div>
    //     </td>
    //     <td className="th-head-crud">
    //         <div className="d-xxl-flex justify-content-xxl-center align-items-xxl-center">
    //             <button className="btn btn-success d-xxl-flex align-items-xxl-center" type="button"><img
    //                 className="img-footer-patron" src="assets/img/__Agregar%20blanco.svg"/>Agregar variante
    //             </button>
    //         </div>
    //     </td>
    // </tr>

    //Creamos la fila
    var fila = document.createElement('tr');

    //Creamos la celda 1
    var celda1 = document.createElement('td');
    celda1.classList.add('th-head-crud');

    //Creamos la celda 2
    var celda2 = document.createElement('td');
    celda2.classList.add('th-head-crud');

    //Creamos la celda 3
    var celda3 = document.createElement('td');
    celda3.classList.add('th-head-crud');

    //Creamos la celda 4
    var celda4 = document.createElement('td');
    celda4.classList.add('th-head-crud');

    //Creamos el div
    var div = document.createElement('div');
    div.classList.add('d-xxl-flex', 'justify-content-xxl-center', 'align-items-xxl-center');

    //Creamos el icono del boton de agregar patron
    var iconoPatron = document.createElement('img');
    iconoPatron.src = '../static/assets/img/__Agregar%20blanco.svg';
    iconoPatron.classList.add('img-footer-patron');

    //Creamos el boton de agregar patron
    var botonPatron = document.createElement('button');
    botonPatron.classList.add('btn', 'btn-success', 'd-xxl-flex', 'align-items-xxl-center');
    botonPatron.type = 'button';
    botonPatron.innerHTML = iconoPatron.outerHTML + 'Agregar patrón';

    //Agregamos el boton al div
    div.appendChild(botonPatron);
    celda3.appendChild(div.cloneNode(true));

    //Creamos el boton de agregar variante
    var botonVariante = document.createElement('button');
    botonVariante.classList.add('btn', 'btn-success', 'd-xxl-flex', 'align-items-xxl-center');
    botonVariante.type = 'button';
    botonVariante.innerHTML = iconoPatron.outerHTML + 'Agregar variante';

    //Vaciamos el div y agregamos el boton de variante
    div.innerHTML = '';
    div.appendChild(botonVariante);
    celda4.appendChild(div);

    //Armamos la fila
    fila.appendChild(celda1);
    fila.appendChild(celda2);
    fila.appendChild(celda3);
    fila.appendChild(celda4);

    return fila;

}

function crearFilaRegistroPreguntas(caso){
    //Creamos una fila de parte con base en el siguiente HTML
    // <tr>
    //     <td class="th-body-non">2</td>
    //     <td class="th-body-non">Otra caso</td>
    //     <td class="th-body-non">2</td>
    //     <td class="th-body-non">
    //         <div class="d-xxl-flex justify-content-xxl-center align-items-xxl-center container-fluid">
    //             <div class="row">
    //                 <div class="col-auto"><button class="btn btn-danger d-xxl-flex justify-content-xxl-center align-items-xxl-center" type="button" style="padding: 6px;"><img src="assets/img/__Eliminar%20blanco.svg?h=37ef7233372994a8ebfc6b68b98f2644" style="width: 20px;" width="20" height="20">&nbsp;Borrar</button></div>
    //                 <div class="col-auto"><button class="btn d-xxl-flex align-items-xxl-center btn-amarillo" type="button"><img class="img-footer-patron" src="assets/img/__Editar%20blanco.svg?h=a3c3716e4dfd91cfa3ee9f5710eb6c0d">Editar</button></div>
    //             </div>
    //         </div>
    //     </td>
    // </tr>

    //Creamos la fila
    var fila = document.createElement('tr');

    //Creamos la celda 1
    var celda1 = document.createElement('td');
    celda1.classList.add('th-body-non');
    celda1.innerHTML = caso.numCaso;

    //Creamos la celda 2
    var celda2 = document.createElement('td');
    celda2.classList.add('th-body-non');
    celda2.innerHTML = caso.casoText;

    //Creamos la celda 3
    var celda3 = document.createElement('td');
    celda3.classList.add('th-body-non');
    celda3.innerHTML = caso.posibilidades;

    //Creamos la celda 4
    var celda4 = document.createElement('td');
    celda4.classList.add('th-body-non');

    //Creamos el div
    var div = document.createElement('div');
    div.classList.add('d-xxl-flex', 'justify-content-xxl-center', 'align-items-xxl-center', 'container-fluid');

    //Creamos el div row
    var divRow = document.createElement('div');
    divRow.classList.add('row');

    //Creamos el div col-auto 1
    var divCol1 = document.createElement('div');
    divCol1.classList.add('col-auto');

    //Creamos el div col-auto 2
    var divCol2 = document.createElement('div');
    divCol2.classList.add('col-auto');

    //Creamos el boton de borrar
    var botonBorrar = document.createElement('button');
    botonBorrar.classList.add('btn', 'btn-danger', 'd-xxl-flex', 'justify-content-xxl-center', 'align-items-xxl-center');
    botonBorrar.type = 'button';
    botonBorrar.style.padding = '6px';

    //Creamos el boton de editar
    var botonEditar = document.createElement('button');
    botonEditar.classList.add('btn', 'd-xxl-flex', 'align-items-xxl-center', 'btn-amarillo');
    botonEditar.type = 'button';

    //Creamos el icono del boton de borrar
    var iconoBorrar = document.createElement('img');
    iconoBorrar.src = '../static/assets/img/__Eliminar%20blanco.svg';
    iconoBorrar.style.width = '20px';

    //Creamos el icono del boton de editar
    var iconoEditar = document.createElement('img');
    iconoEditar.src = '../static/assets/img/__Editar%20blanco.svg';
    iconoEditar.classList.add('img-footer-patron');

    //Construimos el boton de borrar
    botonBorrar.innerHTML = iconoBorrar.outerHTML + 'Borrar';

    //Construimos el boton de editar
    botonEditar.innerHTML = iconoEditar.outerHTML + 'Editar';

    //Agregamos los botones a los div col-auto
    divCol1.appendChild(botonBorrar);
    divCol2.appendChild(botonEditar);

    //Agregamos los div col-auto al div row
    divRow.appendChild(divCol1);
    divRow.appendChild(divCol2);

    //Agregamos el div row al div
    div.appendChild(divRow);

    //Agregamos el div al td
    celda4.appendChild(div);

    //Construimos la fila
    fila.appendChild(celda1);
    fila.appendChild(celda2);
    fila.appendChild(celda3);
    fila.appendChild(celda4);

    return fila;

}

function crearModalParte(parte) {
    //Validamos si el modal ya existe
    if (document.getElementById('divModal')) {
        //Eliminamos el modal
        document.getElementById('divModal').remove();
    }

    //Agregamos el modal al body como innerHTML
    var modal = `
            <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-5" id="exampleModalLabel">Borrar parte ` + parte.numParte + ` </h1>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            Estas seguro de borrar la parte, si lo haces se perderan los datos previamente ingresados.
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-danger d-xxl-flex justify-content-xxl-center align-items-xxl-center" data-bs-dismiss="modal" >
                                <img src="../static/assets/img/__Eliminar%20blanco.svg" style="margin-right: 3px; width: 20px;">
                                Borrar parte
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            `

    var div = document.createElement('div');
    div.id = 'divModal';
    div.innerHTML = modal;
    document.body.insertAdjacentElement('beforeend', div);

    //Activamos el modal
    var myModal = new bootstrap.Modal(document.getElementById('exampleModal'), {
        keyboard: false
    })

    //Agrega el evento click al boton de borrar parte
    $(div).find('.btn-danger').click(function() {
        eliminarParte(parte);
    });

    myModal.show()

}

function calcularValor(){
    //Obtenemos todos los inputs de valor de la tabla
    // los cuales se encuentran en la columna 2

    //Recorremos la tabla en busca de los inputs de valor
    var tabla = $('#table-matriz-cuestionario');
    var inputs = []
    for(var i = 1; i < tabla.find('tr').length; i++){
        //Obtenemos la fila
        var fila = tabla.find('tr:eq(' + i + ')');
        //Obtenemos la columna de valor
        var columna = fila.find('td:eq(1)');
        //Obtenemos el input de valor
        var input = columna.find('input');

        if (input.length > 0)
            inputs.push(input[0]);

    }

    //Calculamos el valor en funcion del numero de partes
    var valor = 100 / partes.length;

    //Recorremos los inputs para asignar el valor
    for(var i = 0; i < inputs.length; i++){
        $(inputs[i]).val(valor);
    }

}

function guardarPreguntaMatriz() {
    //Obtenemos los valores de la caso y la matriz de respuestas
    var casoText = $('#text-caso').val();
    var matriz = [];
    var posibilidades = 0

    //Recorremos la tabla de la matriz
    var tabla = $('#table-matriz-cuestionario');
    for (var i = 0; i < partes.length; i++) {

        var parte = {
            numParte: 0,
            valor: 0,
            patrones: [],
            variantes: []
        }

        for(var j = partes[i].filaInicio; j <= partes[i].filaFin; j++){
            var fila = tabla.find('tr:eq(' + j + ')');
            var celdaPatron = fila.find('td:eq(2)');
            var celdaVariante = fila.find('td:eq(3)');
            var patron = celdaPatron.find('input').val();
            var variante = celdaVariante.find('input').val();

            if(patron)
                parte.patrones.push(patron);

            if(variante)
                parte.variantes.push(variante);
        }

        parte.numParte = i + 1;
        parte.valor = tabla.find('tr:eq(' + partes[i].filaInicio + ') td:eq(1) input').val();

        posibilidades += partes[i].numeroInputsPatron * partes[i].numeroInputsVariante;

        matriz.push(parte);

    }

    if (!casoActual){
        //Creamos un objeto con los valores
        var caso = {
            numCaso: registroCasos.length + 1,
            casoText: casoText,
            matriz: matriz,
            posibilidades: posibilidades
        };

        //Agregamos el objeto al array de preguntas
        registroCasos.push(caso);

        //Creamos la fila de el caso
        var fila = crearFilaRegistroPreguntas(caso);
        //Agregamos la fila a la tabla
        $('#table-registro-preguntas tbody').append(fila);

    } else {
        //Actualizamos el objeto con los valores
        registroCasos[casoActual - 1].casoText = casoText;
        registroCasos[casoActual - 1].matriz = matriz;
        registroCasos[casoActual - 1].posibilidades = posibilidades;

        llenarRegistro()

    }

    nuevoCaso()

}

function editarCaso(boton){
    //Obtenemos la fila y columna del boton
    var div = $(boton).closest('div');
    var filaBoton = $(div).closest('tr');

    //Obtenemos el indice de la fila del boton
    var indiceBoton = filaBoton.index() + 1;

    //Obtenemos la caso
    var caso = registroCasos[indiceBoton - 1];

    //Llenamos la caso
    llenarCaso(caso);

}

function eliminarCaso(boton){
    //Obtenemos la fila y columna del boton
    var div = $(boton).closest('div');
    var filaBoton = $(div).closest('tr');

    //Obtenemos el indice de la fila del boton
    var indiceBoton = filaBoton.index();


    var esActual = false;
    // Validamos si el caso a borrar es el actual
    if (casoActual == registroCasos[indiceBoton].numCaso) {
        esActual = true;
    }

    //Eliminamos la caso del array
    registroCasos.splice(indiceBoton, 1);

    //Re ordenamos los numCaso
    for(var i = 0; i < registroCasos.length; i++){
        registroCasos[i].numCaso = i + 1;
    }

    if (esActual) {
        // Validamos si hay mas de un caso
        if (registroCasos.length >= 1) {
            //Llenamos la matriz con los valores del caso en la posicion 0
            llenarCaso(registroCasos[0]);
        } else {
            nuevoCaso()
        }
    }

    //Llenamos el registro
    llenarRegistro();

}

function nuevoCaso(){

    casoActual = 0;

    //Limpiamos el input de caso
    $('#text-caso').val('');

    //Limpiamos la matriz
    var tabla = $('#table-matriz-cuestionario');

    while (tabla.find('tr').length > 2) {
        for (var i = 1; i < tabla.find('tr').length - 1; i++) {
            tabla.find('tr:eq(' + i + ')').remove();
        }
    }

    //Limpiamos el array de partes
    partes = []

    //Initializamos el array de partes
    partes.push({
        numParte: 0,
        filaInicio: 1,
        filaFin: 1,
        numeroInputsPatron: 1,
        numeroInputsVariante: 1
    })

    //Agregamos la fila a la tabla
    $('#table-matriz-cuestionario tbody tr:last').before(crearFilaParteMatriz());
    partes = obtenerPartesDeTabla();

}

function limpiarRegistroCasos(){

    partes = [];
    //Initializamos el array de partes
    partes.push({
        numParte: 0,
        filaInicio: 1,
        filaFin: 1,
        numeroInputsPatron: 1,
        numeroInputsVariante: 1
    })
    registroCasos = [];
    casoActual = null;

    //Limpiamos el input de caso
    $('#text-caso').val('');

    //Limpiamos la matriz
    var tabla = $('#table-matriz-cuestionario');

    while (tabla.find('tr').length > 2) {
        for (var i = 1; i < tabla.find('tr').length - 1; i++) {
            tabla.find('tr:eq(' + i + ')').remove();
        }
    }

    //Limpiamos el registro
    var registro = $('#table-registro-preguntas');
    registro.find('tbody').empty();

    //Agregamos la fila a la tabla
    $('#table-matriz-cuestionario tbody tr:last').before(crearFilaParteMatriz());
    partes = obtenerPartesDeTabla();

}

function llenarContenidos(contenidos){

    //Obtenemos el select de contenidos
    var select = document.getElementById('select-contenido');

    //Limpiamos el select
    select.innerHTML = '';

    var optgroup = document.createElement('optgroup');
    optgroup.label = 'Seleccione el contenido que se editará o Nuevo contenido.';

    var option0 = document.createElement('option');
    option0.value = '0';
    option0.innerHTML = 'Nuevo contenido';
    option0.selected = true;
    optgroup.appendChild(option0);

    //Por cada contenido en la lista de contenidos creamos una opcion
    for(var i = 0; i < contenidos.length; i++){
        var contenido = contenidos[i];
        var option = document.createElement('option');
        option.value = contenido.iNumContenido;
        option.innerHTML = contenido.vcTitulo;
        optgroup.appendChild(option);
    }

    select.appendChild(optgroup);

}

function llenarCaso(caso){

    casoActual = caso.numCaso;

    $('#text-caso').val(caso.casoText);

    // Limpiamos la matriz excepto la ultima fila
    var tabla = $('#table-matriz-cuestionario');

    while (tabla.find('tr').length > 2) {
        for (var i = 1; i < tabla.find('tr').length - 1; i++) {
            tabla.find('tr:eq(' + i + ')').remove();
        }
    }

    // Limpiamos el array de partes
    partes = []

    // Initializamos el array de partes
    partes.push({
        numParte: 0,
        filaInicio: 1,
        filaFin: 1,
        numeroInputsPatron: 1,
        numeroInputsVariante: 1
    })

    const matriz = caso.matriz;

    //Recorremos la matriz
    for(var i = 0; i < matriz.length; i++){

        if (i > 0) {
            //Disparamos un evento click en el boton de agregar parte que esta en la ultima fila primer columna
            $('#table-matriz-cuestionario tbody tr:last td:eq(0) button').click();
        } else {
            //Agregamos la fila a la tabla
            $('#table-matriz-cuestionario tbody tr:last').before(crearFilaParteMatriz());
            partes = obtenerPartesDeTabla();
        }

        const patrones = matriz[i].patrones;
        const variantes = matriz[i].variantes;

        //Llenamos el input de valor de la parte
        tabla.find('tr:eq(' + partes[i].filaInicio + ') td:eq(1) input').val(matriz[i].valor);

        //Llenamos el input de patron de la parte
        tabla.find('tr:eq(' + partes[i].filaInicio + ') td:eq(2) input').val(patrones[0]);

        //Llenamos el input de variante de la parte
        tabla.find('tr:eq(' + partes[i].filaInicio + ') td:eq(3) input').val(variantes[0]);

        //Recorremos los patrones
        for(var j = 1; j < patrones.length; j++) {

            //Disparamos un evento click en el boton de agregar patron que esta en la ultima fila
            tabla.find('tr:last td:eq(2) button').click();

            //Llenamos el input de patron de la parte
            tabla.find('tr:eq(' + (partes[i].filaInicio + j) + ') td:eq(2) input').val(patrones[j]);

        }

        //Recorremos las variantes
        for(var j = 1; j < variantes.length; j++) {

            //Disparamos un evento click en el boton de agregar variante que esta en la ultima fila
            tabla.find('tr:last td:eq(3) button').click();

            //Llenamos el input de variante de la parte
            tabla.find('tr:eq(' + (partes[i].filaInicio + j) + ') td:eq(3) input').val(variantes[j]);

        }

    }

}

function llenarRegistro (){

    // Validamos si la tabla tiene filas
    if ($('#table-registro-preguntas tbody').find('tr').length > 0) {
        // Eliminamos las filas de la tabla
        $('#table-registro-preguntas tbody').empty();
    }

    for (var i = 0; i < registroCasos.length; i++) {
        //Agregamos la fila a la tabla
        $('#table-registro-preguntas tbody').append(crearFilaRegistroPreguntas(registroCasos[i]));
    }

}

function llenarInfoGeneral(infoGeneral){

    let iTipo = infoGeneral.iTipo;

    var collapse
    var boton
    if (iTipo == 1) {
        boton = document.getElementById('btn-actividad');
        boton.click()
        collapse = document.getElementById('collapse-actividad');
    } else if (iTipo == 2) {
        boton = document.getElementById('btn-video');
        boton.click()
        collapse = document.getElementById('collapse-video');
    } else {
        boton = document.getElementById('btn-archivo');
        boton.click()
        collapse = document.getElementById('collapse-archivo');
    }

    var textTitulo = collapse.querySelector('#text-titulo');
    var textObjetivos = collapse.querySelector('#text-objetivos');
    var dFecInicio = collapse.querySelector('#dFecInicio');
    var dFecFin = collapse.querySelector('#dFecFin');
    var checkActivo = collapse.querySelector('#switch-contenido');

    var botonGuardar = collapse.querySelector('#btn-guardar');
    var divEditar = collapse.querySelector('#div-editar');

    textTitulo.value = infoGeneral.vcTitulo;
    textObjetivos.value = infoGeneral.vcObjetivos;
    dFecInicio.value = infoGeneral.dFecInicio;
    dFecFin.value = infoGeneral.dFecFin;
    checkActivo.checked = infoGeneral.bActivo;

    var inputArchivo = collapse.querySelector('#input-archivo');
    // Retiramos el atributo required del input de archivo
    if (inputArchivo) {
        inputArchivo.removeAttribute('required');
    }

    botonGuardar.style.setProperty('display', 'none', 'important');
    divEditar.style.display = 'block';

}

function limpiarInfoGeneral(){

    var collapse
    for(var i = 1; i <= 3; i++){
        if (i == 1) {
            collapse = document.getElementById('collapse-actividad');
        } else if (i == 2) {
            collapse = document.getElementById('collapse-video');
        } else {
            collapse = document.getElementById('collapse-archivo');
        }

        var textTitulo = collapse.querySelector('#text-titulo');
        var textObjetivos = collapse.querySelector('#text-objetivos');
        var dFecInicio = collapse.querySelector('#dFecInicio');
        var dFecFin = collapse.querySelector('#dFecFin');
        var checkActivo = collapse.querySelector('#switch-contenido');

        var botonGuardar = collapse.querySelector('#btn-guardar');
        var divEditar = collapse.querySelector('#div-editar');

        textTitulo.value = '';
        textObjetivos.value = '';
        dFecInicio.value = '';
        dFecFin.value = '';
        checkActivo.checked = false;

        // Mostar el boton de guardar
        botonGuardar.style.setProperty('display', 'block', 'important');
        // Ocultar el boton de editar
        divEditar.style.setProperty('display', 'none', 'important');

    }

}

function guardarActividad(){

    actividad.iAccion = 1;

    actividad.iNumTema = $('#select-tema').val();
    actividad.vcTitulo = $('#text-titulo').val();
    actividad.vcObjetivos = $('#text-objetivos').val();
    actividad.dFecInicio = $('#dFecInicio').val();
    actividad.dFecFin = $('#dFecFin').val();
    // Si el checkbox esta seleccionado el valor es true, de lo contrario es false
    var activo = document.getElementsByName('switch-contenido-actividad')
    if(activo[0].checked){
        actividad.bActivo = 'True';
    } else {
        actividad.bActivo = 'False';
    }
    actividad.iTipo = 1;
    actividad.registroCasos = registroCasos;

    console.log(actividad);

    fetch('/crud_contenido', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(actividad)
    })
        .then(response => response.json())
        .then(data => {
            console.log("EXITO");
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });

}

function editarActividad(){

    actividad.iAccion = 2;
    actividad.iNumContenido = $('#select-contenido').val();
    actividad.iNumTema = $('#select-tema').val();
    actividad.vcTitulo = $('#text-titulo').val();
    actividad.vcObjetivos = $('#text-objetivos').val();
    actividad.dFecInicio = $('#dFecInicio').val();
    actividad.dFecFin = $('#dFecFin').val();
    // Si el checkbox esta seleccionado el valor es true, de lo contrario es false
    var bActivo = document.getElementsByName('switch-contenido-actividad')
    if(bActivo[0].checked){
        actividad.bActivo = 'True';
    } else {
        actividad.bActivo = 'False';
    }
    actividad.iTipo = 1;
    actividad.registroCasos = registroCasos;

    console.log(actividad);

    fetch('/crud_contenido', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(actividad)
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });

}

function eliminarActividad(){

    actividad.iAccion = 3;
    actividad.iNumContenido = $('#select-contenido').val();
    actividad.iNumTema = $('#select-tema').val();
    actividad.vcTitulo = $('#text-titulo').val();
    actividad.vcObjetivos = $('#text-objetivos').val();
    actividad.dFecInicio = $('#dFecInicio').val();
    actividad.dFecFin = $('#dFecFin').val();
    // Si el checkbox esta seleccionado el valor es true, de lo contrario es false
    var bActivo = document.getElementsByName('switch-contenido-actividad')
    if(bActivo[0].checked){
        actividad.bActivo = 'True';
    } else {
        actividad.bActivo = 'False';
    }
    actividad.iTipo = 1;
    actividad.registroCasos = registroCasos;

    console.log(actividad);

    fetch('/crud_contenido', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(actividad)
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });

}

function obtenerContenidos(iNumTema){

    fetch('/obtener_contenidos',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({iNumTema: iNumTema})
    })
        .then(response => response.json())
        .then(data => {
            llenarContenidos(data)
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

function obtenerCasos(iNumContenido){

    let iNumTema = $('#select-tema').val();

    fetch('/obtener_casos',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({iNumContenido: iNumContenido, iNumTema: iNumTema})
    })
        .then(response => response.json())
        .then(data => {
            registroCasos = data;
            //Validamos si hay casos
            if (registroCasos) {
                //Llenamos la matriz con los valores del caso en la posicion 0
                llenarCaso(registroCasos[0]);
                llenarRegistro();
            } else {
                nuevoCaso()
            }

        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

function obtenerInfoGeneralContenido(iNumContenido){

    let iNumTema = $('#select-tema').val();

    fetch('/obtener_info_general_contenido',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({iNumContenido: iNumContenido, iNumTema: iNumTema[0]})
    })
        .then(response => response.json())
        .then(data => {
            llenarInfoGeneral(data)
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}