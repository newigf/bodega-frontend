# Bodega Online - Frontend
Componente de presentación (React + Vite, servido con nginx).

## Ejecutar con Docker
    docker build -t bodega-frontend --build-arg VITE_API_URL=http://localhost:3000 .
    docker run -p 8080:80 bodega-frontend

Abrir http://localhost:8080
