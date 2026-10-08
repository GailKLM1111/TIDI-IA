import spacy
import difflib

from spacy.matcher import PhraseMatcher, Matcher
from spacy.tokens import Span
# from sklearn.feature_extraction.text import TfidfVectorizer
# from sklearn import svm
#
# import es_core_news_md
import es_core_news_lg


class EvaluarRespuestas:

    # EvaluarRespuestas = EvaluarRespuestas()

    def buscar_frase_semantica(self, texto: str, frase_a_buscar: str):

        # Carga el modelo en español
        # nlp = spacy.load('es_core_news_md')
        nlp = es_core_news_lg.load()

        # Procesa el texto y la frase a buscar con el modelo en español
        doc_texto = nlp(texto)
        doc_frase = nlp(frase_a_buscar)

        # Inicializa la mejor coincidencia y su similitud
        mejor_coincidencia = None
        mayor_similitud = 0

        # Compara la similitud semántica de la frase buscada con cada oración del texto
        for sent in doc_texto.sents:
            similitud = doc_frase.similarity(sent)
            if similitud > mayor_similitud:
                mayor_similitud = similitud
                mejor_coincidencia = sent.text

        # Devuelve la oración con la mayor similitud semántica
        return mejor_coincidencia if mejor_coincidencia else False

    def calcular_similitud(self, respuesta_usuario, pregunta):
        # Cargar el modelo de lenguaje
        nlp = es_core_news_lg.load()

        # Procesar la pregunta y la respuesta del usuario
        doc_pregunta = nlp(pregunta)
        doc_respuesta = nlp(respuesta_usuario)

        # Calcular la similitud (coeficiente de similitud de coseno)
        similitud = doc_pregunta.similarity(doc_respuesta)

        # Asignar calificación
        if similitud >= 0.9:
            calificacion = 1
        elif similitud <= 0.1:
            calificacion = 0
        else:
            # Puedes ajustar estos umbrales según tus necesidades
            calificacion = (similitud - 0.1) / 0.8  # Escala lineal

        return round(calificacion, 2)

    def buscar_frase_aproximada(self, texto, frase_a_buscar):
        # Procesa el texto con el modelo en español
        nlp = spacy.load('es_core_news_md')
        # doc = nlp(texto)
        doc = nlp(texto)

        # Lista para guardar las oraciones y sus ratios de coincidencia
        coincidencias = []

        # Busca la frase en el texto y calcula el ratio de coincidencia
        for sent in doc.sents:
            ratio = difflib.SequenceMatcher(None, frase_a_buscar, sent.text).ratio()
            coincidencias.append((sent.text, ratio))

        # Encuentra la oración con el mayor ratio de coincidencia
        oracion_mas_cercana, _ = max(coincidencias, key=lambda x: x[1])

        return oracion_mas_cercana

    def buscar_frase(self, texto, frase_a_buscar):
        # Procesa el texto con el modelo en español

        # modelo_bin = pkgutil.get_data('es_core_news_md', 'es_core_news_md-2.3.0')
        # nlp = spacy.load('es_core_news_md')
        # print(nlp._path)
        # nlp = spacy.load(modelo_bin)
        nlp = es_core_news_lg.load()

        doc = nlp(texto)

        # doc = nlp(frase)

        # Busca la frase en el texto
        for sent in doc.sents:
            if frase_a_buscar in sent.text:
                return True
        return False

    # Función para evaluar las respuestas utilizando spaCy
    def evaluar_con_spacy(self, dataframe, respuesta_usuario):
        # Cargar el modelo de lenguaje
        nlp = es_core_news_md.load()

        # Convertir las respuestas correctas a documentos spaCy
        docs_correctos = list(nlp.pipe(dataframe['respuesta']))
        longitud_total_correcta = sum(len(doc) for doc in docs_correctos)

        # Crear un PhraseMatcher y añadir las respuestas correctas
        matcher = PhraseMatcher(nlp.vocab)
        patterns = [nlp.make_doc(text) for text in dataframe['respuesta']]
        matcher.add("RespuestasCorrectas", patterns)

        # Procesar la respuesta del usuario con spaCy
        doc_usuario = nlp(respuesta_usuario)

        # Encontrar coincidencias con las respuestas correctas
        matches = matcher(doc_usuario)

        # Evaluar las coincidencias para asignar una calificación
        calificacion = 0
        for match_id, start, end in matches:
            span = Span(doc_usuario, start, end, label=match_id)
            # Lógica para asignar una calificación basada en la coincidencia
            calificacion += len(span.text)

        # Normalizar la calificación
        calificacion /= longitud_total_correcta

        # Calcular la similitud semántica
        similitud = max(doc_usuario.similarity(doc) for doc in docs_correctos)

        # Combinar la coincidencia exacta con la similitud semántica
        calificacion_final = (calificacion + similitud) / 2

        return calificacion_final

    def crear_lemma_tokens_dataframe(self, dataframe):
        # Cargar el modelo de lenguaje
        nlp = es_core_news_lg.load()

        # Crear una lista de tokens lematizados para cada respuesta
        tokens = []
        for respuesta in dataframe['respuesta']:
            doc = nlp(respuesta)
            lemmas = [token.lemma_ for token in doc]
            tokens.append(' '.join(lemmas))

        return tokens

    def crear_lemma_tokens(self, texto):
        # Cargar el modelo de lenguaje
        nlp = es_core_news_lg.load()

        # Procesar el texto y obtener los lemas de cada token
        doc = nlp(texto)
        lemmas = [token.lemma_ for token in doc]

        return [' '.join(lemmas)]

    def crear_patron (self, texto):
        # Cargar el modelo de lenguaje
        nlp = es_core_news_lg.load()

        # Procesar el texto y obtener los lemas de cada token
        # omitiendo los signos de puntuación y los espacios en blanco
        # al igual que palabras de conexión
        doc = nlp(texto)
        lemmas = [token.lemma_ for token in doc if not token.is_punct and not token.is_space and not token.is_stop]

        return lemmas

    def buscar_frase_con_patron(self, texto, frase_a_buscar):
        # Cargar el modelo de lenguaje
        nlp = es_core_news_lg.load()

        # Crear un PhraseMatcher y añadir el patrón de la frase a buscar
        phrase_matcher = PhraseMatcher(nlp.vocab, attr='LOWER')

        # Tokenizar y lematizar la frase a buscar
        tokens_frase = nlp(nlp(frase_a_buscar).text.lower())
        lemas_frase = [token.lemma_ for token in tokens_frase if not token.is_space and not token.is_stop]

        # Convertimos lemas_frase a un string
        patrones = [nlp(' '.join(lemas_frase))]

        # Añadir los patrones al PhraseMatcher
        phrase_matcher.add("FRASES", patrones)

        tokens_frase = nlp(nlp(texto).text.lower())
        lemas_frase = [token.lemma_ for token in tokens_frase if not token.is_space and not token.is_stop]
        doc = nlp(' '.join(lemas_frase))

        # Encontrar coincidencias con el patrón
        matches = phrase_matcher(doc)

        for match_id, start, end in matches:
            span = doc[start:end]
            # print(span.text)
            return True

        return False

    def encontrar_texto_en_texto(self, principal, secundario):
        # Cargar el modelo de SpaCy en español
        # nlp = spacy.load("es_core_news_md")
        nlp = es_core_news_lg.load()

        # Procesar el texto principal
        doc1 = nlp(principal)

        # Procesar el texto secundario y dividirlo en fragmentos
        doc2 = nlp(secundario)
        fragmentos = [sent for sent in doc2.sents]

        umbral = 0.7
        for fragmento in fragmentos:
            similitud = doc1.similarity(fragmento)
            if similitud > umbral:
                return True, similitud, fragmento.text, principal

        return False, similitud, None, principal



# def evaluar_con_spacy(self, dataframe, respuesta_usuario):
    #     # Convertir las respuestas correctas a documentos spaCy
    #     nlp = es_core_news_lg.load()
    #     docs = list(nlp.pipe(dataframe['respuesta']))
    #
    #     # Crear un PhraseMatcher y añadir las respuestas correctas
    #     matcher = PhraseMatcher(nlp.vocab)
    #     patterns = [nlp.make_doc(text) for text in dataframe['respuesta']]
    #     matcher.add("RespuestasCorrectas", patterns)
    #
    #     # Procesar la respuesta del usuario con spaCy
    #     doc_usuario = nlp(respuesta_usuario)
    #
    #     # Encontrar coincidencias con las respuestas correctas
    #     matches = matcher(doc_usuario)
    #
    #     # Evaluar las coincidencias para asignar una calificación
    #     calificacion = 0
    #     for match_id, start, end in matches:
    #         span = Span(doc_usuario, start, end, label=match_id)
    #         # Lógica para asignar una calificación
    #         # basada en la coincidencia de la respuesta del usuario con las respuestas correctas
    #         calificacion += len(span.text) / len(doc_usuario.text)
    #
    #     return calificacion
