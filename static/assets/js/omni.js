//Creamos una funcion que detecte un click en el botón de cerrar sesión
// el cual tiene ID btn-cerrar-sesion
$(document).ready(function(){
    $('#btn-cerrar-sesion').click(function(){
        //Redireccionamos a la página de index.html
        window.location.href = '/login';
    });
} );


//Creamos una funcion que detecte un click en el botón de asignaturas
// el cual tiene ID btn-asignaturas
$(document).ready(function(){
    $('#btn-asignaturas').click(function(){
        //Redireccionamos a la página de asignaturas.html
        // window.location.href = 'asignaturas.html';
        window.location.href = '/';
    });
} );
