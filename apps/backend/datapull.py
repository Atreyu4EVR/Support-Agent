import os

from dotenv import load_dotenv
import pandas as pd
import psycopg2

load_dotenv()

# Connect to PostgreSQL
conn = psycopg2.connect(
    dbname=os.getenv("POSTGRES_DB"),
    user=os.getenv("POSTGRES_USER"),
    password=os.getenv("POSTGRES_PASSWORD"),
    host=os.getenv("POSTGRES_HOST"),
    port="5432"
)


# Load SQL into a DataFrame
df = pd.read_sql("SELECT * FROM webpage_list", conn)

# Save to Excel
df.to_excel("../../documents/output.xlsx", index=False)