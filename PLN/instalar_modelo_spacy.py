import pip

def install_whl(path):
    pip.main(['install', path])

install_whl("es_core_news_lg-3.8.0-py3-none-any.whl")