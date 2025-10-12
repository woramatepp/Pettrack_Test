import ngrok

listener = ngrok.forward("localhost:8080", authtoken_from_env=True)

print(f"Ingress established at: {listener.url()}");
