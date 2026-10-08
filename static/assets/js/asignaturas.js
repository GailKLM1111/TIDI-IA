//Creamos una funcion que detecte un click en el botón de ver asignatura
// el cual tiene ID btn-asignatura
// $(document).ready(function(){
//     $('#btn-asignatura').click(function(){
//         //Redireccionamos a la página de CRUDpreguntas.html
//         window.location.href = 'temas';
//     });
// } );


// function crearModalUsuario(tipo) {
//     //Validamos si el modal ya existe
//     if (document.getElementById('divModal')) {
//         //Eliminamos el modal
//         document.getElementById('divModal').remove();
//     }
//
//     //Agregamos el modal al body como innerHTML
//     var modal = `
//             <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="etiquetaModalUsuario" aria-hidden="true">
//                 <div class="modal-dialog">
//                     <div class="modal-content">
//                         <div class="modal-header">
//                             <h1 class="modal-title fs-5" id="etiquetaModalUsuario"
//                                 style="font-family: Cantarell; color: #003366;">
//                                 Nuevo usuario
//                             </h1>
//                             <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
//                         </div>
//                         <form id="form-usuarios" action="/registro-usuarios" method="POST">
//                             <div class="modal-body">
//
//                                 <div class="mb-3">
//                                     <label id="etiquetaNombUsuario" for="vcNombUsuario" class="col-form-label label-crud">
//                                         Nombre del usuario:
//                                     </label>
//                                     <input  type="text"
//                                             class="form-control"
//                                             id="vcNombUsuario"
//                                             name="vcNombUsuario"
//                                             style="font-family: Cantarell; color: #003366;"
//                                             required
//                                     >
//                                 </div>
//
//                                 <div class="mb-3">
//                                     <label id="etiquetaContrasenia" for="vcContrasenia" class="col-form-label label-crud">
//                                         Contraseña:
//                                     </label>
//                                     <input  type="password"
//                                             class="form-control"
//                                             id="vcContrasenia"
//                                             name="vcContrasenia"
//                                             style="font-family: Cantarell; color: #003366;"
//                                             required
//                                     >
//                                 </div>
//                             </div>
//                             <div class="modal-footer">
//                                 <button type="button" class="btn btn-primary btn-gris" data-bs-dismiss="modal">Cerrar</button>
//                                 <button id="btn-guardar-tema"
//                                         type="submit"
//                                         class="btn btn-success"
//                                         style="font-family: Cantarell;">
//                                         <img class="img-footer-patron" src="../static/assets/img/__Agregar%20blanco.svg" />
//                                         Registrar
//                                 </button>
//                                 <button id="btn-guardar-cambios"
//                                         name="iNumTema-editar"
//                                         type="submit"
//                                         hidden="true"
//                                         class="btn btn-primary btn-amarillo" >
//                                         Guardar cambios
//                                 </button>
//                                 <button id="btn-borrar-tema"
//                                         name="iNumTema-borrar"
//                                         type="submit"
//                                         hidden="true"
//                                         style="font-family: Cantarell;"
//                                         class="btn btn-primary btn-danger" >
//                                         Borrar tema
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             </div>
//             `
//
//     var div = document.createElement('div');
//     div.id = 'divModal';
//     div.innerHTML = modal;
//     document.body.insertAdjacentElement('beforeend', div);
//
//     //Obtenemos la etiqueta del modal
//     var etiquetaModalUsuarios = document.getElementById('etiquetaModalUsuario');
//     //Obtenemos el formulario
//     var formtema = document.getElementById('form-tema');
//     //Obtenemos la etiqueta del nombre del tema
//     var etiquetaNombTema = document.getElementById('etiquetaNombTema');
//     // Obtenemos el input del nombre del tema
//     var vcNombTema = document.getElementById('vcNombTema');
//
//     // if (tipo == 1) {
//     //
//     //     //Cambiamos el texto de la etiqueta
//     //     etiquetaModalUsuarios.innerText = 'Nuevo tema';
//     //
//     //     //Cambiamos el action del formulario
//     //     formtema.action = '/agregar_tema';
//     //
//     //     //Cambiamos el texto de la etiqueta
//     //     etiquetaNombTema.innerText = 'Nombre del tema a registrar:';
//     //
//     //     //Le asignamos el placeholder al input
//     //     vcNombTema.placeholder = 'Escribe el nombre del tema';
//     //
//     //     //Obtenemos el boton de guardar tema
//     //     var btnGuardarTema = document.getElementById('btn-guardar-tema');
//     //     //Mostramos el boton
//     //     btnGuardarTema.hidden = false;
//     //
//     // } else {
//     //
//     //     //Cambiamos el texto de la etiqueta
//     //     etiquetaModalUsuarios.innerText = 'Editando tema: ' + nombTema;
//     //
//     //     //Cambiamos el action del formulario
//     //     formtema.action = '/modificar_tema';
//     //
//     //     //Cambiamos el texto de la etiqueta
//     //     etiquetaNombTema.innerText = 'Escriba el nuevo nombre del tema:';
//     //
//     //     //Le asignamos el valor al input
//     //     vcNombTema.value = nombTema;
//     //
//     //     //Le asignamos el placeholder al input
//     //     vcNombTema.placeholder = 'Nombre anterior: ' + nombTema;
//     //
//     //     //Obtenemos el switch
//     //     var switchContenido = document.getElementById('switch-contenido');
//     //     //Cambiamos el valor del switch
//     //     switchContenido.checked = activo;
//     //
//     //     //Obtenemos el boton de guardar cambios
//     //     var btnGuardarCambios = document.getElementById('btn-guardar-cambios');
//     //     //Mostramos el boton
//     //     btnGuardarCambios.hidden = false;
//     //     btnGuardarCambios.value = numTema;
//     //
//     //     //Obtenemos el boton de borrar tema
//     //     var btnBorrarTema = document.getElementById('btn-borrar-tema');
//     //     //Mostramos el boton
//     //     btnBorrarTema.hidden = false;
//     //     btnBorrarTema.value = numTema;
//     //
//     // }
//
//     //Activamos el modal
//     var myModal = new bootstrap.Modal(document.getElementById('exampleModal'), {
//         keyboard: false
//     })
//
//     //Agrega el evento click al boton de borrar parte
//     // $(div).find('.btn-danger').click(function() {
//     //     eliminarParte(parte);
//     // });
//
//     myModal.show()
//
// }