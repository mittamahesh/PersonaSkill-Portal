import os

class Config:
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'mssql+pyodbc://SA:Mitta132@localhost/mydb?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = 'thisismysecretkey'
