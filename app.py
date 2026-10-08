import concurrent.futures
import io
import os
import random
import tempfile
import time
from datetime import datetime

import PyPDF2
import docx
# import textract

import base64
import multiprocessing
from multiprocessing import Pool

from cachelib.file import FileSystemCache
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_cors import CORS, cross_origin
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import text

from PLN.EvaluarRespuestas import EvaluarRespuestas
from flask_session import Session

from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

from waitress import serve

app = Flask(__name__)
app.secret_key = "Una llave secreta mucho mas larga"

# Confiduracion de la base de datos PostgreSQL
# app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:TIDIia@localhost:1035/BD_TIDI_IA'
# app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://tidi_ia_admin:TIDIia@localhost:1035/BD_TIDI_IA'

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://tidi_ia_admin:TIDIia@132.248.159.197:5432/BD_TIDI_IA'
# app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://tidi_ia_admin:TIDIia@localhost:1234/BD_TIDI_IA'
# app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://tidi_ia_admin:TIDIia@postgres:5432/BD_TIDI_IA'


app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# cache_dir = '../../Downloads/TIDI-IA-V2/TIDI-IA-V2/cache'
cache_dir = './cache'
if not os.path.exists(cache_dir):
    os.makedirs(cache_dir)

# Configuración de la sesión
# app.config['SESSION_TYPE'] = 'filesystem'
# app.config['SESSION_FILE_DIR'] = cache_dir
# app.config['SESSION_FILE_THRESHOLD'] = 100 # Número máximo de archivos de sesión
# app.config['SESSION_FILE_MODE'] = 600 # Permisos para los archivos de sesión

# app.config['SESSION_TYPE'] = 'cachelib'
# app.config['SESSION_SERIALIZATION_FORMAT'] = 'json'
# app.config['SESSION_CACHELIB'] = FileSystemCache(cache_dir, threshold=100)

app.config['SESSION_TYPE'] = 'filesystem'

# upload_dir = '../../Downloads/TIDI-IA-V2/TIDI-IA-V2/uploads'
upload_dir = './uploads'
if not os.path.exists(upload_dir):
    os.makedirs(upload_dir)

# Solo se permiten extensiones de archivos de texto
EXTENCIONES_PERMITIDAS = {'txt',
                          'pdf',
                          'mp4',
                          # 'doc',
                          'docx'}
app.config['UPLOAD_FOLDER'] = upload_dir


Session(app)
db = SQLAlchemy(app)

CORS(app)

# class SessionData(db.Model):
#     __tablename__ = 'TSESIONES'
#     id = db.Column(db.Integer, primary_key=True)
#     session_id = db.Column(db.String(255), unique=True, nullable=False)
#     data = db.Column(db.PickleType, nullable=False)
#     expiry = db.Column(db.DateTime, nullable=False)

class Usuario(db.Model):
    __tablename__ = 'TUSUARIO'

    iNumUsuario = db.Column(db.Integer, primary_key=True)
    iTipoUsuario = db.Column(db.Integer, nullable=False)
    vcNombUsuario = db.Column(db.String(250), nullable=False)
    vcContrasenia = db.Column(db.String(250), nullable=False)
    bActivo = db.Column(db.Boolean, nullable=False)
    iNumGrupo = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return f'<Usuario {self.iNumUsuario}>'

class Grupo(db.Model):
    __tablename__ = 'TGRUPO'

    iNumGrupo = db.Column(db.Integer, primary_key=True)
    bActivo = db.Column(db.Boolean, nullable=False)

    def __repr__(self):
        return f'<Grupo {self.iNumGrupo}>'

class Asignatura(db.Model):
    __tablename__ = 'TASIGNATURA'

    iNumAsignatura = db.Column(db.Integer, primary_key=True)
    vcNombAsignatura = db.Column(db.String(250), nullable=False)
    bActivo = db.Column(db.Boolean, nullable=False)
    cColorHexAsignatura = db.Column(db.String(7), nullable=False)

    def __repr__(self):
        return f'<Asignatura {self.iNumAsignatura}>'

class GrupoAsignatura(db.Model):
    __tablename__ = 'TGRUPO_ASIGNATURA'

    iNumGrupo = db.Column(db.Integer, primary_key=True)
    iNumAsignatura = db.Column(db.Integer, primary_key=True)

    def __repr__(self):
        return f'<GrupoAsignatura {self.iNumGrupo} - {self.iNumAsignatura}>'


class Tema(db.Model):
    __tablename__ = 'TTEMA'

    iNumTema = db.Column(db.Integer, primary_key=True)
    iNumAsignatura = db.Column(db.Integer, nullable=False)
    vcNombTema = db.Column(db.String(250), nullable=False)
    bActivo = db.Column(db.Boolean, nullable=False)

    def __repr__(self):
        return f'<Tema {self.iNumTema}>'

class Aviso(db.Model):
    __tablename__ = 'TAVISO'

    iNumAviso = db.Column(db.Integer, primary_key=True)
    iNumAsignatura = db.Column(db.Integer, nullable=False)
    vcTitulo = db.Column(db.String(250), nullable=False)
    vcCuerpo = db.Column(db.String(250), nullable=False)
    dFecha = db.Column(db.DateTime, nullable= False)
    bActivo = db.Column(db.Boolean, nullable=False)

    def __repr__(self):
        return f'<Tema {self.iNumAviso}>'

class Contenido (db.Model):
    __tablename__ = 'TCONTENIDO'

    iNumContenido = db.Column(db.Integer, primary_key=True)
    iNumTema = db.Column(db.Integer, primary_key=True)
    vcTitulo = db.Column(db.String(250), nullable=False)
    vcObjetivos = db.Column(db.String(250), nullable=False)
    dFecInicio = db.Column(db.DateTime, nullable=False)
    dFecFin = db.Column(db.DateTime, nullable=False)
    bActivo = db.Column(db.Boolean, nullable=False)
    iTipo = db.Column(db.Integer, nullable=False)
    jActividad = db.Column(db.JSON, nullable=True)
    vcUrlVideo = db.Column(db.String(250), nullable=True)
    byArchivo = db.Column(db.LargeBinary, nullable=True)

    def __repr__(self):
        return f'<Contenido {self.iNumContenido}>'

class UsuarioActividad(db.Model):
    __tablename__ = 'TUSUARIO_ACTIVIDAD'

    iNumUsuario = db.Column(db.Integer, primary_key=True)
    iNumContenido = db.Column(db.Integer, primary_key=True)
    byActividad = db.Column(db.LargeBinary, nullable=True)
    iStatus = db.Column(db.Integer, nullable=False)
    jResultado = db.Column(db.JSON, nullable=True)
    vcNombArchivo = db.Column(db.String(250), nullable=True)
    iTipoArchivo = db.Column(db.Integer, nullable=True)
    iTema = db.Column(db.Integer, primary_key=True)
    icalificacion = db.Column(db.Float, nullable=True)

    def __repr__(self):
        return f'<UsuarioActividad {self.iNumUsuario} - {self.iNumContenido}>'

def getNuevoContenidoTema (iNumTema):
    # Obtenemos el último iNumContenido
    ultimo_iNumContenido = Contenido.query.filter_by(iNumTema=iNumTema).order_by(Contenido.iNumContenido.desc()).first()

    if ultimo_iNumContenido is None:
        ultimo_iNumContenido = 1
    else:
        ultimo_iNumContenido = ultimo_iNumContenido.iNumContenido + 1

    return ultimo_iNumContenido

def archivoPermitido(nombreArchivo):
    return '.' in nombreArchivo and nombreArchivo.rsplit('.', 1)[1].lower() in EXTENCIONES_PERMITIDAS


def leer_contenido_archivo(archivo_bytes, tipo_archivo):
    if tipo_archivo == 1:
        return leer_txt(archivo_bytes)
    elif tipo_archivo == 2:
        return leer_pdf(archivo_bytes)
    # elif tipo_archivo == 3:
    #     return leer_doc(archivo_bytes)
    elif tipo_archivo == 4:
        return leer_docx(archivo_bytes)
    else:
        raise ValueError("Tipo de archivo no soportado")

def leer_pdf(archivo_bytes):
    reader = PyPDF2.PdfReader(io.BytesIO(archivo_bytes))
    texto = ""
    for page in reader.pages:
        texto += page.extract_text()
    return texto

def leer_txt(archivo_bytes):
    return archivo_bytes.decode('utf-8')

# def leer_doc(archivo_bytes):
#     with tempfile.NamedTemporaryFile(suffix=".doc", delete=False) as temp_file:
#         temp_file.write(archivo_bytes)
#         temp_file_path = temp_file.name
#     # texto = textract.process(temp_file_path, encoding='utf-8')
#     os.remove(temp_file_path)
#     return texto


def leer_docx(archivo_bytes):
    doc = docx.Document(io.BytesIO(archivo_bytes))
    texto = ""
    for para in doc.paragraphs:
        texto += para.text + '\n'
    return texto

def procesar_parte(args):
    parte, numCaso, texto_actividad = args
    evaluar_respuestas = EvaluarRespuestas()
    for variante in parte.get('variantes'):
        for patron in parte.get('patrones'):
            posible_respuesta = f'{patron} {variante}'
            # print(posible_respuesta)
            evaluacion = evaluar_respuestas.buscar_frase_con_patron(texto_actividad, posible_respuesta)
            if evaluacion:
                print("Se encontró la respuesta: ", posible_respuesta)
                # Redondeamos el valor a 3 decimales
                # return numCaso, round(int(parte.get('valor')), 3)
                return numCaso, round(int(float(parte.get('valor'))), 3)
    return numCaso, 0

def procesarActividad(jActividad, texto_actividad):

    resultados_actividad = {}

    args_list = [(parte, caso.get('numCaso'), texto_actividad) for caso in jActividad for parte in caso.get('matriz')]

    print("Conteo de procesadores: ", multiprocessing.cpu_count())

    # with Pool(processes=len(args_list)) as pool: # Ajustar el número de procesos al número de partes
    #     resultados = pool.map(procesar_parte, args_list)

    # with Pool(processes=multiprocessing.cpu_count()/2) as pool:
    #     resultados = pool.map(procesar_parte, args_list)

    with Pool(processes=4) as pool:
        resultados = pool.map(procesar_parte, args_list)

    for resultado in resultados:
        if resultado:
            numCaso, valor = resultado
            if numCaso in resultados_actividad:
                resultados_actividad[numCaso] += valor/100
            else:
                resultados_actividad[numCaso] = valor/100

    return resultados_actividad

# def procesarActividad(jActividad, texto_actividad):
#
#     evaluar_respuestas = EvaluarRespuestas()
#
#     resultados_actividad = {}
#
#     def procesar_parte(parte, numCaso):
#         for variante in parte.get('variantes'):
#             for patron in parte.get('patrones'):
#                 posible_respuesta = f'{patron} {variante}'
#                 print(posible_respuesta)
#                 evaluacion = evaluar_respuestas.buscar_frase_con_patron(texto_actividad, posible_respuesta)
#                 if evaluacion:
#                     return numCaso, int(parte.get('valor'))
#         return numCaso, 0
#
#     with concurrent.futures.ThreadPoolExecutor() as executor:
#         future_to_parte = {executor.submit(procesar_parte, parte, caso.get('numCaso')): parte for caso in jActividad for parte in caso.get('matriz')}
#
#         for future in concurrent.futures.as_completed(future_to_parte):
#             resultado = future.result()
#             if resultado:
#                 # Registramos el resultado
#                 # Si numCaso ya se encuentra en resultados_actividad, sumamos el valor
#                 # Si no, lo agregamos a resultados_actividad
#                 numCaso, valor = resultado
#                 if numCaso in resultados_actividad:
#                     resultados_actividad[numCaso] += valor/100
#                 else:
#                     resultados_actividad[numCaso] = valor/100
#
#
#     return resultados_actividad

def registrarResultados(iNumUsuario, iNumContenido, resultados_actividad):

    # Actualizamos el estado de la actividad del usuario
    usuario_actividad = UsuarioActividad.query.filter_by(iNumUsuario=iNumUsuario, iNumContenido=iNumContenido, iTema=session['iNumTema']).first()
    usuario_actividad.iStatus = 2
    usuario_actividad.jResultado = resultados_actividad

    db.session.commit()

    return

def validar_session():
    if 'sUsuario' in session and 'iNumUsuario' in session and 'iNumGrupo' in session and 'vcNombUsuario' in session and 'iTipoUsuario' in session:
        return True
    else:
        return False


@app.route('/')
def asignaturas():

    if not validar_session():
        return redirect(url_for('login'))

    # Obtenemos las asignaturas activas del grupo del usuario
    # Filtramos por iNumGrupo y bActivo
    grupo_asignaturas = GrupoAsignatura.query.filter_by(iNumGrupo=session['iNumGrupo']).all()
    asignaturas = Asignatura.query.filter(Asignatura.iNumAsignatura.in_([grupo_asignatura.iNumAsignatura for grupo_asignatura in grupo_asignaturas]),
                                         Asignatura.bActivo == True).all()

    return render_template('asignaturas.html',
                           vcNombUsuario=session['vcNombUsuario'],
                           iNumGrupo=session['iNumGrupo'],
                           asignaturas=asignaturas,
                           iTipoUsuario=session['iTipoUsuario'])



@app.route('/login', methods=['GET', 'POST'])
# @cross_origin(supports_credentials=True)
def login():
    if request.method == 'POST':
        # credenciales = request.get_json()
        #
        # sUsuario = credenciales.get('sUsuario')
        # vcContrasenia = credenciales.get('vcContrasenia')

        sUsuario = request.form['sUsuario']
        vcContrasenia = request.form['vcContrasenia']

        # Verificamos si sUsuario es un número
        if sUsuario.isnumeric():
            # Verificar si el usuario y contraseña se encuentran en la base de datos
            usuario = Usuario.query.filter_by(iNumUsuario=sUsuario).first()

            if usuario:
                if validar_credenciales(usuario, vcContrasenia):
                    session['sUsuario'] = usuario.iNumUsuario
                    session['iNumUsuario'] = usuario.iNumUsuario
                    session['iNumGrupo'] = usuario.iNumGrupo
                    session['vcNombUsuario'] = usuario.vcNombUsuario
                    session['iTipoUsuario'] = usuario.iTipoUsuario
                    # redireccionar a la página de asignaturas
                    return redirect('/')
                else:
                    return jsonify({'mensaje': 'Usuario o contraseña incorrectos'}), 401

        else:
            usuario = Usuario.query.filter_by(vcNombUsuario=sUsuario).first()
            if usuario:
                if validar_credenciales(usuario, vcContrasenia):
                    session['sUsuario'] = usuario.iNumUsuario
                    session['iNumUsuario'] = usuario.iNumUsuario
                    session['iNumGrupo'] = usuario.iNumGrupo
                    session['vcNombUsuario'] = usuario.vcNombUsuario
                    session['iTipoUsuario'] = usuario.iTipoUsuario
                    return redirect('/')
                else:
                    return jsonify({'mensaje': 'Usuario o contraseña incorrectos'}), 401
            else:
                return jsonify({'mensaje': 'Usuario o contraseña incorrectos'}), 401

    else:
        return render_template('login.html')


def validar_credenciales(usuario, contrasenia):
    if usuario and check_password_hash(usuario.vcContrasenia, contrasenia):
        return True
    else:
        return False

@app.route('/registro-usuarios', methods=['GET', 'POST'])
def registro_usuarios():
    if request.method == 'POST':

        if request.is_json:
            nuevo_usuario = request.get_json()
        else:
            nuevo_usuario = request.form

        if 'iNumUsuario' not in nuevo_usuario:
            # Creamos un numero de usuario aleatorio
            iNumUsuario = random.randint(10000, 99999)
        else:
            iNumUsuario = nuevo_usuario.get('iNumUsuario')


        if 'iTipoUsuario' not in nuevo_usuario:
            iTipoUsuario = 2
        else:
            iTipoUsuario = nuevo_usuario.get('iTipoUsuario')

        vcNombUsuario = nuevo_usuario.get('vcNombUsuario')
        vcContrasenia = nuevo_usuario.get('vcContrasenia')

        if 'bActivo' not in nuevo_usuario:
            bActivo = True
        else:
            bActivo = nuevo_usuario.get('bActivo')

        if 'iNumGrupo' not in nuevo_usuario:
            iNumGrupo = 1234
        else:
            iNumGrupo = nuevo_usuario.get('iNumGrupo')


        # Verificar si el usuario ya se encuentra registrado en la base de datos
        usuario_existente = Usuario.query.filter_by(iNumUsuario=iNumUsuario).first()
        if usuario_existente:
            return jsonify({'mensaje': 'El usuario ya se encuentra registrado'}), 400

        # Creamos hash de la contraseña
        contrasenia_hash = generate_password_hash(vcContrasenia)

        # Creamos un nuevo usuario
        nuevo_usuario = Usuario(iNumUsuario=iNumUsuario,
                                iTipoUsuario=iTipoUsuario,
                                vcNombUsuario=vcNombUsuario,
                                vcContrasenia=contrasenia_hash,
                                bActivo=bActivo,
                                iNumGrupo=iNumGrupo)

        db.session.add(nuevo_usuario)
        db.session.commit()

        return render_template('login.html')

    else:
        return render_template('login.html')


@app.route('/temas', methods=['GET','POST'])
def temas():

    if not validar_session():
        return redirect(url_for('login'))

    if 'iNumAsignatura' not in session:
        iNumAsignatura = request.form['iNumAsignatura']
    else:
        iNumAsignatura = session['iNumAsignatura']

    # Obtenemos la información de la asignatura
    asignatura = Asignatura.query.filter_by(iNumAsignatura=iNumAsignatura).first()

    # Guardamos info de la asignatura en la sesión
    session['iNumAsignatura'] = asignatura.iNumAsignatura
    session['vcNombAsignatura'] = asignatura.vcNombAsignatura
    session['cColorHexAsignatura'] = asignatura.cColorHexAsignatura

    # Obtenemos los temas de la asignatura ordenados por iNumTema
    temas = Tema.query.filter_by(iNumAsignatura=iNumAsignatura).order_by(Tema.iNumTema.asc()).all()

    # Obtenemos los avisos de la asignatura ordenados por iNumAviso
    avisos = Aviso.query.filter_by(iNumAsignatura=iNumAsignatura).order_by(Aviso.iNumAviso.asc()).all()

    return render_template('temas.html',
                           vcNombAsignatura=asignatura.vcNombAsignatura,
                           temas=temas,
                           avisos=avisos,
                           iTipoUsuario=session['iTipoUsuario'])

@app.route('/tema', methods=['POST'])
def tema():

    if not validar_session():
        return redirect(url_for('login'))

    iNumTema = request.form['iNumTema']
    session['iNumTema'] = iNumTema

    if 'iNumContenido' in session:
        session.pop('iNumContenido')
        session.modified = True

    # Obtenemos el nombre del tema
    tema = Tema.query.with_entities(Tema.vcNombTema).filter_by(iNumTema=iNumTema).first()

    # Obtenemos las actividades del tema ordenadas por iNumContenido
    contenidos = Contenido.query.with_entities(Contenido.vcTitulo, Contenido.iNumContenido,
                                               Contenido.iTipo).filter_by(iNumTema=iNumTema).order_by(
                                               Contenido.iNumContenido.asc()).all()

    return render_template('tema.html',
                            iNumTema=iNumTema,
                            vcNombTema=tema.vcNombTema,
                            cColorHexAsignatura=session['cColorHexAsignatura'],
                            contenidos=contenidos,
                            iTipoUsuario=session['iTipoUsuario'])

    # return render_template('tema.html')

@app.route('/agregar_tema', methods=['POST'])
def agregar_tema():
    if request.method == 'POST':
        iNumAsignatura = session['iNumAsignatura']
        vcNombTema = request.form['vcNombTema']

        # Evaluamos request.form['bActivo'] para obtener un valor booleano
        if 'bActivo' in request.form:
            bActivo = True
        else:
            bActivo = False

        # Obtenemos el último iNumTema
        ultimo_iNumTema = Tema.query.order_by(Tema.iNumTema.desc()).first()

        if ultimo_iNumTema is None:
            ultimo_iNumTema = 1
        else:
            ultimo_iNumTema = ultimo_iNumTema.iNumTema + 1

        nuevo_tema = Tema(iNumTema=ultimo_iNumTema,
                            iNumAsignatura=iNumAsignatura,
                            vcNombTema=vcNombTema,
                            bActivo=bActivo)

        db.session.add(nuevo_tema)
        db.session.commit()

        # Redireccionamos a la página de temas
        return redirect(url_for('temas'))

@app.route('/modificar_tema', methods=['POST'])
def modificar_tema():
    if request.method == 'POST':

        if 'iNumTema-editar' in request.form:
            iNumTema = request.form['iNumTema-editar']
            vcNombTema = request.form['vcNombTema']

            # Evaluamos request.form['bActivo'] para obtener un valor booleano
            if 'bActivo' in request.form:
                bActivo = True
            else:
                bActivo = False

            # Obtenemos el tema a modificar
            tema = Tema.query.filter_by(iNumTema=iNumTema, iNumAsignatura=session['iNumAsignatura']).first()
            tema.vcNombTema = vcNombTema
            tema.bActivo = bActivo

            db.session.commit()
        else:
            # Obtenemos el iNumTema a eliminar
            iNumTema = request.form['iNumTema-borrar']

            # Obtenemos el tema a eliminar
            tema = Tema.query.filter_by(iNumTema=iNumTema, iNumAsignatura=session['iNumAsignatura']).first()

            # Eliminamos el tema
            db.session.delete(tema)
            db.session.commit()

        # Redireccionamos a la página de temas
        return redirect(url_for('temas'))

    return

@app.route('/agregar_aviso', methods=['POST'])
def agregar_aviso():
    if request.method == 'POST':
        iNumAsignatura = session['iNumAsignatura']
        vcTitulo = request.form['vcTitulo']
        vcCuerpo = request.form['vcCuerpo']
        dFecha = datetime.now()

        # Evaluamos request.form['bActivo'] para obtener un valor booleano
        if 'bActivo' in request.form:
            bActivo = True
        else:
            bActivo = False

        # Obtenemos el último iNumTema
        ultimo_iNumAviso = Aviso.query.order_by(Aviso.iNumAviso.desc()).first()

        if ultimo_iNumAviso is None:
            ultimo_iNumAviso = 1
        else:
            ultimo_iNumAviso = ultimo_iNumAviso.iNumAviso + 1

        nuevo_aviso = Aviso(iNumAviso=ultimo_iNumAviso,
                            iNumAsignatura=iNumAsignatura,
                            vcTitulo=vcTitulo,
                            vcCuerpo=vcCuerpo,
                            dFecha=dFecha,
                            bActivo=bActivo)

        db.session.add(nuevo_aviso)
        db.session.commit()

        # Redireccionamos a la página de temas
        return redirect(url_for('temas'))

@app.route('/modificar_aviso', methods=['POST'])
def modificar_aviso():
    if request.method == 'POST':

        if 'iNumAviso-editar' in request.form:
            iNumAviso = request.form['iNumAviso-editar']
            vcTitulo = request.form['vcTitulo']
            vcCuerpo = request.form['vcCuerpo']
            # Obtenemos la fecha actual
            dFecha = datetime.now()

            # Evaluamos request.form['bActivo'] para obtener un valor booleano
            if 'bActivo' in request.form:
                bActivo = True
            else:
                bActivo = False

            # Obtenemos el tema a modificar
            aviso = Aviso.query.filter_by(iNumAviso=iNumAviso, iNumAsignatura=session['iNumAsignatura']).first()
            aviso.vcTitulo = vcTitulo
            aviso.vcCuerpo = vcCuerpo
            aviso.dFecha = dFecha
            aviso.bActivo = bActivo

            db.session.commit()
        else:
            # Obtenemos el iNumTema a eliminar
            iNumAviso = request.form['iNumAviso-borrar']

            # Obtenemos el tema a eliminar
            aviso = Aviso.query.filter_by(iNumAviso=iNumAviso, iNumAsignatura=session['iNumAsignatura']).first()

            # Eliminamos el tema
            db.session.delete(aviso)
            db.session.commit()

        # Redireccionamos a la página de temas
        return redirect(url_for('temas'))

    return

@app.route('/actividad', methods=['GET','POST'])
def actividad():

    if not validar_session():
        return redirect(url_for('login'))

    # Verificamos si iNumContenido se encuentra en request.form
    if 'iNumContenido' not in request.form:
        iNumContenido = session['iNumContenido']
    else:
        iNumContenido = request.form['iNumContenido']
        session['iNumContenido'] = iNumContenido

    # if 'iNumContenido' not in session:
    #     iNumContenido = request.form['iNumContenido']
    #     session['iNumContenido'] = iNumContenido
    # else:
    #     iNumContenido = request.form['iNumContenido']

    # Obtenemos la información de la actividad donde iNumContenido = iNumContenido y iNumTema = session['idTemaAsig']
    # contenido = Contenido.query.filter_by(iNumContenido=iNumContenido, iNumTema=session['iNumTema']).first()
    contenido = Contenido.query.with_entities(Contenido.vcTitulo, Contenido.vcObjetivos, Contenido.dFecInicio,
                                              Contenido.dFecFin, Contenido.jActividad).filter_by(iNumContenido=iNumContenido, iNumTema=session['iNumTema']).first()

    fecha_inicio = contenido.dFecInicio.strftime('%d/%m/%Y')
    fecha_fin = contenido.dFecFin.strftime('%d/%m/%Y')

    # Susituimos \t por 4 espacios
    # contenido.vcObjetivos = contenido.vcObjetivos.replace('\t', '    ')
    objetivos = contenido.vcObjetivos.replace('\t', '    ')

    # Creamos un arreglo de objetivos
    objetivos = objetivos.split('\n')
    calificacion = None
    resultados_actividad = None
    actividadRegistrada = None

    # Validamos si el status de la actividad es 2
    # Si es 2, el usuario ya ha entregado la actividad
    usuario_actividad = UsuarioActividad.query.filter_by(iNumUsuario=session['iNumUsuario'], iNumContenido=iNumContenido, iTema=session['iNumTema']).first()
    if usuario_actividad:
        if usuario_actividad.iStatus == 3:
            # Obtenemos el resultado
            actividadRegistrada = True
            resultados_actividad = usuario_actividad.jResultado
            calificacion = usuario_actividad.icalificacion
        else:
            actividadRegistrada = True
            resultados_actividad = None
    else:
        calificacion = None

    # Realizamos la siguiente consulta
    # SELECT u."vcNombUsuario", ua."byActividad", ua."jResultado", ua."iTipoArchivo" FROM "TUSUARIO_ACTIVIDAD" AS ua
    # JOIN "TUSUARIO" as u ON ua."iNumUsuario" = u."iNumUsuario"
    # WHERE  ua."iTema" = 2 AND ua."iNumContenido" = 6

    resultado = db.session.execute(text('SELECT u."vcNombUsuario", ua."byActividad", ua."jResultado", ua."iTipoArchivo", ua."iNumUsuario", ua."icalificacion" '
                                            'FROM "TUSUARIO_ACTIVIDAD" AS ua '
                                            'JOIN "TUSUARIO" as u ON ua."iNumUsuario" = u."iNumUsuario" '
                                            'WHERE  ua."iTema" = :iTema AND ua."iNumContenido" = :iNumContenido'),
                                            {'iTema': session['iNumTema'], 'iNumContenido': iNumContenido})

    usuarios_actividad = resultado.fetchall()

    # Convertimos el resultado en un diccionario
    usuarios_actividad = [{"vcNombUsuario": usuario[0],
                           # Creamos el nombre del archivo = vcNombUsuario + "_Tema_" + iNumTema + "." + iTipoArchivo
                           "vcNombArchivo": f"{usuario[0]}_Tema_{session['iNumTema']}.{'txt' if usuario[3] == 1 else 'pdf' if usuario[3] == 2 else 'docx' if usuario[3] == 4 else ''}",
                           # Convertimos los bytes a string
                           "byActividad":  base64.b64encode(usuario[1].tobytes() if usuario[1] else None).decode('ASCII') ,
                           # Calculamos la calificacion
                           "calificacion": round(sum(usuario[2].values())/len(usuario[2])*10,3) if usuario[2] else 0.0,
                           "iNumUsuario": usuario[4],
                           "iCalificacion": usuario[5],
                           "iTipoArchivo": usuario[3]} for usuario in usuarios_actividad]

    # print(usuarios_actividad)

    return render_template('actividad.html',
                            iNumContenido=iNumContenido,
                            vcTitulo=contenido.vcTitulo,
                            objetivos=objetivos,
                            dFecInicio=fecha_inicio,
                            dFecFin=fecha_fin,
                            rubricas=contenido.jActividad,
                            actividadRegistrada=actividadRegistrada,
                            resultados_actividad=resultados_actividad,
                            calificacion=calificacion,
                            usuarios_actividad = usuarios_actividad,
                            iTipoUsuario=session['iTipoUsuario'])



@app.route('/archivo', methods=['GET', 'POST'])
def archivo():

    if not validar_session():
        return redirect(url_for('login'))

    iNumContenido = request.form['iNumContenido']
    session['iNumContenido'] = iNumContenido

    # Obtenemos la información del contenido
    contenido = Contenido.query.filter_by(iNumContenido=iNumContenido, iNumTema=session['iNumTema']).first()

    fecha_inicio = contenido.dFecInicio.strftime('%d/%m/%Y')
    fecha_fin = contenido.dFecFin.strftime('%d/%m/%Y')

    # Susituimos \t por 4 espacios
    contenido.vcObjetivos = contenido.vcObjetivos.replace('\t', '    ')

    # Creamos un arreglo de objetivos
    objetivos = contenido.vcObjetivos.split('\n')

    # Si el archivo no existe lo creamos
    if not os.path.exists(contenido.vcUrlVideo):
        with open(contenido.vcUrlVideo, 'wb') as f:
            f.write(contenido.byArchivo)

    archivos = [
        {"nombre": "Skype_Video.mp4",
         "path": contenido.vcUrlVideo},
    ]
    return render_template('archivo.html',
                           archivos=archivos,
                           vcTitulo=contenido.vcTitulo,
                           objetivos=objetivos,
                           dFecInicio=fecha_inicio,
                           dFecFin=fecha_fin,
                           iTipoUsuario=session['iTipoUsuario'])

@app.route('/video', methods=['GET', 'POST'])
def video():

    if not validar_session():
        return redirect(url_for('login'))

    iNumContenido = request.form['iNumContenido']
    session['iNumContenido'] = iNumContenido

    # Obtenemos la información del contenido
    contenido = Contenido.query.filter_by(iNumContenido=iNumContenido, iNumTema=session['iNumTema']).first()

    fecha_inicio = contenido.dFecInicio.strftime('%d/%m/%Y')
    fecha_fin = contenido.dFecFin.strftime('%d/%m/%Y')

    # Susituimos \t por 4 espacios
    contenido.vcObjetivos = contenido.vcObjetivos.replace('\t', '    ')

    # Creamos un arreglo de objetivos
    objetivos = contenido.vcObjetivos.split('\n')

    # Si el archivo no existe lo creamos
    if not os.path.exists(contenido.vcUrlVideo):
        with open(contenido.vcUrlVideo, 'wb') as f:
            f.write(contenido.byArchivo)

    videos = [
        {"nombre": "VIDEO_TIDI-IA.mp4",
         "path": contenido.vcUrlVideo},
    ]
    return render_template('video.html',
                            videos=videos,
                            vcTitulo=contenido.vcTitulo,
                            objetivos=objetivos,
                            dFecInicio=fecha_inicio,
                            dFecFin=fecha_fin,
                            iTipoUsuario=session['iTipoUsuario'])

@app.route('/crud_contenido', methods=['GET', 'POST'])
def crud_contenido():

    if not validar_session() and not request.is_json:
        return redirect(url_for('login'))

    if request.method == 'POST':

        # Validamos si la petición es de tipo JSON
        if request.is_json:
            contenido = request.get_json()
        else:
            contenido = request.form

        print(contenido)

        iNumTema = contenido.get('iNumTema')[0]
        vcTitulo = contenido.get('vcTitulo')
        vcObjetivos = contenido.get('vcObjetivos')
        dFecInicio = contenido.get('dFecInicio')
        dFecFin = contenido.get('dFecFin')

        # convertimos bActivo a booleano
        bActivo = contenido.get('bActivo') == 'True'

        iTipo = int(contenido.get('iTipo'))
        iAccion = int(contenido.get('iAccion'))

        match iTipo:
            case 1:
                match iAccion:
                    case 1:
                        # Registramos una actividad de aprendizaje
                        jActividad = contenido.get('registroCasos')

                        # Obtenemos el último iNumContenido
                        ultimo_iNumContenido = getNuevoContenidoTema(iNumTema)
                        session['iNumContenido'] = ultimo_iNumContenido
                        # Creamos un nuevo contenido
                        nuevo_contenido = Contenido(iNumContenido=ultimo_iNumContenido,iNumTema=iNumTema,vcTitulo=vcTitulo,
                                                    vcObjetivos=vcObjetivos,dFecInicio=dFecInicio,dFecFin=dFecFin,
                                                    bActivo=bActivo,iTipo=iTipo,jActividad=jActividad)
                        db.session.add(nuevo_contenido)
                        db.session.commit()
                    case 2:
                        # Actualizamos la actividad de aprendizaje
                        # Obtenemos el contenido a modificar en forma de entero
                        # iNumContenido = contenido.get('iNumContenido', type=int)
                        iNumContenido = contenido.get('iNumContenido', None)
                        # Convertimos el arreglo a entero
                        iNumContenido = int(iNumContenido[0]) if isinstance(iNumContenido, list) else int(iNumContenido)
                        session['iNumContenido'] = iNumContenido
                        contenido_actual = Contenido.query.filter_by(iNumContenido=iNumContenido, iNumTema=iNumTema).first()
                        contenido_actual.vcTitulo = vcTitulo
                        contenido_actual.vcObjetivos = vcObjetivos
                        contenido_actual.dFecInicio = dFecInicio
                        contenido_actual.dFecFin = dFecFin
                        contenido_actual.bActivo = bActivo
                        contenido_actual.jActividad = contenido.get('registroCasos')

                        db.session.commit()
                    case 3:
                        # Eliminamos la actividad de aprendizaje
                        iNumContenido = contenido.get('iNumContenido', None)
                        # Convertimos el arreglo a entero
                        iNumContenido = int(iNumContenido[0]) if isinstance(iNumContenido, list) else int(iNumContenido)
                        if 'iNumContenido' in session:
                            session.pop('iNumContenido')
                            session.modified = True
                        contenido_actual = Contenido.query.filter_by(iNumContenido=iNumContenido, iNumTema=iNumTema).first()

                        db.session.delete(contenido_actual)
                        db.session.commit()
            case 2:
                if iAccion != 3:
                    # Validamos que request.files contenga un archivo
                    if 'file' not in request.files:
                        print('No se ha seleccionado ningún archivo')
                    else:
                        archivo = request.files['file']
                        if archivo.filename == '':
                            if iAccion == 2:
                                # Obtenemos el contenido a modificar
                                iNumContenido = contenido.get('iNumContenido')
                                session['iNumContenido'] = iNumContenido
                                contenido_actual = Contenido.query.filter_by(iNumContenido=iNumContenido, iNumTema=iNumTema).first()
                                contenido_actual.vcTitulo = vcTitulo
                                contenido_actual.vcObjetivos = vcObjetivos
                                contenido_actual.dFecInicio = dFecInicio
                                contenido_actual.dFecFin = dFecFin
                                contenido_actual.bActivo = bActivo
                                contenido_actual.iTipo = iTipo
                                db.session.commit()
                            else:
                                print('No se ha seleccionado ningún archivo')
                        elif archivo and archivoPermitido(archivo.filename):
                            # Actualizamos el nombre del archivo a uno seguro
                            #  luego lo guardamos en la ruta: url_for('static', filename='assets/videos/')
                            archivo.filename = secure_filename(archivo.filename)
                            if iAccion == 1:
                                vcUrlVideo = "./static/assets/videos/" + archivo.filename
                                # Obtenemos el último iNumContenido
                                ultimo_iNumContenido = getNuevoContenidoTema(iNumTema)
                                session['iNumContenido'] = ultimo_iNumContenido

                                # Creamos un nuevo contenido
                                nuevo_contenido = Contenido(iNumContenido=ultimo_iNumContenido,
                                                            iNumTema=iNumTema,
                                                            vcTitulo=vcTitulo,
                                                            vcObjetivos=vcObjetivos,
                                                            dFecInicio=dFecInicio,
                                                            dFecFin=dFecFin,
                                                            bActivo=bActivo,
                                                            iTipo=iTipo,
                                                            vcUrlVideo=vcUrlVideo,
                                                            byArchivo=archivo.read())

                                db.session.add(nuevo_contenido)
                                db.session.commit()
                            else:
                                # Obtenemos el contenido a modificar
                                iNumContenido = contenido.get('iNumContenido')
                                session['iNumContenido'] = iNumContenido
                                contenido_actual = Contenido.query.filter_by(iNumContenido=iNumContenido, iNumTema=iNumTema).first()
                                contenido_actual.vcTitulo = vcTitulo
                                contenido_actual.vcObjetivos = vcObjetivos
                                contenido_actual.dFecInicio = dFecInicio
                                contenido_actual.dFecFin = dFecFin
                                contenido_actual.bActivo = bActivo
                                contenido_actual.iTipo = iTipo

                                # Si el video existe lo eliminamos en la ruta previa
                                if os.path.exists(contenido_actual.vcUrlVideo):
                                    os.remove(contenido_actual.vcUrlVideo)

                                # Actualizamos la ruta del archivo
                                contenido_actual.vcUrlVideo = "./static/assets/videos/" + archivo.filename
                                contenido_actual.byArchivo = archivo.read()

                                db.session.commit()
                else:
                    # Obtenemos el contenido a eliminar
                    iNumContenido = contenido.get('iNumContenido')
                    if 'iNumContenido' in session:
                        session.pop('iNumContenido')
                        session.modified = True
                    contenido_actual = Contenido.query.filter_by(iNumContenido=iNumContenido, iNumTema=iNumTema).first()

                    # Eliminamos el archivo en la ruta previa
                    if os.path.exists(contenido_actual.vcUrlVideo):
                        os.remove(contenido_actual.vcUrlVideo)

                    # Eliminamos el contenido
                    db.session.delete(contenido_actual)

                    db.session.commit()

            case 3:
                if iAccion != 3:
                    # Validamos que request.files contenga un archivo
                    if 'file' not in request.files:
                        print('No se ha seleccionado ningún archivo')
                    else:
                        archivo = request.files['file']
                        if archivo.filename == '':
                            if iAccion == 2:
                                # Obtenemos el contenido a modificar
                                iNumContenido = contenido.get('iNumContenido')
                                session['iNumContenido'] = iNumContenido
                                contenido_actual = Contenido.query.filter_by(iNumContenido=iNumContenido, iNumTema=iNumTema).first()
                                contenido_actual.vcTitulo = vcTitulo
                                contenido_actual.vcObjetivos = vcObjetivos
                                contenido_actual.dFecInicio = dFecInicio
                                contenido_actual.dFecFin = dFecFin
                                contenido_actual.bActivo = bActivo
                                contenido_actual.iTipo = iTipo
                                db.session.commit()
                            else:
                                print('No se ha seleccionado ningún archivo')
                        elif archivo and archivoPermitido(archivo.filename):
                            # Actualizamos el nombre del archivo a uno seguro
                            #  luego lo guardamos en la ruta: url_for('static', filename='assets/videos/')
                            archivo.filename = secure_filename(archivo.filename)
                            if iAccion == 1:
                                vcUrlArchivo = "./static/assets/archivos/" + archivo.filename
                                # Obtenemos el último iNumContenido
                                ultimo_iNumContenido = getNuevoContenidoTema(iNumTema)
                                session['iNumContenido'] = ultimo_iNumContenido

                                # Creamos un nuevo contenido
                                nuevo_contenido = Contenido(iNumContenido=ultimo_iNumContenido,
                                                            iNumTema=iNumTema,
                                                            vcTitulo=vcTitulo,
                                                            vcObjetivos=vcObjetivos,
                                                            dFecInicio=dFecInicio,
                                                            dFecFin=dFecFin,
                                                            bActivo=bActivo,
                                                            iTipo=iTipo,
                                                            vcUrlVideo=vcUrlArchivo,
                                                            byArchivo=archivo.read())

                                db.session.add(nuevo_contenido)
                                db.session.commit()
                            else:
                                # Obtenemos el contenido a modificar
                                iNumContenido = contenido.get('iNumContenido')
                                session['iNumContenido'] = iNumContenido
                                contenido_actual = Contenido.query.filter_by(iNumContenido=iNumContenido, iNumTema=iNumTema).first()
                                contenido_actual.vcTitulo = vcTitulo
                                contenido_actual.vcObjetivos = vcObjetivos
                                contenido_actual.dFecInicio = dFecInicio
                                contenido_actual.dFecFin = dFecFin
                                contenido_actual.bActivo = bActivo
                                contenido_actual.iTipo = iTipo

                                # Si el archivo existe lo eliminamos en la ruta previa
                                if os.path.exists(contenido_actual.vcUrlVideo):
                                    os.remove(contenido_actual.vcUrlVideo)

                                # Actualizamos la ruta del archivo
                                contenido_actual.vcUrlVideo = "./static/assets/archivos/" + archivo.filename
                                contenido_actual.byArchivo = archivo.read()

                                db.session.commit()
                else:
                    # Obtenemos el contenido a eliminar
                    iNumContenido = contenido.get('iNumContenido')
                    if 'iNumContenido' in session:
                        session.pop('iNumContenido')
                        session.modified = True
                    contenido_actual = Contenido.query.filter_by(iNumContenido=iNumContenido, iNumTema=iNumTema).first()

                    # Eliminamos el archivo en la ruta previa
                    if os.path.exists(contenido_actual.vcUrlVideo):
                        os.remove(contenido_actual.vcUrlVideo)

                    # Eliminamos el contenido
                    db.session.delete(contenido_actual)

                    db.session.commit()

            case _:
                print('Invalid option')

        # redireccionamos a la página de crud-contenido
        if request.is_json:
            return jsonify({'mensaje': 'Contenido registrado correctamente'}), 200
        else:
            return redirect(url_for('crud_contenido'))
    else:
        if 'iNumAsignatura' in session:
            # Obtenemos los temas de la asignatura en orden ascendente
            temas = Tema.query.filter_by(iNumAsignatura=session['iNumAsignatura']).order_by(Tema.iNumTema.asc()).all()

            if 'iNumTema' in session:
                temaActual = int(session['iNumTema'])
            else:
                temaActual = None

            # Obtenemos los contenidos del tema
            # contenidos = Contenido.query.filter_by(iNumTema=temaActual).order_by(Contenido.iNumContenido.asc()).all()
            contenidos = Contenido.query.with_entities(Contenido.vcTitulo, Contenido.iNumContenido,
                                                       Contenido.iTipo).filter_by(iNumTema=temaActual).order_by(
                                                        Contenido.iNumContenido.asc()).all()
            contenidoActual = None

            if 'iNumContenido' in session:
                # contenido_actual = Contenido.query.filter_by(iNumContenido=session['iNumContenido']).first()
                contenido_actual = Contenido.query.with_entities(Contenido.iTipo, Contenido.vcTitulo,
                                                                Contenido.vcObjetivos, Contenido.dFecInicio,
                                                                Contenido.dFecFin, Contenido.bActivo).filter_by(
                                                                iNumContenido=session['iNumContenido'],
                                                                iNumTema=temaActual).first()
                contenidoActual = int(session['iNumContenido'])
                iTipo = contenido_actual.iTipo
                vcTitulo = contenido_actual.vcTitulo
                vcObjetivos = contenido_actual.vcObjetivos
                dFecInicio = contenido_actual.dFecInicio
                dFecFin = contenido_actual.dFecFin
                bActivo = contenido_actual.bActivo
            else:
                contenidoActual = 0
                iTipo = None
                vcTitulo = None
                vcObjetivos = None
                dFecInicio = None
                dFecFin = None
                bActivo = None

            return render_template('crud-contenido.html',
                                    temas=temas,
                                    temaActual=temaActual,
                                    contenidos=contenidos,
                                    contenidoActual=contenidoActual,
                                    iTipo=iTipo,
                                    vcTitulo=vcTitulo,
                                    vcObjetivos=vcObjetivos,
                                    dFecInicio=dFecInicio,
                                    dFecFin=dFecFin,
                                    bActivo=bActivo)

        else:
            return redirect('/')

@app.route('/registrar_actividad', methods=['POST'])
def registrar_actividad ():

    if request.method == 'POST':
        # Verificamos si se encuentra la parte de archivos
        if 'file' not in request.files:
            return jsonify({'mensaje': 'No se ha seleccionado ningún archivo'}), 400

        archivo = request.files['file']
        if archivo.filename == '':
            return jsonify({'mensaje': 'No se ha seleccionado ningún archivo'}), 400

        if archivo and archivoPermitido(archivo.filename):
            # Actualizamos el nombre del archivo a uno seguro
            #  luego lo convertimos a bytes para guardarlo en la base de datos
            archivo.filename = secure_filename(archivo.filename)
            archivo_bytes = archivo.read()

            # Obtenemos el tipo de archivo
            # 1 = Archivo de texto
            # 2 = Archivo pdf
            # 3 = Archivo doc
            # 4 = Archivo docx
            tipo = archivo.filename.rsplit('.', 1)[1].lower()
            if tipo == 'txt':
                tipo = 1
            elif tipo == 'pdf':
                tipo = 2
            elif tipo == 'doc':
                tipo = 3
            elif tipo == 'docx':
                tipo = 4

            # Validamos si el usuario ya ha registrado la actividad previamente
            actividad_existente = UsuarioActividad.query.filter_by(iNumUsuario=session['iNumUsuario'],iNumContenido=session['iNumContenido']).first()

            if not actividad_existente:
                # Registramos al usuario y la actividad
                usuario_actividad = UsuarioActividad(iNumUsuario=session['iNumUsuario'],
                                                    iNumContenido=session['iNumContenido'],
                                                    byActividad=archivo_bytes,
                                                    iStatus=1,
                                                    vcNombArchivo=archivo.filename,
                                                    iTipoArchivo=tipo,
                                                    iTema= session['iNumTema'])

                db.session.add(usuario_actividad)
                db.session.commit()

            # procesar_actividad(session['iNumUsuario'], session['iNumContenido'])

            # Redireccionamos a la página de actividad
            return redirect(url_for('actividad'))
    else:
        return redirect(url_for('actividad'))

@app.route('/obtener_contenidos', methods=['POST'])
def obtener_contenidos():
    iNumTema = request.get_json().get('iNumTema')

    # Obtenemos los contenidos del tema
    # contenidos = Contenido.query.filter_by(iNumTema=iNumTema[0]).order_by(Contenido.iNumContenido.asc()).all()
    contenidos = Contenido.query.with_entities(Contenido.iNumContenido, Contenido.vcTitulo).filter_by(iNumTema=iNumTema[0]).order_by(Contenido.iNumContenido.asc()).all()
    #Convertimos los contenidos a un arreglo
    contenidos_dict = []
    for contenido in contenidos:
        contenidos_dict.append({'iNumContenido': contenido.iNumContenido,
                                'vcTitulo': contenido.vcTitulo})

    return jsonify(contenidos_dict)


@app.route('/obtener_info_general_contenido', methods=['GET','POST'])
def obtener_info_general_contenido():
    iNumTema = request.get_json().get('iNumTema')
    iNumContenido = request.get_json().get('iNumContenido')

    # Obtenemos el contenido
    contenido = Contenido.query.filter_by(iNumContenido=iNumContenido[0], iNumTema=iNumTema[0]).first()

    return jsonify({'vcTitulo': contenido.vcTitulo,
                    'vcObjetivos': contenido.vcObjetivos,
                    'dFecInicio': contenido.dFecInicio.strftime('%Y-%m-%d'),
                    'dFecFin': contenido.dFecFin.strftime('%Y-%m-%d'),
                    'bActivo': contenido.bActivo,
                    'iTipo': contenido.iTipo})

@app.route('/obtener_casos', methods=['POST'])
def obtener_casos():
    iNumTema = request.get_json().get('iNumTema')
    iNumContenido = request.get_json().get('iNumContenido')

    # Obtenemos el contenido
    contenido = Contenido.query.filter_by(iNumContenido=iNumContenido[0], iNumTema=iNumTema[0]).first()

    return jsonify(contenido.jActividad)

@app.route('/procesar_actividad', methods=['POST'])
def procesar_actividad (iNumUsuario = None, iNumContenido = None, procesar_todas = False):

    # Obtenemos los datos del formulario
    if iNumUsuario is None and iNumContenido is None:
        iNumUsuario = request.form.get('iNumUsuario', None)
        iNumContenido = request.form.get('iNumContenido', None)

    if iNumUsuario is None or iNumContenido is None:

        # Obtenemos todas las actividades registradas en la tabla UsuarioActividad
        actividades = UsuarioActividad.query.filter_by(iNumContenido=session['iNumContenido'], iTema=session['iNumTema'], iStatus = 1).all()

        for actividad in actividades:
            print("Procesando actividad: ", actividad.vcNombArchivo)
            procesar_actividad(actividad.iNumUsuario, actividad.iNumContenido, procesar_todas=True)

        # Obtenemos todas las actividades registradas en la tabla UsuarioActividad con jResultado en None
        actividades = UsuarioActividad.query.filter_by(iNumContenido=session['iNumContenido'], iTema=session['iNumTema'], jResultado=None).all()

        for actividad in actividades:
            print("Procesando actividad: ", actividad.vcNombArchivo)
            procesar_actividad(actividad.iNumUsuario, actividad.iNumContenido, procesar_todas=True)

        return redirect(url_for('actividad'))
    else:

        # Obtenemos la actividad del usuario
        actividad = UsuarioActividad.query.filter_by(iNumUsuario=iNumUsuario, iNumContenido=iNumContenido, iTema=session['iNumTema']).first()

        # Obtenemos el contenido de la actividad
        texto_actividad = leer_contenido_archivo(actividad.byActividad, actividad.iTipoArchivo)

        # Obtenemos el contenido
        contenido = Contenido.query.filter_by(iNumContenido=iNumContenido, iNumTema=session['iNumTema']).first()
        jActividad = contenido.jActividad

        # Iniciamos un cronometro para medir el tiempo de procesamiento
        start = time.time()
        resultados_actividad = procesarActividad(jActividad, texto_actividad)

        # Detenemos el cronometro
        end = time.time()
        print(f"Tiempo de procesamiento: {end - start}")

        # Registramos los resultados de la actividad
        registrarResultados(iNumUsuario, iNumContenido, resultados_actividad)

        if procesar_todas:
            return 1
        else:
            return redirect(url_for('actividad'))


@app.route('/asignar_calificacion', methods=['POST'])
def asignar_calificacion ():

    if request.method == 'POST':
        iNumUsuario = request.form['iNumUsuario']
        iNumContenido = session['iNumContenido']
        icalificacion = request.form['iCalificacion']

        # Obtenemos la actividad del usuario
        usuario_actividad = UsuarioActividad.query.filter_by(iNumUsuario=iNumUsuario, iNumContenido=iNumContenido, iTema=session['iNumTema']).first()

        # Actualizamos la calificacion
        usuario_actividad.icalificacion = icalificacion
        usuario_actividad.iStatus = 3

        db.session.commit()

        return redirect(url_for('actividad'))


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)

    # serve(app, host='127.0.0.1', port=1234, url_prefix='/TIDI-IA')

    # if mode == 'dev':
    #     app.run(debug=True)
    # else:
    #     serve(app, host='127.0.0.1', port=1234, url_prefix='/TIDI-IA')

