FROM python:3.12

WORKDIR /TIDI-IA

COPY PLN ./PLN
COPY static ./static
COPY templates ./templates
COPY app.py ./
#COPY prod.py ./
#COPY .venv ./.venv

RUN pip3 install ./PLN/es_core_news_lg-3.8.0-py3-none-any.whl

COPY requirements.txt ./
RUN pip3 install --upgrade pip && pip install --no-cache-dir -r requirements.txt

EXPOSE 5000

# Ejecutamos el siguiente comando: python -m spacy download es_core_news_lg
RUN #python -m spacy download es_core_news_lg

# Corremos el script


# Ejecutamos el siguiente comando: waitress-serve --url-prefix=/TIDI-IA --listen=127.0.0.1:1234 app:app
#CMD ["waitress-serve", "--url-prefix=/TIDI-IA", "--listen=127.0.0.1:1234", "app:app"]
CMD ["python", "app.py"]