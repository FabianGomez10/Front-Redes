let tipoConexion;

/**
 * Cuando carga la pagina
 */
$(document).ready(function () {
    $("#nombre").focus();
    llenarSelect();
});

/**
 * Consultar las conexiones
 */
function llenarSelect() {
    $.ajax({
        url: "http://localhost:8080/api/conexiondered/all",
        type: "GET",
        dataType: "json",
        success: function (respuesta) {
            $("#conexionA").empty();
            let opciones = `<option value="">Seleccione una conexion</option>`;
            respuesta.forEach(element => {
                opciones += `
                            <option value="${element.tipo}">${element.nombre}</option>
                            `

            });
            $("#conexionA").append(opciones);
        },
        error: function () {
            alert("Ocurrio un error");
        }
    });
}

/**
 * Al dar click en dispositivos electronicos
 */
$("#delectronico").click(function () {
    consultarTodo();
});

/**
 * Consultar los dispositivos
 */
function consultarTodo() {
    $.ajax({
        url: "http://localhost:8080/api/dispositivoelectronico/all",
        type: "GET",
        dataType: "json",
        success: function (respuesta) {
            $("#pintarTabla").empty();
            if (respuesta.length != 0) {
                pintarRespuesta(respuesta);
            }
        },
        error: function () {
            alert("Ocurrio un error");
        }
    });
}

/**
 * Llenar la tabla de dispositivos
 * @param {*} respuesta 
 */
function pintarRespuesta(respuesta) {
    let myTable = `<table class="table table-info table-striped text-center align-middle">
                            <thead>
                                <tr>
                                <th scope="col">Accion</th>
                                <th scope="col">Tipo</th>
                                <th scope="col">Conectado</th>
                                <th scope="col">IP Asignada</th>
                                <th scope="col">Conexion Actual</th>
                                </tr>
                            </thead>`
    for (i = 0; i < respuesta.length; i++) {
        myTable += `
            <tr>
                <td><button class="btn btn-danger" onclick="borrar('${respuesta[i].mac}')"><i class="bi bi-trash me-1"></i>Borrar</button>
                <button class="btn btn-warning" onclick="editar('${respuesta[i].mac}')"><i class="bi bi-pen me-1"></i>Editar</button></td>
                <td>${respuesta[i].tipo}</td>`
        if (respuesta[i].conectadoActualmente == true) {
            myTable += `<td>Si</td>`
        } else {
            myTable += `<td>No</td>`
        }
        myTable += `
                <td>${respuesta[i].ipAsignada}</td>
                <td>${respuesta[i].conexionActual.tipo}</td>
            </tr>
            `
    }
    myTable += `</table>`
    $("#pintarTabla").append(myTable);
}

/**
 * Borrar un dispositivo
 * @param {*} mac 
 */
function borrar(mac) {
    console.log(mac)
    $.ajax({
        url: `http://localhost:8080/api/dispositivoelectronico/${mac}`,
        type: "DELETE",
        dataType: "json",
        success: function () {
            alert("Se elimino correctamente");
            consultarTodo();
        },
        error: function () {
            alert("Ocurrio un error");
        }
    });
}

/**
 * Llenar los input del formulario de dispositivos
 * @param {*} mac 
 */
function editar(mac) {
    $.ajax({
        url: `http://localhost:8080/api/dispositivoelectronico/${mac}`,
        type: "GET",
        dataType: "json",
        success: function (respuesta) {
            $("#agregarDispositivo").addClass('d-none');
            $("#actualizarDispositivo").removeClass('d-none');
            $("#mac").prop('disabled', true);
            $("#mac").val(respuesta.mac);
            $("#tipo").val(respuesta.tipo);
            if (respuesta.conectadoActualmente == true) {
                $("#si").prop("checked", true);
            } else {
                $("#no").prop("checked", true);
            }
            $("#ipAsignada").val(respuesta.ipAsignada);
            $("#conexionA").val(respuesta.conexionActual.tipo);
        },
        error: function () {
            alert("Ocurrio un error");
        }
    });
}

/**
 * Registrar un dispositivo
 */
$("#enviarDispositivo").submit(function (event) {
    event.preventDefault();
    let id = $("#conexionA").val();
    $.ajax({
        url: `http://localhost:8080/api/dispositivoelectronico/filter/${id}`,
        type: "GET",
        dataType: "json",
        success: function (respuesta) {
            let maximo = 0;
            respuesta.forEach(element => {
                if (element.conexionActual.tipo == $("#conexionA").val()) {
                    maximo ++;
                }
            });
            if (maximo < 3) {
                $.ajax({
                    url: `http://localhost:8080/api/dispositivoelectronico/save`,
                    data: JSON.stringify({
                        mac: $("#mac").val(),
                        tipo: $("#tipo").val(),
                        conectadoActualmente: $('input:radio[name=RadioOp]:checked').val(),
                        ipAsignada: $("#ipAsignada").val(),
                        conexionActual: {
                            tipo: $("#conexionA").val()
                        }
                    }),
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    error: function (xhr) {
                        alert('Ocurrio un error, ' + xhr.status);
                        console.log(xhr);
                    },
                    success: function (respuesta) {
                        if (respuesta == null) {
                            alert("No se pudo registrar porque ya hay un registro con esta mac");
                            $("#mac").focus();
                        } else {
                            alert("Se registro correctamente");
                            $("#mac").val("");
                            $("#tipo").val("");
                            $("#ipAsignada").val("");
                            $("#conexionA").val("");
                            $("#mac").focus();
                            consultarTodo();
                        }
                    }

                });
            } else {
                alert("No se pudo registrar porque ya hay 3 dispositivos conectados a esta red");
            }
        },
        error: function () {
            alert("Ocurrio un error");
        }
    });
});

/**
 * Actualizar un dispositivo
 */
$("#actualizarDispositivo").click(function (event) {
    event.preventDefault();
    let datos = {
        mac: $("#mac").val(),
        tipo: $("#tipo").val(),
        conectadoActualmente: $("input[name='RadioOp']:checked").val(),
        ipAsignada: $("#ipAsignada").val(),
        conexionActual: {
            tipo: $("#conexionA").val()
        }
    }
    $.ajax({
        url: "http://localhost:8080/api/dispositivoelectronico/update",
        data: JSON.stringify(datos),
        type: "PUT",
        contentType: "application/json",
        dataType: "json",
        error: function (xhr) {
            alert('Ocurrio un error, ' + xhr.status);
        },
        success: function () {
            alert("Se actualizo correctamente");
            $("#agregarDispositivo").removeClass("d-none");
            $("#actualizarDispositivo").addClass("d-none");
            $("#mac").prop('disabled', false);
            $("#mac").val("");
            $("#tipo").val("");
            $("#ipAsignada").val("");
            $("#conexionA").val("");
            $("#mac").focus();
            consultarTodo();
        }
    });
});

//================================================================================================================================

/**
 * Al dar click sobre conexiones de red
 */
$("#conexionRed").click(function () {
    consultarConexiones();
});

/**
 * Consultar todas las conexiones
 */
function consultarConexiones() {
    $.ajax({
        url: "http://localhost:8080/api/conexiondered/all",
        type: "GET",
        dataType: "json",
        success: function (respuesta) {
            $("#pintarTablaRed").empty();
            if (respuesta.length != 0) {
                pintarRespuestaConexiones(respuesta);
            }
        },
        error: function () {
            alert("Ocurrio un error");
        }
    });
}

/**
 * Llenar la tabla de conexiones de red
 * @param {*} respuesta 
 */
function pintarRespuestaConexiones(respuesta) {
    let myTable = `<table class="table table-info table-striped text-center align-middle">
                            <thead>
                                <tr>
                                <th scope="col">Accion</th>
                                <th scope="col">Nombre</th>
                                <th scope="col">Tipo de cifrado</th>
                                <th scope="col">Usuario de conexion</th>
                                <th scope="col">Contraseña de conexion</th>
                                </tr>
                            </thead>`
    for (i = 0; i < respuesta.length; i++) {
        myTable += `
            <tr>
                <td><button class="btn btn-danger" onclick="borrarConexion(${respuesta[i].tipo})"><i class="bi bi-trash me-1"></i>Borrar</button>
                <button class="btn btn-warning" onclick="editarConexion(${respuesta[i].tipo})"><i class="bi bi-pen me-1"></i>Editar</button></td>
                <td>${respuesta[i].nombre}</td>
                <td>${respuesta[i].tipoDeCifrado}</td>
                <td>${respuesta[i].usuarioConexión}</td>
                <td>${respuesta[i].contraseñaDeConexión}</td>
            </tr>
            `
    }
    myTable += `</table>`
    $("#pintarTablaRed").append(myTable);
}

/**
 * Borrar una conexion
 * @param {*} mac 
 */
function borrarConexion(tipo) {
    $.ajax({
        url: `http://localhost:8080/api/conexiondered/${tipo}`,
        type: "DELETE",
        dataType: "json",
        success: function () {
            alert("Se elimino correctamente");
            consultarConexiones();
            llenarSelect();
        },
        error: function () {
            alert("Elimine los dispositivos asociados a esta conexion");
        }
    });
}

/**
 * Registrar una conexion
 */
$("#enviarConexion").submit(function (event) {
    event.preventDefault();
    $.ajax({
        url: `http://localhost:8080/api/conexiondered/save`,
        data: JSON.stringify({
            nombre: $("#nombre").val(),
            tipoDeCifrado: $("#tipoDeCifrado").val(),
            usuarioConexión: $("#usuarioConexión").val(),
            contraseñaDeConexión: $("#contraseñaDeConexión").val()
        }),
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        error: function (xhr) {
            alert('Ocurrio un error, ' + xhr.status);
        },
        success: function (respuesta) {
            alert("Se registro correctamente");
            $("#nombre").val("");
            $("#tipoDeCifrado").val("");
            $("#usuarioConexión").val("");
            $("#contraseñaDeConexión").val("");
            $("#nombre").focus();
            consultarConexiones();
            llenarSelect();
        }
    });
});

/**
 * Llenar los input del formulario de conexion
 * @param {*} tipo 
 */
function editarConexion(tipo){
    tipoConexion = tipo;
    $.ajax({
        url: `http://localhost:8080/api/conexiondered/${tipo}`,
        type: "GET",
        dataType: "json",
        success: function (respuesta) {
            $("#agregarConexion").addClass('d-none');
            $("#actualizarConexion").removeClass('d-none');
            $("#nombre").val(respuesta.nombre);
            $("#tipoDeCifrado").val(respuesta.tipoDeCifrado);
            $("#usuarioConexión").val(respuesta.usuarioConexión);
            $("#contraseñaDeConexión").val(respuesta.contraseñaDeConexión);
        },
        error: function () {
            alert("Ocurrio un error");
        }
    });
}

/**
 * Actualizar una conexion
 */
$("#actualizarConexion").click(function (event) {
    event.preventDefault();
    let datos = {
        tipo: tipoConexion,
        nombre: $("#nombre").val(),
        tipoDeCifrado: $("#tipoDeCifrado").val(),
        usuarioConexión: $("#usuarioConexión").val(),
        contraseñaDeConexión: $("#contraseñaDeConexión").val()
    }
    $.ajax({
        url: "http://localhost:8080/api/conexiondered/update",
        data: JSON.stringify(datos),
        type: "PUT",
        contentType: "application/json",
        dataType: "json",
        error: function (xhr) {
            alert('Ocurrio un error, ' + xhr.status);
        },
        success: function () {
            alert("Se actualizo correctamente");
            $("#agregarConexion").removeClass("d-none");
            $("#actualizarConexion").addClass("d-none");
            $("#nombre").val("");
            $("#tipoDeCifrado").val("");
            $("#usuarioConexión").val("");
            $("#contraseñaDeConexión").val("");
            $("#nombre").focus();
            consultarConexiones();
            llenarSelect();
        }
    });
});