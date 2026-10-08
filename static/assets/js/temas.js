var numTema = 0;
var nombTema = '';
var activo = false;

var numAviso = 0;
var tituloAviso = '';
var cuerpoAviso = '';

// Funcion que convierte las cadenas de texto en enlaces html
$(document).ready(function () {

    // Obtenemos todos los elementos con id cuerpo_aviso
    var elementos = document.getElementsByClassName('cuerpo_aviso');

    // Recorremos los elementos
    for (let i = 0; i < elementos.length; i++){
        // Obtenemos el texto del elemento
        var texto = elementos[i].innerHTML
        // Creamos una expresion regular para buscar los enlaces
        var regex = /\[([^\]]+)\]/g;
        // Reemplazamos los enlaces por enlaces html
        texto = texto.replace(regex, '<a href="$1" target="_blank">$1</a>');
        // Asignamos el texto al elemento
        elementos[i].innerHTML = texto
    }

});

function accionMasOpcionesTema(iNumTema, vcNombTema, bActivo){

    console.log(iNumTema, vcNombTema, bActivo);

    numTema = iNumTema;
    nombTema = vcNombTema;

    console.log(bActivo);
    if (bActivo == 'True') {
        activo = true;
    }

    crearModalTema(2);

}

function accionMasOpcionesAviso(iNumAviso, vcTitulo, vcCuerpo, bActivo){

    numAviso = iNumAviso;
    tituloAviso = vcTitulo;
    cuerpoAviso = vcCuerpo

    console.log(bActivo);
    if (bActivo == 'True') {
        activo = true;
    }

    crearModalAviso(2);

}


function crearModalTema(tipo) {
    //Validamos si el modal ya existe
    if (document.getElementById('divModal')) {
        //Eliminamos el modal
        document.getElementById('divModal').remove();
    }

    //Agregamos el modal al body como innerHTML
    var modal = `
            <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="etiquetaModalTema" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-5" id="etiquetaModalTema"
                                style="font-family: Cantarell; color: #003366;">
                            </h1>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form id="form-tema" action="/agregar_tema" method="POST">
                            <div class="modal-body">
                                
                                    <div class="mb-3">
                                        <label id="etiquetaNombTema" for="vcNombTema" class="col-form-label label-crud"></label>
                                        <input  type="text" 
                                                class="form-control" 
                                                id="vcNombTema"
                                                name="vcNombTema"
                                                style="font-family: Cantarell; color: #003366;"
                                                required
                                        >
                                    </div>
                                    <div class="mb-3">
                                        <div class="form-check form-switch d-xxl-flex align-items-xxl-center" style="padding: 0;">
                                            <label class="form-check-label label-crud" for="bActivo"> Mostrar tema </label>
                                            <input  id="switch-contenido" 
                                                    class="form-check-input" 
                                                    type="checkbox" 
                                                    role="switch"
                                                    name="bActivo"  
                                                    checked
                                            />
                                        </div>
                                    </div>
                                
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-primary btn-gris" data-bs-dismiss="modal">Cerrar</button>
                                <button id="btn-guardar-tema"
                                        type="submit" 
                                        class="btn btn-success"
                                        hidden="true"
                                        style="font-family: Cantarell;">
                                        Guardar tema
                                </button>
                                <button id="btn-guardar-cambios"
                                        name="iNumTema-editar"
                                        type="submit" 
                                        hidden="true"
                                        class="btn btn-primary btn-amarillo" >
                                        Guardar cambios
                                </button>
                                <button id="btn-borrar-tema" 
                                        name="iNumTema-borrar"
                                        type="submit" 
                                        hidden="true"
                                        style="font-family: Cantarell;"
                                        class="btn btn-primary btn-danger" >
                                        Borrar tema
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            `

    var div = document.createElement('div');
    div.id = 'divModal';
    div.innerHTML = modal;
    document.body.insertAdjacentElement('beforeend', div);

    //Obtenemos la etiqueta del modal
    var etiquetaModalTemas = document.getElementById('etiquetaModalTema');
    //Obtenemos el formulario
    var formtema = document.getElementById('form-tema');
    //Obtenemos la etiqueta del nombre del tema
    var etiquetaNombTema = document.getElementById('etiquetaNombTema');
    // Obtenemos el input del nombre del tema
    var vcNombTema = document.getElementById('vcNombTema');

    if (tipo == 1) {

        //Cambiamos el texto de la etiqueta
        etiquetaModalTemas.innerText = 'Nuevo tema';

        //Cambiamos el action del formulario
        formtema.action = '/agregar_tema';

        //Cambiamos el texto de la etiqueta
        etiquetaNombTema.innerText = 'Nombre del tema a registrar:';

        //Le asignamos el placeholder al input
        vcNombTema.placeholder = 'Escribe el nombre del tema';

        //Obtenemos el boton de guardar tema
        var btnGuardarTema = document.getElementById('btn-guardar-tema');
        //Mostramos el boton
        btnGuardarTema.hidden = false;

    } else {

        //Cambiamos el texto de la etiqueta
        etiquetaModalTemas.innerText = 'Editando tema: ' + nombTema;

        //Cambiamos el action del formulario
        formtema.action = '/modificar_tema';

        //Cambiamos el texto de la etiqueta
        etiquetaNombTema.innerText = 'Escriba el nuevo nombre del tema:';

        //Le asignamos el valor al input
        vcNombTema.value = nombTema;

        //Le asignamos el placeholder al input
        vcNombTema.placeholder = 'Nombre anterior: ' + nombTema;

        //Obtenemos el switch
        var switchContenido = document.getElementById('switch-contenido');
        //Cambiamos el valor del switch
        switchContenido.checked = activo;

        //Obtenemos el boton de guardar cambios
        var btnGuardarCambios = document.getElementById('btn-guardar-cambios');
        //Mostramos el boton
        btnGuardarCambios.hidden = false;
        btnGuardarCambios.value = numTema;

        //Obtenemos el boton de borrar tema
        var btnBorrarTema = document.getElementById('btn-borrar-tema');
        //Mostramos el boton
        btnBorrarTema.hidden = false;
        btnBorrarTema.value = numTema;

    }

    //Activamos el modal
    var myModal = new bootstrap.Modal(document.getElementById('exampleModal'), {
        keyboard: false
    })

    //Agrega el evento click al boton de borrar parte
    // $(div).find('.btn-danger').click(function() {
    //     eliminarParte(parte);
    // });

    myModal.show()

}

function crearModalAviso(tipo) {
    //Validamos si el modal ya existe
    if (document.getElementById('divModal')) {
        //Eliminamos el modal
        document.getElementById('divModal').remove();
    }

    //Agregamos el modal al body como innerHTML
    var modal =
        `
        <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="etiquetaModalAviso" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h1 class="modal-title fs-5" id="etiquetaModalAviso"
                            style="font-family: Cantarell; color: #003366;">
                        </h1>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <form id="form-aviso" action="/agregar_tema" method="POST">
                        <div class="modal-body">
                           
                            <div class="mb-3">
                                <label id="etiquetaTitulo" for="vcTitulo" class="col-form-label label-crud"></label>
                                <input  type="text" 
                                        class="form-control" 
                                        id="vcTitulo"
                                        name="vcTitulo"
                                        style="font-family: Cantarell; color: #003366;"
                                        required
                                >
                            </div>
                            
                            <div class="mb-3">
                                <label id="etiquetaCuerpo" for="vcCuerpo" class="col-form-label label-crud"></label>
                                <textarea class="form-control" 
                                          id="vcCuerpo" 
                                          name="vcCuerpo" 
                                          style="font-family: Cantarell; color: #003366;"
                                          required
                                ></textarea>
                                <h6 class="text-muted">
                                    Para crear enlaces en el cuerpo del aviso, encerrar entre corchetes el enlace de la siguiente forma:  
                                </h6>
                                <h6 class="text-muted">
                                    [ https://www.google.com/ ]  
                                </h6>
                            </div>
                            
                            <div class="mb-3">
                                <div class="form-check form-switch d-xxl-flex align-items-xxl-center" style="padding: 0;">
                                    <label class="form-check-label label-crud" for="bActivo"> Mostrar aviso </label>
                                    <input  id="switch-contenido" 
                                            class="form-check-input" 
                                            type="checkbox" 
                                            role="switch"
                                            name="bActivo"  
                                            checked
                                    />
                                </div>
                            </div>
                            
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary btn-gris" data-bs-dismiss="modal">Cerrar</button>
                            <button id="btn-guardar-tema"
                                    type="submit" 
                                    class="btn btn-success"
                                    hidden="true"
                                    style="font-family: Cantarell;">
                                    Guardar aviso
                            </button>
                            <button id="btn-guardar-cambios"
                                    name="iNumAviso-editar"
                                    type="submit" 
                                    hidden="true"
                                    class="btn btn-primary btn-amarillo" >
                                    Guardar cambios
                            </button>
                            <button id="btn-borrar-tema" 
                                    name="iNumAviso-borrar"
                                    type="submit" 
                                    hidden="true"
                                    style="font-family: Cantarell;"
                                    class="btn btn-primary btn-danger" >
                                    Borrar aviso
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        `

    var div = document.createElement('div');
    div.id = 'divModal';
    div.innerHTML = modal;
    document.body.insertAdjacentElement('beforeend', div);

    //Obtenemos la etiqueta del modal
    var etiquetaModalAviso = document.getElementById('etiquetaModalAviso');
    //Obtenemos el formulario
    var formtema = document.getElementById('form-aviso');
    //Obtenemos la etiqueta del nombre del aviso
    var etiquetaTitulo = document.getElementById('etiquetaTitulo');
    //Obtenemos la etiqueta del cuerpo del aviso
    var etiquetaCuerpo = document.getElementById('etiquetaCuerpo');
    // Obtenemos el input del nombre del aviso
    var vcTitulo = document.getElementById('vcTitulo');
    // Obtenemos el textarea del cuerpo del aviso
    var vcCuerpo = document.getElementById('vcCuerpo');

    if (tipo == 1) {

        //Cambiamos el texto de la etiqueta
        etiquetaModalAviso.innerText = 'Nuevo aviso';

        //Cambiamos el action del formulario
        formtema.action = '/agregar_aviso';

        //Cambiamos el texto de la etiqueta
        etiquetaTitulo.innerText = 'Titulo del aviso a registrar:';

        //Cambiamos el texto de la etiqueta
        etiquetaCuerpo.innerText = 'Cuerpo del aviso a registrar:';

        //Le asignamos el placeholder al input
        vcTitulo.placeholder = 'Escribe el titulo del aviso';

        //Le asignamos el placeholder al textarea
        vcCuerpo.placeholder = 'Escribe el cuerpo del aviso';

        //Obtenemos el boton de guardar tema
        var btnGuardarTema = document.getElementById('btn-guardar-tema');
        //Mostramos el boton
        btnGuardarTema.hidden = false;

    } else {

        //Cambiamos el texto de la etiqueta
        etiquetaModalAviso.innerText = 'Editando aviso: ' + tituloAviso;

        //Cambiamos el action del formulario
        formtema.action = '/modificar_aviso';

        //Cambiamos el texto de la etiqueta
        etiquetaTitulo.innerText = 'Escriba el nuevo titulo del aviso:';

        //Cambiamos el texto de la etiqueta
        etiquetaCuerpo.innerText = 'Escriba el nuevo cuerpo del aviso:';

        //Le asignamos el valor al input
        vcTitulo.value = tituloAviso;

        //Le asignamos el placeholder al input
        vcTitulo.placeholder = 'Titulo anterior: ' + tituloAviso;

        //Le asignamos el valor al textarea
        vcCuerpo.value = cuerpoAviso;

        //Le asignamos el placeholder al textarea
        vcCuerpo.placeholder = 'Cuerpo anterior: ' + cuerpoAviso;

        //Obtenemos el switch
        var switchContenido = document.getElementById('switch-contenido');
        //Cambiamos el valor del switch
        switchContenido.checked = activo;

        //Obtenemos el boton de guardar cambios
        var btnGuardarCambios = document.getElementById('btn-guardar-cambios');
        //Mostramos el boton
        btnGuardarCambios.hidden = false;
        btnGuardarCambios.value = numAviso;

        //Obtenemos el boton de borrar tema
        var btnBorrarTema = document.getElementById('btn-borrar-tema');
        //Mostramos el boton
        btnBorrarTema.hidden = false;
        btnBorrarTema.value = numAviso;

    }

    //Activamos el modal
    var myModal = new bootstrap.Modal(document.getElementById('exampleModal'), {
        keyboard: false
    })


    myModal.show()

}


