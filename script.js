closeModal("");
// Función para actualizar el porcentaje de RAM
function actualizarPorcentajeRAM(id, totalRAM, usoActualRAM, circulo) {
  var porcentaje = (usoActualRAM / totalRAM) * 100;
  var ramFill = document.getElementById(id).querySelector(".ram-fill");
  var estado = document.getElementById(id).querySelector(".estado");

  // Actualizar barra de RAM
  ramFill.style.width = porcentaje + "%";

  // Cambiar el color del estado dependiendo del porcentaje
  if (porcentaje < 60) {
    ramFill.style.backgroundColor = "#4caf50"; // Verde
  } else if (porcentaje >= 60 && porcentaje < 80) {
    ramFill.style.backgroundColor = "#ff9800"; // Naranja
  } else {
    ramFill.style.backgroundColor = "#f44336"; // Rojo
  }

  if (circulo === "online") {
    estado.style.backgroundColor = "#52D3D8"; // conectado
  } else {
    estado.style.backgroundColor = "#B9B4C7"; // conectado
    ramFill.style.backgroundColor = "#FFF7F1"; // blanco
  }
}

// Función para cambiar los elementos con data-estado="2" a data-estado="1"
function activarEquiposInactivos() {
  document
    .querySelectorAll('.cubiculo[data-estado="2"]')
    .forEach(function (elemento) {
      elemento.setAttribute("data-estado", "1");
    });
}

// 0 = inavilitado, 1 = activo 2, = inactivo
async function obtener_estado_ram(ip, nombreEquipo) {
  try {
    const response = await fetch(`http://10.10.100.${ip}:3000/estatus_ram`);
    if (!response.ok) {
      throw new Error("Error al obtener el estado y ram de la PC");
    }
    const data = await response.json();
    // Aquí puedes manipular la data recibida y actualizar la interfaz de usuario
    //console.log(data.nombreEquipo);
    actualizarPorcentajeRAM(
      nombreEquipo,
      data.ramTotal_MB,
      data.ramEnUso_MB,
      "online"
    );
    const cubiculo = document.getElementById(nombreEquipo);
    if (cubiculo) {
      // Si existe el elemento, llamar a la función obtener_estado_ram_flotante
      ram_ventana_flotante_update(
        nombreEquipo,
        data.ramTotal_MB,
        data.ramEnUso_MB
      );
    }
  } catch (error) {
    if (error.message.includes("Failed to fetch")) {
      //La PC está desconectada o apagada.
      actualizarPorcentajeRAM(nombreEquipo, 0, 0, "offline");
      // Cambiar data-estado a "2"
      const cubiculo = document.getElementById(nombreEquipo);
      if (cubiculo) {
        cubiculo.setAttribute("data-estado", "2");
      }
      var divFlotante = document.getElementById(
        nombreEquipo + "ventanaFlotente"
      );
      if (divFlotante) {
        ram_ventana_flotante_update(nombreEquipo, 0, 0);
      }
      console.log("La PC " + nombreEquipo + " está desconectada o apagada.");
    } else {
      //console.error(error);
    }
  }
}

consultar_cada_10_segundos(); // Llamar inicialmente
setInterval(consultar_cada_10_segundos, 10000);
setInterval(activarEquiposInactivos, 30 * 60 * 1000); // 30 minutos en milisegundos

// Función para ejecutar la consulta cada 10 segundos
function consultar_cada_10_segundos() {
  // Iterar sobre cada elemento con la clase "cubiculo"
  document.querySelectorAll(".cubiculo").forEach(function (elemento) {
    var estado = elemento.getAttribute("data-estado");
    var id_equipo = elemento.getAttribute("id");

    // Verificar si el estado es igual a 1
    if (estado === "1") {
      // Obtener el número de IP y el nombre del equipo
      var ip = parseInt(id_equipo.substring(2), 10);// Eliminar 'EQ' del ID y convertir el número a entero
      var nombre_equipo = id_equipo;
      //console.log(nombre_equipo);
      // Llamar a la función para obtener el estado de la RAM
      obtener_estado_ram(ip, nombre_equipo);
    }
  });
}

//ventana flotante para ver caracteristicas y estado del equipo.
function abrirCubiculo(ip, nombreEquipo) {
  obtener_estado_ram(ip, nombreEquipo);
  //activarEquiposInactivos();
  var divFlotante = document.getElementById(nombreEquipo + "ventanaFlotente");
  //si el div flotente existe.
  if (divFlotante) {
    // Si existe, añadir la clase "blink" para hacerlo parpadear
    divFlotante.classList.add("blink");
    // Esperar un momento y luego quitar la clase para detener el parpadeo
    setTimeout(function () {
      divFlotante.classList.remove("blink");
    }, 200); // Aquí puedes ajustar la duración del parpadeo en milisegundos
  } else {
    var divFlotante = document.createElement("div");
    divFlotante.id = nombreEquipo + "ventanaFlotente";
    divFlotante.className = "floatingDiv";
    divFlotante.innerHTML = `
        <div class="floatingDiv_titulo">
            <p style="padding: 0; margin: 0;">${nombreEquipo}</p>
            <div id="mensajes${nombreEquipo}" class="texto_mensaje">            
            </div>
            <div  class="div_boton_ventana_flotante">

                <img id="close_${ip}" src="img/x.svg"  class="boton_cerrar_flotante" title="Cerrar ventana flotante" alt=""> 
            </div> 
        </div>

        <div class="floatingDiv_cuerpo">
            <div id="datos_${ip}" style=" display: flex; data-visible justify-content: space-between; height: 164px; width: 100%;">
                <div>
                    <div id="modelo_${ip}" class="componentePC">                       
                    </div>

                    <div id="serie_${ip}" class="componentePC">                       
                    </div>

                    <div id="procesador_${ip}" class="componentePC">                        
                    </div>

                    <div id="almacenamiento_${ip}" class="componentePC">                        
                    </div>

                    <div id="ram_${ip}" class="componentePC">                       
                    </div>

                </div>

                <div class="div_img_equipo">
                  <img id="img_flotante_${ip}" src="img_equipo/null.png" alt="" class="img_equipo">
                </div>
               
            </div>


            <div id="visor_${ip}" style="display: none; justify-content: flex-start;">

                <div class="div_visor">
                  <img id="img_pantalla_${ip}" src="img_equipo/null.png" alt="" class="img_visor">
                </div>
                
            </div>


           <div style="display:flex; flex-wrap: wrap;">   

            <button onclick="abrirrModal('${ip}','¿Estas seguro de encender esta maquina?','encender','Encender')" class="botones_panel" title="Encender equipo" >ENC</button>
            <button onclick="abrirrModal('${ip}','¿Estas seguro de apagar esta maquina?','apagar','Apagar')" class="botones_panel" title="Apagar equipo" >APA</button>
            <button onclick="abrirrModal('${ip}','¿Estas seguro de reiniciar esta maquina?','reiniciar','Reiniciar')" class="botones_panel" title="Reiniciar equipo" >REI</button>
            <button onclick="abrirrModal('${ip}','¿Estas seguro de desactivar el apagado automatico?','desactivarOff','Desactivar')" class="botones_panel" title="Desactivar apagado automatico" >DES</button>
            <button onclick="abrirrModal('${ip}','¿Estas seguro de activar el apagado automatico?','activarON','Activar')" class="botones_panel" title="Activar apagado automatico" >ACT</button>

            <!-- <div class="div_boton_img_panel_equipo">
              <img id="img_tasysitem${ip}" src="img/taxsystem.png"  class="img_panel_equipo" onclick="abrirrModal('${ip}','¿Estas seguro de actualizar el Taxsystem?','taxsystem','Actualizar Taxsystem')" title="Actualizar Taxisistem">
            </div> -->


            <div class="div_boton_img_panel_equipo">  
            <img id="img_tasisitem${ip}" src="img/InfoTaxiGestor.png" alt="" onclick="abrirrModal('${ip}','¿Estas seguro de actualizar el InfoTaxi Gestor?','InfoTaxiGestor','Actualizar InfoTaxi Gestor')" class="img_panel_equipo" title="Actualizar Info Taxi Gestor">
            </div>
            
            <div class="div_boton_img_panel_equipo">
            <img id="img_tasisitem${ip}" src="img/Tarifario.png" alt="" onclick="abrirrModal('${ip}','¿Estas seguro de actualizar el Tarifario?','tarifario','Actualizar Tarifario')" class="img_panel_equipo"  title="Actualizar Tarifario">
            </div>

            <div class="div_boton_img_panel_equipo"> 
            <img id="img_tasisitem${ip}" src="img/Central.png" alt="" onclick="abrirrModal('${ip}','¿Estas seguro de actualizar el Modulo De Quejas?','moduloDeQuejas','Actualizar Modulo De Quejas')" class="img_panel_equipo"  title="Actualizar Modulo de Quejas">
            </div>

            <div class="div_boton_img_panel_equipo">
            <img id="img_tasisitem${ip}" src="img/Corporativo.png" alt="" onclick="abrirrModal('${ip}','¿Estas seguro de actualizar el programa Corporativo?','corporativo','Actualizar Corporativo')" class="img_panel_equipo" class="img_panel_equipo"  title="Actualizar Corporativo">
            </div>
          
            <div class="div_boton_img_panel_equipo">  
            <img id="img_tasisitem${ip}" src="img/satelitalWeb.png" alt="" onclick="abrirrModal('${ip}','¿Estas seguro de actualizar el programa Satelital Web?','satelitalWeb','Actualizar Satelital Web')" class="img_panel_equipo"  title="Actualizar Satelital Web">
            </div>

            <div class="div_boton_img_panel_equipo">
            <img id="update_${ip}" onclick="full_datos_consulta('${ip}','true')" src="img/refresh-cw.svg" style="width: 100%; height: 100%; cursor: pointer;" title="Actualizar hardware"  alt=""> 
            </div>

            <div class="div_boton_img_panel_equipo">
            <img id="img_cambio_pantalla${ip}"  onclick="cabio_visor_o_caracteristicas(${ip})" src="img/eye.svg" style="width: 100%; height: 100%; cursor: pointer;"   alt="" title="Ver pantalla"> 
            </div>
            
            <div class="div_boton_img_panel_equipo">
            <img id="img_cambio_pantalla${ip}"  onclick="openModal(${ip})" src="img/maximize.svg" style="width: 100%; height: 100%; cursor: pointer;"   alt="" title="Ver pantalla en grande"> 
            </div>

            <div class="div_boton_img_panel_equipo">
            <div id='spinner_vnc${ip}' class="spinner_alerta_flotante" style="width: 22px; height: 22px; display: none;" ></div>
            <img id="img_vnc${ip}"  onclick="abrirUVNC(${ip})" src="img/uvnc.png" style="width: 100%; height: 100%; cursor: pointer;"   alt="" title="Ver por VNC"> 
            </div>

           </div>

            <div>
              <div  class="ram-bar-texto">
                <div  class="ram-fill-texto"></div>
                <div  class="ram-fill-texto2"></div>
              </div>
                <div id="ramBar_flotante" class="ram-bar-flotante">
                <div id="ramFill_flotante" class="ram-fill-flotante"></div>
              </div>  
            </div>
           
            <!-- Mensaje modal -->
            <div id="mensaje_modal_${ip}" class="modal" style="display: none;" data-clave="sindato">
                <div class="modal-content">
                    <div style="display: flex; justify-content: space-between;">
                      <p id="texto_alerta_floating_${ip}">¿Quieres actualizar?</p>
                      <span class="close" onclick="cerrarModal(${ip})" title="Cancelar">&times;</span>
                    </div>

                    <div style="display: flex;  justify-content: center;">
                    <div id='spinner_${ip}' class="spinner_alerta_flotante"></div>
                    <button id="texto_boton_alerta_${ip}" class="boton_modal_flotante" onclick="actualizar(${ip},'${nombreEquipo}')">Actualizar</button>
                  
                    </div>
                                       
                </div>
            </div>

            <!-- Fin del mensaje modal -->

        </div>
        
        `;

    // Añadir el div al cuerpo del documento
    document.body.appendChild(divFlotante);
    // Hacer el div flotante arrastrable
    hacerArrastrable(divFlotante);

    full_datos_consulta(ip, "local");
    document.getElementById("close_" + ip).onclick = function () {
      //clearInterval(intervalId);
      cerrarDivFlotante(nombreEquipo);
    };
  }
}

function cerrarModal(ip) {
  document.getElementById("mensaje_modal_" + ip).style.display = "none";
  visibilidadBoton(ip, "block");
}

function abrirrModal(ip, texto, nuevaClave, texto_boton) {
  ocultarSpinner(ip);
  document.getElementById("texto_alerta_floating_" + ip).textContent = texto;
  document.getElementById("texto_boton_alerta_" + ip).textContent = texto_boton;
  var modalElement = document.getElementById("mensaje_modal_" + ip);
  modalElement.setAttribute("data-clave", nuevaClave);
  modalElement.style.display = "flex";
}

function actualizar(ip, nombre_equipo) {
  visibilidadBoton(ip, "none");
  mostrarSpinner(ip);
  var clave = document
    .getElementById("mensaje_modal_" + ip)
    .getAttribute("data-clave");
  switch (clave) {
    case "encender":
      encenderPC(nombre_equipo);
      cerrarModal(ip);
      ocultarSpinner(ip);
      break;
    case "apagar":
      apagarPC(ip, nombre_equipo);
      break;
    case "reiniciar":
      reiniciarPC(ip, nombre_equipo);
      break;
    case "taxsystem":
      ejecutarCMD(
        ip,
        nombre_equipo,
        "Actualizar_Taxsystem_mudo.cmd",
        "Taxsystem"
      );
      break;
    case "InfoTaxiGestor":
      ejecutarCMD(
        ip,
        nombre_equipo,
        "Actualizar_Gestor_mudo.cmd",
        "InfoTaxi Gestor"
      );
      break;
    case "tarifario":
      ejecutarCMD(
        ip,
        nombre_equipo,
        "Actualizar_Tarifario_mudo.cmd",
        "Tarifario"
      );
      break;
    case "moduloDeQuejas":
      ejecutarCMD(
        ip,
        nombre_equipo,
        "Actualizar_Central_mudo.cmd",
        "Modulo de Quejas"
      );
      break;
    case "corporativo":
      ejecutarCMD(
        ip,
        nombre_equipo,
        "Actualizar_Corporativo_mudo.cmd",
        "Corporativo.exe"
      );
      break;
    case "satelitalWeb":
      ejecutarCMD(ip, nombre_equipo, "Satelital_Web_mudo.cmd", "Satelital Web");
      break;

    case "desactivarOff":
      ejecutarCMD(
        ip,
        nombre_equipo,
        "desabilitar_Tarea_Apagado.cmd",
        "Desactivar OFF"
      );
      break;

    case "activarON":
      ejecutarCMD(
        ip,
        nombre_equipo,
        "abilitar_Tarea_Apagado.cmd",
        "Activar OFF"
      );
      break;

    default:
      console.log("Función no encontrada");
      break;
  }
}

function mostrarSpinner(ip) {
  var spinner = document.getElementById("spinner_" + ip);
  if (spinner) {
    spinner.style.display = "block"; // Hacer visible el spinner
  }
}

function ocultarSpinner(ip) {
  var spinner = document.getElementById("spinner_" + ip);
  if (spinner) {
    spinner.style.display = "none"; // Ocultar el spinner
  }
}

function visibilidadBoton(ip, mostrar) {
  var elementoBoton = document.getElementById("texto_boton_alerta_" + ip);

  if (mostrar === "none") {
    elementoBoton.style.display = "none";
  } else {
    elementoBoton.style.display = "block";
  }
}

var timeoutId_visor;
function actualizarImagen(ip) {
  // Cambiar el atributo src de la imagen con el nuevo enlace
  var imagen_flotante = document.getElementById("img_pantalla_" + ip);
  imagen_flotante.src =
    `http://10.10.100.${ip}:3000/screenshot/img_captura.png?` +
    new Date().getTime(); // timestamp para evitar el caché

  var imagen_grande = document.getElementById("imagen_pantalla_grande");
  if (imagen_grande.getAttribute("data-ip") === ip.toString()) {
    imagen_grande.src =
      `http://10.10.100.${ip}:3000/screenshot/img_captura.png?` +
      new Date().getTime(); // timestamp para evitar el caché
  }

  // Esperar 2 segundos antes de llamar a la función nuevamente
  timeoutId_visor = setTimeout(function () {
    actualizarImagen(ip);
    //console.log('en bucle')
  }, 2000);
}

// Función para detener el bucle
function detenerBucle() {
  clearTimeout(timeoutId_visor);
}

function cabio_visor_o_caracteristicas(ip) {
  var datosDiv = document.getElementById(`datos_${ip}`);
  var visorPantalla = document.getElementById("img_cambio_pantalla" + ip);
  var visorDiv = document.getElementById(`visor_${ip}`);

  if (datosDiv.style.display === "flex") {
    // Si los datos están visibles, oculta los datos y muestra el visor
    datosDiv.style.display = "none";
    visorDiv.style.display = "flex";
    visorPantalla.src = "img/hexagon.svg";
    visorPantalla.title = "Ver caracteristicas de equipo";
    actualizarImagen(ip);
  } else {
    // Si los datos están ocultos, muestra los datos y oculta el visor
    datosDiv.style.display = "flex";
    visorDiv.style.display = "none";
    visorPantalla.src = "img/eye.svg";
    visorPantalla.title = "Ver pantalla remota";

    detenerBucle();
  }
}

async function obtener_estado_ram_flotante(ip, nombreEquipo) {
  try {
    const response = await fetch(`http://10.10.100.${ip}:3000/estatus_ram`);
    if (!response.ok) {
      throw new Error("Error al obtener el estado y ram de la PC");
    }
    const data = await response.json();
    // Aquí puedes manipular la data recibida y actualizar la interfaz de usuario
    //console.log(data.nombreEquipo);
    ram_ventana_flotante_update(
      data.nombreEquipo,
      data.ramTotal_MB,
      data.ramEnUso_MB
    );
  } catch (error) {
    if (error.message.includes("Failed to fetch")) {
      ram_ventana_flotante_update(data.nombreEquipo, 0, 0); //La PC está desconectada o apagada.
      //console.error(error);
      //console.log("La PC está desconectada o apagada.");
    } else {
      //console.error(error);
    }
  }
}

function ram_ventana_flotante_update(nombreEquipo, totalRAM, usoActualRAM) {
  var porcentaje = (usoActualRAM / totalRAM) * 100;
  var libreRam = totalRAM - usoActualRAM;
  var porcentajeLibre = (libreRam / totalRAM) * 100;
  var ramFill = document
    .getElementById(nombreEquipo + "ventanaFlotente")
    .querySelector(".ram-fill-flotante");
  var ramFilltexto = document
    .getElementById(nombreEquipo + "ventanaFlotente")
    .querySelector(".ram-fill-texto");
  var ramBartexto2 = document
    .getElementById(nombreEquipo + "ventanaFlotente")
    .querySelector(".ram-fill-texto2");

  ramFilltexto.textContent = usoActualRAM + " MB ";
  ramBartexto2.textContent = totalRAM - usoActualRAM + " MB ";
  // Actualizar barra de RAM
  ramFill.style.width = porcentaje + "%";
  ramFilltexto.style.width = porcentaje + "%";
  ramBartexto2.style.width = porcentajeLibre + "%";

  // Cambiar el color del estado dependiendo del porcentaje
  if (porcentaje < 60) {
    ramFill.style.backgroundColor = "#4caf50"; // Verde
    ramFilltexto.style.color = "#45ce49";
  } else if (porcentaje >= 60 && porcentaje < 80) {
    ramFill.style.backgroundColor = "#ff9800"; // Naranja
    ramFilltexto.style.color = "#ff9800";
  } else {
    ramFill.style.backgroundColor = "#f44336"; // Rojo
    ramFilltexto.style.color = "#f44336";
  }
}

function hacerArrastrable(elemento) {
  var pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;

  // Establece la posición inicial del div en la posición del mouse
  var anchoVentana = window.innerWidth;
  var alturaVentana = window.innerHeight;

  // Obtener el desplazamiento de la página
  var desplazamientoX = window.scrollX;
  var desplazamientoY = window.scrollY;

  // Calcular el centro
  var x = desplazamientoX + anchoVentana / 2;
  var y = desplazamientoY + alturaVentana / 2;

  // Ajustar las coordenadas para que el div aparezca en el centro
  elemento.style.left = x + "px";
  elemento.style.top = y + "px";

  if (document.getElementById(elemento.id)) {
    // Si existe el elemento, permite que se pueda mover
    elemento.onmousedown = dragMouseDown;
  } else {
    // Si no existe, no hace nada
    return;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();

    // obtén la posición inicial del mouse
    pos3 = e.clientX;
    pos4 = e.clientY;
    //console.log(pos2, pos3, pos4);

    document.onmouseup = closeDragElement;
    // llama a una función cada vez que el mouse se mueve
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calcula la nueva posición del elemento
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // establece el nuevo posición del elemento
    elemento.style.top = elemento.offsetTop - pos2 + "px";
    elemento.style.left = elemento.offsetLeft - pos1 + "px";
  }

  function closeDragElement() {
    // deja de mover cuando el mouse se suelta
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function cerrarDivFlotante(nombreEquipo) {
  var divFlotante = document.getElementById(nombreEquipo + "ventanaFlotente");
  if (divFlotante) {
    // Si el div flotante existe, se elimina del DOM
    divFlotante.parentNode.removeChild(divFlotante);
  }
}

async function full_datos_consulta(ip, orden) {
  iniciarGiro(ip);
  try {
    const response = await fetch(
      `http://10.10.100.${ip}:3000/fulldate?update_datos=${orden}`
    );
    if (!response.ok) {
      throw new Error("Error al obtener los datos de la PC");
    }
    const data = await response.json();
    //Datos recibidos
    console.log(data);
    insertarProcesador(ip, data);
    insertarAlmacenamiento(ip, data);
    insertarRam(ip, data);
    insertarmodelo(ip, data);
    insertarNumeroSerie(ip, data);
    document.getElementById("img_flotante_" + ip).src =
      "img_equipo/" + data.model + ".jpg";
    detenerGiro(ip);
  } catch (error) {
    if (error.message.includes("Failed to fetch")) {
      console.error(error);
      console.log("La PC está desconectada o apagada.");

      detenerGiro(ip);
    } else {
      console.error(error);

      detenerGiro(ip);
    }
  }
}

function insertarProcesador(ip, data) {
  var divProcesador = document.getElementById("procesador_" + ip);
  divProcesador.innerHTML = "";

  // Crear tabla y fila
  var tabla = document.createElement("table");
  var fila = tabla.insertRow();

  // Primera columna
  var columna1 = fila.insertCell(0);
  columna1.textContent = "CPU: ";
  columna1.style.width = "48px";

  // Segunda columna
  var columna2 = fila.insertCell(1);
  columna2.textContent = data.marcaProcesador + " " + data.tipoProcesador;
  columna2.style.textAlign = "left";

  // Agregar tabla al div
  divProcesador.appendChild(tabla);
}

function insertarmodelo(ip, data) {
  var divmodelo = document.getElementById("modelo_" + ip);
  divmodelo.innerHTML = "";

  // Crear tabla y fila
  var tabla = document.createElement("table");
  var fila = tabla.insertRow();

  // Primera columna
  var columna1 = fila.insertCell(0);
  columna1.textContent = "MODEL: ";
  columna1.style.width = "48px";

  // Segunda columna
  var columna2 = fila.insertCell(1);
  columna2.textContent = data.model + " " + data.version;
  columna2.style.textAlign = "left";

  // Agregar tabla al div
  divmodelo.appendChild(tabla);
}

function insertarNumeroSerie(ip, data) {
  var divNumeroSerie = document.getElementById("serie_" + ip);
  divNumeroSerie.innerHTML = "";

  // Crear tabla y fila
  var tabla = document.createElement("table");
  var fila = tabla.insertRow();

  // Primera columna
  var columna1 = fila.insertCell(0);
  columna1.textContent = "NS: ";
  columna1.style.width = "48px";

  // Segunda columna
  var columna2 = fila.insertCell(1);
  columna2.textContent = data.numeroSerie;
  columna2.style.textAlign = "left";

  // Agregar tabla al div
  divNumeroSerie.appendChild(tabla);
}

function insertarAlmacenamiento(ip, data) {
  var divAlmacenamiento = document.getElementById("almacenamiento_" + ip);
  divAlmacenamiento.innerHTML = "";

  // Crear tabla
  var tabla = document.createElement("table");

  // Iterar sobre cada unidad de almacenamiento
  data.almacenamiento.forEach((unidad) => {
    // Crear una fila para cada unidad
    var fila = tabla.insertRow();

    // Primera columna para el tipo de almacenamiento
    var columnaTipo = fila.insertCell(0);
    columnaTipo.textContent = unidad.type + ":";
    columnaTipo.style.width = "48px";

    // Segunda columna para el tamaño de almacenamiento
    var columnaTamaño = fila.insertCell(1);
    columnaTamaño.textContent = unidad.size;
  });

  // Agregar la tabla al div
  divAlmacenamiento.appendChild(tabla);
}

function insertarRam(ip, data) {
  var divRam = document.getElementById("ram_" + ip);
  divRam.innerHTML = "";

  // Crear tabla
  var tabla = document.createElement("table");

  // Iterar sobre cada módulo de RAM
  data.ramInfo.forEach((ram) => {
    // Crear una fila para cada módulo de RAM
    var fila = tabla.insertRow();

    // Primera columna para el tipo de RAM
    var columnaTipo = fila.insertCell(0);
    columnaTipo.textContent = ram.type + ":";
    columnaTipo.style.width = "48px";

    // Segunda columna para el tamaño de RAM
    var columnaTamaño = fila.insertCell(1);
    columnaTamaño.textContent = ram.size;
  });

  // Agregar la tabla al div
  divRam.appendChild(tabla);
}

function iniciarGiro(ip) {
  const spinner = document.getElementById("update_" + ip);
  spinner.classList.add("rotating");
}

function detenerGiro(ip) {
  const spinner = document.getElementById("update_" + ip);
  spinner.classList.remove("rotating");
}

async function apagarPC(ip, nombreEquipo) {
  try {
    const response = await fetch(
      `http://10.10.100.${ip}:3000/apagado?palabra=apagar`
    );
    if (!response.ok) {
      cerrarModal(ip);
      ocultarSpinner(ip);
      throw new Error("Error al reiniciar la PC");
    }
    const data = await response.json();
    // Aquí puedes manipular la data recibida y actualizar la interfaz de usuario
    //console.log(data);
    mensajes(nombreEquipo, data.message);
    cerrarModal(ip);
    ocultarSpinner(ip);
  } catch (error) {
    console.error(error);
    cerrarModal(ip);
    ocultarSpinner(ip);
  }
}

//40:B0:34:3D:8B:E1
async function encenderPC(nombreEquipo) {
  var miDiv = document.getElementById(nombreEquipo);
  var mac = miDiv.dataset.mac;
  //console.log(mac);
  try {
    const response = await fetch(
      `http://localhost:3001/wake/${mac}`
    );
    if (!response.ok) {
      throw new Error("Error al encender la PC");
    }
    //const data = await response.json();
    // Aquí puedes manipular la data recibida y actualizar la interfaz de usuario
    //console.log(data.message);
    mensajes(nombreEquipo, 'Mensaje de encedido enviado');
  } catch (error) {
    console.error(error);
  }
}

function mensajes(nombreEquipo, mensaje) {
  var divMensaje = document.getElementById("mensajes" + nombreEquipo);
  divMensaje.textContent = mensaje;

  // Mostrar el mensaje
  divMensaje.style.opacity = "1";

  // Desvanecer el mensaje después de 5 segundos
  setTimeout(function () {
    divMensaje.style.opacity = "0";
  }, 4000);
}

async function reiniciarPC(idEquipo, nombreEquipo) {
  try {
    const response = await fetch(
      `http://10.10.100.${idEquipo}:3000/reiniciar?palabra=reiniciar`
    );
    if (!response.ok) {
      cerrarModal(idEquipo);
      ocultarSpinner(idEquipo);
      throw new Error("Error al reiniciar la PC");
    }
    const data = await response.json();
    // Aquí puedes manipular la data recibida y actualizar la interfaz de usuario
    console.log(data);
    mensajes(nombreEquipo, data.message);
    cerrarModal(idEquipo);
    ocultarSpinner(idEquipo);
  } catch (error) {
    console.error(error);
    cerrarModal(idEquipo);
    ocultarSpinner(idEquipo);
  }
}

//{
// "nombreArchivo":"install_actualizadores_central_despacho.cmd",
// "nombrePrograma":"script de actualizaciones CallCenter despacho"
//}

async function ejecutarCMD(ip, nombreEquipo, nombreArchivo, nombrePrograma) {
  try {
    const jsonData = {
      nombreArchivo: nombreArchivo,
      nombrePrograma: nombrePrograma,
    };
    const response = await fetch(`http://10.10.100.${ip}:3000/ejecutarCMD`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jsonData),
    });

    if (!response.ok) {
      cerrarModal(ip);
      ocultarSpinner(ip);
      throw new Error("Error al ejecutar el comando en la PC");
    }

    const data = await response.json();
    console.log(data);
    mensajes(nombreEquipo, data.message);
    cerrarModal(ip);
    ocultarSpinner(ip);
  } catch (error) {
    cerrarModal(ip);
    ocultarSpinner(ip);
  }
}

function openModal(ip) {
  var imagen = document.getElementById("imagen_pantalla_grande");
  imagen.setAttribute("data-ip", ip);

  var modal = document.getElementById("modal_visor_grande");
  modal.style.display = "flex";

  var titulo = document.getElementById("titulo_visor_grande");
  titulo.textContent = "EQ" + ip;
  //f;
}

function closeModal(ip) {
  var imagen_grande = document.getElementById("imagen_pantalla_grande");
  imagen_grande.setAttribute("data-ip", "");
  imagen_grande.src = "img_equipo/null.png";

  var modal = document.getElementById("modal_visor_grande");
  modal.style.display = "none";
}

async function abrirUVNC(ip) {
  document.getElementById("spinner_vnc" + ip).style.display = "block";
  document.getElementById("img_vnc" + ip).style.display = "none";
  console.log("10.10.100." + ip);
  try {
    const response = await fetch("http://localhost:3001/print", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ip: "10.10.100." + ip, password: "autocab" }),
    });

    if (!response.ok) {
      throw new Error("Error en la solicitud");
    }

    const result = await response.text();
    console.log(result);

    // Ocultar el ícono después de 3 segundos
    setTimeout(() => {
      document.getElementById("img_vnc" + ip).style.display = "block";
      document.getElementById("spinner_vnc" + ip).style.display = "none";
    }, 5000);

    //console.log("Comando enviado correctamente");
  } catch (error) {
    console.error("Error:", error);
    alert("Error ejecutando el comando");
  }
}
