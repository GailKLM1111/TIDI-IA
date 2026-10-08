// $(document).ready(function(){
//         //Creamos el evento click para el botón de iniciar sesión
//         $('button').click(function(){
//             //Creamos las variables para obtener los valores de los campos
//             var email = $('#email').val();
//             var password = $('#password').val();
//             //Validamos si los campos están vacíos
//             if(email === '' || password === ''){
//                 //Mostramos un mensaje de alerta
//                 alert('Por favor, llena todos los campos');
//             }else{
//                 //Validamos si el correo es igual a admin y la contraseña es igual a 1234
//                 if(email === 'profe'){
//                     //Redireccionamos a la página de CRUDpreguntas.html
//                     localStorage.setItem('usuario', "profe");
//                     window.location.href = 'asignaturas.html';
//                 }else{
//                     //Mostramos un mensaje de alerta
//                     // alert('Correo o contraseña incorrectos');
//                     localStorage.setItem('usuario', "alumno");
//                     window.location.href = 'asignaturas.html';
//                 }
//             }
//         });
//     });


// function iniciarSesion(){
//     var email = $('#email').val();
//     var password = $('#password').val();
//     //Validamos si los campos están vacíos
//     if(email === '' || password === ''){
//         //Mostramos un mensaje de alerta
//         alert('Por favor, llena todos los campos');
//     }else{
//         //Validamos si el correo es igual a admin y la contraseña es igual a 1234
//         if(email === 'profe'){
//             //Redireccionamos a la página de CRUDpreguntas.html
//             localStorage.setItem('usuario', "profe");
//             window.location.href = 'asignaturas.html';
//         }else{
//             //Mostramos un mensaje de alerta
//             // alert('Correo o contraseña incorrectos');
//             localStorage.setItem('usuario', "alumno");
//             window.location.href = 'asignaturas.html';
//         }
//     }
// }

//Creamos una funcion que detecte un click en el botón de iniciar sesión
// el cual tiene ID btn-login

// $(document).ready(function(){
//     $('#btn-login').click(function(){
//         //Creamos las variables para obtener los valores de los campos
//         var email = $('#input-email').val();
//         var password = $('#input-contra').val();
//         //Validamos si los campos están vacíos
//         if(email === '' || password === ''){
//             //Mostramos un mensaje de alerta
//             alert('Por favor, llena todos los campos');
//         }else{
//             //Validamos si el correo es igual a admin y la contraseña es igual a 1234
//             if(email === 'profe'){
//                 //Redireccionamos a la página de CRUDpreguntas.html
//                 localStorage.setItem('usuario', "profe");
//                 window.location.href = 'asignaturas';
//             }else{
//                 //Mostramos un mensaje de alerta
//                 // alert('Correo o contraseña incorrectos');
//                 localStorage.setItem('usuario', "alumno");
//                 window.location.href = 'asignaturas';
//             }
//         }
//     });
// } );


// $(document).ready(function(){
//     $('#btn-login').click(function(){
//         //Creamos las variables para obtener los valores de los campos
//         var email = $('#input-email').val();
//         var password = $('#input-contra').val();
//         //Validamos si los campos están vacíos
//         if(email === '' || password === ''){
//             //Mostramos un mensaje de alerta
//             alert('Por favor, llena todos los campos');
//         }else{
//
//             fetch('http://localhost:5000/login', {
//                 credentials: 'include',
//                 method: 'POST',
//                 mode: 'cors',
//                 body: JSON.stringify({ sUsuario: email, vcContrasenia: password }),
//                 headers: { 'Content-Type': 'application/json' }
//             })
//             .then(response => {
//                 if(response.ok){
//                     return response.text()
//                 } else {
//                     throw new Error('Error en la solicitud');
//                 } })
//             .then(data => {
//                 // Maneja la respuesta del servidor aquí
//                 console.log('Success:', data); })
//             .catch(error => {
//                 console.error('Error:', error);
//             });
//         }
//     });
// } );

function crearModalUsuario() {
    //Validamos si el modal ya existe
    if (document.getElementById('divModal')) {
        //Eliminamos el modal
        document.getElementById('divModal').remove();
    }

    //Agregamos el modal al body como innerHTML
    var modal = `
            <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="etiquetaModalUsuario" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-5" id="etiquetaModalUsuario"
                                style="font-family: Cantarell; color: #003366;">
                                Nuevo usuario
                            </h1>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form id="form-usuarios" action="/registro-usuarios" method="POST">
                            <div class="modal-body">
                                
                                <div class="mb-3">
                                    <label id="etiquetaNombUsuario" for="vcNombUsuario" class="col-form-label label-crud">
                                        Nombre del usuario:
                                    </label>
                                    <input  type="text" 
                                            class="form-control" 
                                            id="vcNombUsuario"
                                            name="vcNombUsuario"
                                            style="font-family: Cantarell; color: #003366;"
                                            required
                                    >
                                </div>
                                
                                <div class="mb-3">
                                    <label id="etiquetaContrasenia" for="vcContrasenia" class="col-form-label label-crud">
                                        Contraseña:
                                    </label>
                                    <input  type="password" 
                                            class="form-control" 
                                            id="vcContrasenia"
                                            name="vcContrasenia"
                                            style="font-family: Cantarell; color: #003366;"
                                            required
                                    >
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-primary btn-gris" data-bs-dismiss="modal">Cerrar</button>
                                <button id="btn-guardar-tema"
                                        type="submit" 
                                        class="btn btn-success"
                                        style="font-family: Cantarell;">
                                        <img class="img-footer-patron" src="../static/assets/img/__Agregar%20blanco.svg" />
                                        Registrar
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

    //Activamos el modal
    var myModal = new bootstrap.Modal(document.getElementById('exampleModal'), {
        keyboard: false
    })

    myModal.show()

}