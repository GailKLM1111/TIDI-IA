
// $(document).ready(function(){
//     location.reload()
// })

// //Creamos una funcion que detecte un click en la columna de video
// // la cual tiene ID col-video
// $(document).ready(function(){
//     $('#col-video').click(function(){
//         //Redireccionamos a la página de video.html
//         window.location.href = 'video';
//     });
// } );
//
//
// //Creamos una funcion que detecte un click en la columna de actividad
// // la cual tiene ID col-actividad
// $(document).ready(function(){
//     $('#col-actividad').click(function(){
//         //Redireccionamos a la página de actividad.html
//         window.location.href = 'actividad';
//     });
// } );
//
//
// //Creamos una funcion que detecte un click en la columna de examen
// // la cual tiene ID col-examen
// $(document).ready(function(){
//     $('#col-examen').click(function(){
//         //Redireccionamos a la página de archivo.html
//         window.location.href = 'examen';
//     });
// } );

//Creamos una funcion que cree un boton invisible dentro de un formulario
// el cual sera de tipo submit y se tiene que detonar la accion de este boton
// esta funcion recibira el id del formulario
function enviarFormulario(idForm){
    //Creamos un boton de tipo submit
    var boton = document.createElement("button");
    boton.name = "iNumContenido";

    //El valor del boton igual al id del tema despues de la cadena "contenido-"
    boton.value = idForm.substring(10);

    boton.type = "submit";
    boton.style.display = "none";
    //Agregamos el boton al formulario
    document.getElementById(idForm).appendChild(boton);
    //Disparamos el evento click del boton
    boton.click();
}