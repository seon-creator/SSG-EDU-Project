# run.py
from app import create_app

app = create_app()

if __name__ == '__main__':
  for rule in app.url_map.iter_rules():
      print(f"{rule.endpoint}: {rule.methods} - {rule}")
  app.run(debug=True, port=2610)